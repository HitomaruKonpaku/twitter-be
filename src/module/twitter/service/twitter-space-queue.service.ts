import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import { NumberUtil } from '../../../shared/util/number.util'
import { TWITTER_SPACE_QUEUE_NAME } from '../constant/twitter.constant'

@Injectable()
export class TwitterSpaceQueueService {
  constructor(
    @InjectQueue(TWITTER_SPACE_QUEUE_NAME)
    private readonly queue: Queue,
  ) { }

  public async addById(id: string, options?: JobsOptions) {
    const job = await this.queue.add(
      id,
      { id },
      {
        jobId: id,
        attempts: NumberUtil.parse(process.env.TWITTER_SPACE_QUEUE_ATTEMPTS, 3),
        backoff: {
          type: 'fixed',
          delay: 60 * 1000,
        },
        removeOnComplete: {
          age: 3600,
        },
        ...options,
      },
    )
    return job
  }
}
