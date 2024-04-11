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
    this.logger.debug('onTick')
    const limit = NumberUtil.parse(process.env.TWITTER_SPACE_CRON_LIMIT, 0)
    const spaces = await this.twitterSpaceRepository.getManyActive({ limit })
    if (!spaces?.length) {
      return
    }

    this.logger.log('onTick#items', { count: spaces.length })
    await Promise.allSettled(spaces.map((v) => this.twitterSpaceQueueService.addById(v.id, { priority: 999 })))
  }
}
