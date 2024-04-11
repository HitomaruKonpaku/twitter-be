import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
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
        attempts: 5,
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
