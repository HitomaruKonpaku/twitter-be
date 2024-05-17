import { OnWorkerEvent, Processor } from '@nestjs/bullmq'
import { Job, Worker } from 'bullmq'
import { BaseProcessor } from '../../../shared/base/base.processor'
import { Logger } from '../../../shared/logger/logger'
import { NumberUtil } from '../../../shared/util/number.util'
import { TwitterApi } from '../api/twitter.api'
import { TWITTER_SPACE_QUEUE_NAME } from '../constant/twitter.constant'
import { TwitterSpaceState } from '../enum/twitter-space.enum'
import { TwitterSpace } from '../model/twitter-space.entity'
import { TwitterSpaceService } from '../service/twitter-space.service'
import { TwitterSpaceUtil } from '../util/twitter-space.util'

@Processor(TWITTER_SPACE_QUEUE_NAME, {
  // autorun: false,
  limiter: {
    max: NumberUtil.parse(process.env.TWITTER_SPACE_QUEUE_LIMITER_MAX, 1),
    duration: NumberUtil.parse(process.env.TWITTER_SPACE_QUEUE_LIMITER_DURATION, 0),
  },
})
export class TwitterSpaceProcessor extends BaseProcessor {
  protected readonly logger = new Logger(TwitterSpaceProcessor.name)

  private timeoutId: any

  constructor(
    private readonly twitterApi: TwitterApi,
    private readonly twitterSpaceService: TwitterSpaceService,
  ) {
    super()
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    super.onCompleted(job)

    const space = job.returnvalue as TwitterSpace
    if ([TwitterSpaceState.ENDED, TwitterSpaceState.CANCELED].includes(space?.state)) {
      job.remove({ removeChildren: true })
        .then(() => this.logger.log(`removeJob: ${job.id}`))
        .catch((error) => this.logger.error(`removeJob: ${error.message}`, null, { id: job.id }))
    }
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { data } = job
    const id = TwitterSpaceUtil.parseId(data.id || '')
    if (!id) {
      job.discard()
      return null
    }

    const space = await this.twitterSpaceService.fetchById(id)
    if (!space) {
      const rateLimit = this.twitterApi.getRateLimitByName('AudioSpaceById')
      if (rateLimit) {
        if (!rateLimit.remaining) {
          const duration = rateLimit.reset - Date.now() + 1000
          this.logger.warn('rateLimit', { duration })
          await this.worker.rateLimit(1000)
          setTimeout(() => this.pause(duration))
          throw Worker.RateLimitError()
        }
      }
      throw new Error('Space not found')
    }

    await job.updateProgress(100)
    return space
  }

  private async pause(duration?: number) {
    if (this.timeoutId || this.worker.isPaused()) {
      return
    }

    await this.worker.pause()

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null
      this.worker.resume()
    }, duration)
  }
}
