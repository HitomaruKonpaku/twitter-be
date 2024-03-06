import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
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
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('state IN (:...states)', { states: [TwitterSpaceState.LIVE, TwitterSpaceState.SCHEDULED] })
      .addOrderBy('modified_at', 'ASC', 'NULLS FIRST')
      .addOrderBy('created_at', 'ASC', 'NULLS FIRST')

    if (Number.isSafeInteger(options?.limit)) {
      query.take(options.limit)
    } else {
      query.take(0)
    }

    const res = await query.getMany()
    return res
  }
}
