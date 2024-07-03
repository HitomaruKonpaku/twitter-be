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

  public async add(data: { id: string, username: string }, options?: JobsOptions) {
    const { username } = data
    const job = await this.queue.add(
      username,
      data,
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
