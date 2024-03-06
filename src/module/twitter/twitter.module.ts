import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SpdbModule } from '../spdb/spdb.module'
import { TwitterGraphqlApi } from './api/twitter-graphql.api'
import { TwitterApi } from './api/twitter.api'
import { TwitterSpaceController } from './controller/twitter-space.controller'
import { TwitterUserController } from './controller/twitter-user.controller'
import { TwitterSpaceCron } from './cron/twitter-space.cron'
import { TwitterSpace } from './model/twitter-space.entity'
import { TwitterUser } from './model/twitter-user.entity'
import { TwitterSpaceRepository } from './repository/twitter-space.repository'
import { TwitterUserRepository } from './repository/twitter-user.repository'
import { TwitterSpaceService } from './service/twitter-space.service'
import { TwitterUserService } from './service/twitter-user.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitterUser,
      TwitterSpace,
    ]),
    forwardRef(() => SpdbModule),
  ],
  controllers: [
    TwitterUserController,
    TwitterSpaceController,
  ],
  providers: [
    TwitterUserRepository,
    TwitterSpaceRepository,
    TwitterUserService,
    TwitterSpaceService,
    TwitterApi,
    TwitterGraphqlApi,
    TwitterSpaceCron,
  ],
  exports: [
    TwitterUserRepository,
    TwitterSpaceRepository,
    TwitterUserService,
    TwitterSpaceService,
    TwitterApi,
  ],
})
export class TwitterModule { }
