import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { JobsOptions, Queue } from 'bullmq'
import { SPDB_SPACE_QUEUE_NAME } from '../constant/spdb.constant'

@Injectable()
export class SpdbService {
  constructor(
    @InjectQueue(SPDB_SPACE_QUEUE_NAME)
    private readonly spaceQueue: Queue,
  ) { }

  public async addById(id: string, options?: JobsOptions) {
    const job = await this.spaceQueue.add(
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
