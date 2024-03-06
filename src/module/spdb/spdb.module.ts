import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Module, forwardRef } from '@nestjs/common'
import { TwitterModule } from '../twitter/twitter.module'
import { SPDB_SPACE_QUEUE_NAME } from './constant/spdb.constant'
import { SpdbSpaceProcessor } from './processor/spdb-space.processor'
import { SpdbService } from './service/spdb.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: SPDB_SPACE_QUEUE_NAME,
    }),
    BullBoardModule.forFeature({
      name: SPDB_SPACE_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    forwardRef(() => TwitterModule),
  ],
  providers: [
    SpdbSpaceProcessor,
    SpdbService,
  ],
  exports: [
    SpdbService,
  ],
})
export class SpdbModule { }
