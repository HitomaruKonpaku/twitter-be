import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { GetQuery } from '../../../shared/dto/get-query.dto'
import { TwitterSpaceService } from '../service/twitter-space.service'

@Controller('twitter/spaces')
@ApiTags('twitter.spaces')
export class TwitterSpaceController {
  constructor(private readonly service: TwitterSpaceService) { }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @Query() opts: GetQuery,
  ) {
    return this.service.getById(id, opts)
  }

  @Get('count')
  @ApiOkResponse({ type: Number })
  count() {
    return this.service.count()
  }
}
