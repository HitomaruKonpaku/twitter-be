import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import { TWITTER_USER_QUEUE_NAME } from '../constant/twitter.constant'

@Injectable()
export class TwitterUserQueueService {
  constructor(
    @InjectQueue(TWITTER_USER_QUEUE_NAME)
    private readonly queue: Queue,
  ) { }

  public async addByUsername(username: string, options?: JobsOptions) {
    const job = await this.queue.add(
      username,
      { username },
      {
        jobId: username,
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
