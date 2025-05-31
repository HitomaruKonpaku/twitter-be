import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { NumberUtil } from '../../../shared/util/number.util'
import { TwitterSpaceRepository } from '../repository/twitter-space.repository'
import { TwitterSpaceQueueService } from '../service/twitter-space-queue.service'

@Injectable()
export class TwitterSpaceCron {
  private readonly logger = new Logger(TwitterSpaceCron.name)

  constructor(
    private readonly twitterSpaceRepository: TwitterSpaceRepository,
    private readonly twitterSpaceQueueService: TwitterSpaceQueueService,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async onTick() {
    const limit = NumberUtil.parse(process.env.TWITTER_SPACE_CRON_LIMIT, 0)
    if (!limit) {
      return
    }

    const spaces = await this.twitterSpaceRepository.getManyActive({ limit })
    if (!spaces?.length) {
      return
    }

    this.logger.log(`onTick#items | ${JSON.stringify({ count: spaces.length })}`)
    await Promise.allSettled(spaces.map((v) => this.twitterSpaceQueueService.add(v.id, { priority: 999 })))
  }
}
