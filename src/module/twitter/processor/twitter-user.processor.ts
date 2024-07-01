import { Processor } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { BaseProcessor } from '../../../shared/base/base.processor'
import { Logger } from '../../../shared/logger/logger'
import { NumberUtil } from '../../../shared/util/number.util'
import { TWITTER_USER_QUEUE_NAME } from '../constant/twitter.constant'
import { TwitterUserService } from '../service/twitter-user.service'

@Processor(TWITTER_USER_QUEUE_NAME, {
  // autorun: false,
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
    const { username } = data
    if (!username) {
      job.discard()
      return null
    }

    let user = await this.twitterUserService.getByUsername(username)
    if (user) {
      await job.updateProgress(100)
      return user
    }

    user = await this.twitterUserService.fetchByUsername(username)
    await job.updateProgress(100)
    return user
  }
}
