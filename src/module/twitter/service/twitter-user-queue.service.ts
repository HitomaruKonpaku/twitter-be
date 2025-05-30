import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import ms from 'ms'
import { NumberUtil } from '../../../shared/util/number.util'
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
        attempts: NumberUtil.parse(process.env.TWITTER_USER_QUEUE_ATTEMPTS, 3),
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
  }
}
