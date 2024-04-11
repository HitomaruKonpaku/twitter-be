import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { BaseRepository } from '../../../shared/base/base.repository'
import { TwitterSpaceState } from '../enum/twitter-space.enum'
import { TwitterSpace } from '../model/twitter-space.entity'

@Injectable()
export class TwitterSpaceRepository extends BaseRepository<TwitterSpace> {
  constructor(
    @InjectRepository(TwitterSpace)
    public readonly repository: Repository<TwitterSpace>,
  ) {
    super(repository)
  }

  public async getManyActive(options?: { limit?: number }) {
    if (!options?.limit || !Number.isSafeInteger(options?.limit)) {
      return []
    }

    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere(new Brackets((qb) => {
        qb
          .orWhere('state IN (:...states)', { states: [TwitterSpaceState.LIVE, TwitterSpaceState.SCHEDULED] })
        // .orWhere(new Brackets((qb1) => {
        //   qb1
        //     .andWhere('is_available_for_replay = FALSE')
        //     // eslint-disable-next-line quotes
        //     .andWhere(`TO_TIMESTAMP(created_at / 1000) < NOW() - INTERVAL '30 days'`)
        // }))
      }))
      .addOrderBy('modified_at', 'ASC', 'NULLS FIRST')
      .addOrderBy('created_at', 'ASC', 'NULLS FIRST')
      .take(options.limit)

    const res = await query.getMany()
    return res
  }
}
