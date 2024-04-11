import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TwitterGraphqlApi } from './api/twitter-graphql.api'
import { TwitterApi } from './api/twitter.api'
import { TWITTER_SPACE_QUEUE_NAME, TWITTER_USER_QUEUE_NAME } from './constant/twitter.constant'
import { TwitterSpaceController } from './controller/twitter-space.controller'
import { TwitterUserController } from './controller/twitter-user.controller'
import { TwitterSpaceCron } from './cron/twitter-space.cron'
import { TwitterSpace } from './model/twitter-space.entity'
import { TwitterUser } from './model/twitter-user.entity'
import { TwitterSpaceProcessor } from './processor/twitter-space.processor'
import { TwitterUserProcessor } from './processor/twitter-user.processor'
import { TwitterSpaceRepository } from './repository/twitter-space.repository'
import { TwitterUserRepository } from './repository/twitter-user.repository'
import { TwitterSpaceQueueService } from './service/twitter-space-queue.service'
import { TwitterSpaceService } from './service/twitter-space.service'
import { TwitterUserQueueService } from './service/twitter-user-queue.service'
import { TwitterUserService } from './service/twitter-user.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitterUser,
      TwitterSpace,
    ]),
    BullModule.registerQueue(
      { name: TWITTER_USER_QUEUE_NAME },
      { name: TWITTER_SPACE_QUEUE_NAME },
    ),
    BullBoardModule.forFeature(
      {
        name: TWITTER_USER_QUEUE_NAME,
        adapter: BullMQAdapter,
      },
      {
        name: TWITTER_SPACE_QUEUE_NAME,
        adapter: BullMQAdapter,
      },
    ),
  ],
  controllers: [
    TwitterUserController,
    TwitterSpaceController,
  ],
  providers: [
    TwitterUserRepository,
    TwitterUserService,
    TwitterUserQueueService,
    TwitterUserProcessor,

    TwitterSpaceRepository,
    TwitterSpaceService,
    TwitterSpaceQueueService,
    TwitterSpaceProcessor,

    TwitterApi,
    TwitterGraphqlApi,

    TwitterSpaceCron,
  ],
})
export class TwitterModule { }
