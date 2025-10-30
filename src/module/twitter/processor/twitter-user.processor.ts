import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { BaseProcessor } from '../../../shared/base/base.processor'
import { Logger } from '../../../shared/logger'
import { NumberUtil } from '../../../shared/util/number.util'
import { TWITTER_USER_QUEUE_NAME } from '../constant/twitter.constant'
import { TwitterUser } from '../model/twitter-user.entity'
import { TwitterUserService } from '../service/twitter-user.service'

@Processor(TWITTER_USER_QUEUE_NAME, {
  autorun: true,
  concurrency: NumberUtil.parse(process.env.TWITTER_USER_QUEUE_CONCURRENCY, 1),
  maxStalledCount: NumberUtil.parse(process.env.QUEUE_MAX_STALLED_COUNT, 100),
  limiter: {
    max: NumberUtil.parse(process.env.TWITTER_USER_QUEUE_LIMITER_MAX, 1),
    duration: NumberUtil.parse(process.env.TWITTER_USER_QUEUE_LIMITER_DURATION, 0),
  },
})
export class TwitterUserProcessor extends BaseProcessor {
  protected readonly logger = new Logger(TwitterUserProcessor.name)

  constructor(
    private readonly twitterUserService: TwitterUserService,
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { data } = job
    const { id, username } = data

    let user: TwitterUser
    if (id) {
      user = await this.twitterUserService.getById(id)
    } else if (username) {
      user = await this.twitterUserService.getByUsername(username)
    }

    if (user) {
      const maxAge = NumberUtil.parse(process.env.TWITTER_USER_MAX_AGE, 24 * 60 * 60) * 1000
      const now = Date.now()
      const age = now - (user.updatedAt || now)
      if (age < maxAge) {
        await job.updateProgress(100)
        return {
          _isNew: false,
          ...user,
        }
      }
    }

    if (!username) {
      return {
        _isNew: false,
        user: null,
      }
    }

    user = await this.twitterUserService.fetchByUsername(username)
    await job.updateProgress(100)
    return {
      _isNew: true,
      ...user,
    }
  }
}
