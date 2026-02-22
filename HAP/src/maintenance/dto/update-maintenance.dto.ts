import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { MaintenanceStatus } from '../schemas/maintenance.schema'

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  assetId?: string

  @ApiPropertyOptional({ example: 'Replace toner and clean rollers' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ enum: MaintenanceStatus, example: MaintenanceStatus.InProgress })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus

  @ApiPropertyOptional({ example: '2026-02-10' })
  @IsOptional()
  @IsString()
  scheduledDate?: string

  @ApiPropertyOptional({ example: '2026-02-12' })
  @IsOptional()
  @IsString()
  completedDate?: string
}
