import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { NumberUtil } from '../../../shared/util/number.util'
import { SpdbService } from '../../spdb/service/spdb.service'
import { TwitterSpaceRepository } from '../repository/twitter-space.repository'

@Injectable()
export class TwitterSpaceCron {
  private readonly logger = new Logger(TwitterSpaceCron.name)

  constructor(
    private readonly twitterSpaceRepository: TwitterSpaceRepository,
    private readonly spdbService: SpdbService,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async onTick() {
    this.logger.debug('onTick')
    const limit = NumberUtil.parse(process.env.SPACE_CRON_LIMIT, 0)
    const spaces = await this.twitterSpaceRepository.getManyActive({ limit })
    if (!spaces?.length) {
      return
    }

    this.logger.log('onTick#items', { count: spaces.length })
    await Promise.allSettled(spaces.map((v) => this.spdbService.addById(v.id, { priority: 999 })))
  }
}
