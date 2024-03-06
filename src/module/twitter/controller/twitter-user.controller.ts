import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetQuery } from '../../../shared/dto/get-query.dto'
import { TwitterUserService } from '../service/twitter-user.service'

@Controller('twitter/users')
@ApiTags('twitter.users')
export class TwitterUserController {
  constructor(private readonly service: TwitterUserService) { }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @Query() opts: GetQuery,
  ) {
    return this.service.getById(id, opts)
  }
}
