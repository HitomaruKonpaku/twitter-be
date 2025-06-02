import { Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { BaseService } from '../../../shared/base/base.service'
import { Logger } from '../../../shared/logger'
import { TwitterGraphqlApi } from '../api/twitter-graphql.api'
import { TwitterUser } from '../model/twitter-user.entity'
import { TwitterUserRepository } from '../repository/twitter-user.repository'
import { TwitterUserUtil } from '../util/twitter-user.util'

@Injectable()
export class TwitterUserService extends BaseService<TwitterUser> {
  private readonly logger = new Logger(TwitterUserService.name)
  private readonly dbLimiter = new Bottleneck({ maxConcurrent: 1 })
  private readonly apiLimiter = new Bottleneck({ maxConcurrent: 1 })

  constructor(
    public readonly repository: TwitterUserRepository,
    public readonly twitterGraphqlApi: TwitterGraphqlApi,
  ) {
    super(repository)
  }

  public async getByUsername(username: string) {
    const res = this.repository.getByUsername(username)
    return res
  }

  public async getByUsernames(usernames: string[]) {
    const res = this.repository.getByUsernames(usernames)
    return res
  }

  public async fetchByUsername(username: string) {
    const { data } = await this.apiLimiter.schedule(() => this.twitterGraphqlApi.getUserByScreenName(username))
    if (!data?.data?.user?.result) {
      return null
    }

    const res = await this.saveResult(data.data.user.result)
    return res
  }

  public async save(data: TwitterUser) {
    const res = await this.dbLimiter.schedule(() => super.save(data))
    return res
  }

  public async saveResult(result: any) {
    const res = await this.save(TwitterUserUtil.fromResult(result))
    return res
  }
}
