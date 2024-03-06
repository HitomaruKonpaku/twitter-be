import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SpdbModule } from './module/spdb/spdb.module'
import { TwitterSpace } from './module/twitter/model/twitter-space.entity'
import { TwitterUser } from './module/twitter/model/twitter-user.entity'
import { TwitterModule } from './module/twitter/twitter.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_DATABASE || 'postgres',
      synchronize: true,
      entities: [
        TwitterUser,
        TwitterSpace,
      ],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    TwitterModule,
    SpdbModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule { }
