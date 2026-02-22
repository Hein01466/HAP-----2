import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsMongoId, IsOptional, IsString } from 'class-validator'

export class CreateAuditLogDto {
  @ApiProperty({ example: 'create' })
  @IsString()
  action: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  actorId?: string

  @ApiProperty({ example: 'department' })
  @IsString()
  entity: string

  @ApiProperty({ example: '64f1234abc1234abc1234abc' })
  @IsString()
  entityId: string

  @ApiPropertyOptional({ example: { path: '/departments' } })
  @IsOptional()
  metadata?: Record<string, unknown>
}
