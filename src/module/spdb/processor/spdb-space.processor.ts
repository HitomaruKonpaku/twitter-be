import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Job, Worker } from 'bullmq'
import { Logger } from '../../../shared/logger/logger'
import { NumberUtil } from '../../../shared/util/number.util'
import { TwitterApi } from '../../twitter/api/twitter.api'
import { TwitterSpaceState } from '../../twitter/enum/twitter-space.enum'
import { TwitterSpace } from '../../twitter/model/twitter-space.entity'
import { TwitterSpaceRepository } from '../../twitter/repository/twitter-space.repository'
import { TwitterSpaceService } from '../../twitter/service/twitter-space.service'
import { TwitterSpaceUtil } from '../../twitter/util/twitter-space.util'
import { SPDB_SPACE_QUEUE_NAME } from '../constant/spdb.constant'

@Processor(SPDB_SPACE_QUEUE_NAME, {
  limiter: {
    max: NumberUtil.parse(process.env.SPACE_QUEUE_LIMITER_MAX, 1),
    duration: NumberUtil.parse(process.env.SPACE_QUEUE_LIMITER_DURATION, 0),
  },
})
export class SpdbSpaceProcessor extends WorkerHost {
  private readonly logger = new Logger(SpdbSpaceProcessor.name)

  private timeoutId: any

  constructor(
    private readonly twitterApi: TwitterApi,
    private readonly twitterSpaceService: TwitterSpaceService,
    private readonly twitterSpaceRepository: TwitterSpaceRepository,
  ) {
    super()
  }

  @OnWorkerEvent('error')
  onError(error) {
    this.logger.error(`error: ${error.message}`)
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.logger.warn('ready')
  }

  @OnWorkerEvent('drained')
  onDrained() {
    this.logger.debug('drained')
  }

  @OnWorkerEvent('paused')
  onPaused() {
    this.logger.warn('paused')
  }

  @OnWorkerEvent('resumed')
  onResumed() {
    this.logger.warn('resumed')
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`active: ${job.id}`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error) {
    this.logger.error(`failed: ${job.id} - ${error.message}`)
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`completed: ${job.id}`)

    const space = job.returnvalue as TwitterSpace
    if ([TwitterSpaceState.ENDED, TwitterSpaceState.CANCELED].includes(space?.state)) {
      job.remove({ removeChildren: true })
        .then(() => this.logger.log(`removeJob: ${job.id}`))
        .catch((error) => this.logger.error(`removeJob: ${error.message}`, null, { id: job.id }))
    }
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.debug(`stalled: ${jobId}`)
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
          await this.pause(duration)
          // await this.worker.rateLimit(duration)
          throw Worker.RateLimitError()
        }
      }
      throw new Error('Space not found')
    }

    await job.updateProgress(100)
    return space
  }

  private async pause(duration?: number) {
    if (this.timeoutId) {
      return
    }

    await this.worker.pause()

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null
      this.worker.resume()
    }, duration)
  }
}
