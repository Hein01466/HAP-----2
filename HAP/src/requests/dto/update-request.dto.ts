import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { RequestPriority, RequestStatus } from '../schemas/request.schema'

export class UpdateRequestDto {
  @ApiPropertyOptional({ example: 'New onboarding laptop' })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ example: 'Need a laptop for new hire' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  requesterId?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  departmentId?: string

  @ApiPropertyOptional({ enum: RequestStatus, example: RequestStatus.InProgress })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus

  @ApiPropertyOptional({ enum: RequestPriority, example: RequestPriority.Normal })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority
}
