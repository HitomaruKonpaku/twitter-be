import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseRepository } from '../../../shared/base/base.repository'
import { TwitterUser } from '../model/twitter-user.entity'

@Injectable()
export class TwitterUserRepository extends BaseRepository<TwitterUser> {
  constructor(
    @InjectRepository(TwitterUser)
    public readonly repository: Repository<TwitterUser>,
  ) {
    super(repository)
  }

  public async getByUsername(username: string) {
    const res = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(username) = :username', { username: username.toLowerCase() })
      .addOrderBy('is_active', 'DESC')
      .getOne()
    return res
  }

  public async getByUsernames(usernames: string[]) {
    const res = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(username) IN (:...usernames)', { usernames: usernames.map((v) => v.toLowerCase()) })
      .addOrderBy('is_active', 'DESC')
      .getMany()
    return res
  }
}
