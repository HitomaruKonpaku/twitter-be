import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import ms from 'ms'
import { Logger } from '../../../shared/logger'
import { NumberUtil } from '../../../shared/util/number.util'
import { TWITTER_SPACE_QUEUE_NAME } from '../constant/twitter.constant'

@Injectable()
export class TwitterSpaceQueueService {
  private readonly logger = new Logger(TwitterSpaceQueueService.name)

  constructor(
    @InjectQueue(TWITTER_SPACE_QUEUE_NAME)
    private readonly queue: Queue,
  ) { }

  public async add(id: string, options?: JobsOptions) {
    try {
      const job = await this.queue.add(
        id,
        { id },
        {
          jobId: id,
          attempts: NumberUtil.parse(process.env.TWITTER_SPACE_QUEUE_ATTEMPTS, 3),
          backoff: {
            type: 'fixed',
            delay: ms('1m'),
          },
          removeOnComplete: {
            age: ms('1h') * 1e-3,
          },
          removeOnFail: {
            age: ms('1d') * 1e-3,
          },
          ...options,
        },
      )
      return job
    } catch (error) {
      this.logger.error(`add: ${error.message} | ${JSON.stringify({ id, options })}`)
      throw error
    }
  }
}
