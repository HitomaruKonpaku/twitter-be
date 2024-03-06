import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

export class GetQuery {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({ required: false })
  renew?: boolean
}
