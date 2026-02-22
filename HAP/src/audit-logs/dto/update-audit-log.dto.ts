import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsMongoId, IsOptional, IsString } from 'class-validator'

export class UpdateAuditLogDto {
  @ApiPropertyOptional({ example: 'update' })
  @IsOptional()
  @IsString()
  action?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  actorId?: string

  @ApiPropertyOptional({ example: 'department' })
  @IsOptional()
  @IsString()
  entity?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsString()
  entityId?: string

  @ApiPropertyOptional({ example: { path: '/departments/1' } })
  @IsOptional()
  metadata?: Record<string, unknown>
}
