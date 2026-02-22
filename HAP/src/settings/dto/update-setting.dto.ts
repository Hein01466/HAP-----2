import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString } from 'class-validator'

export class UpdateSettingDto {
  @ApiPropertyOptional({ example: { timezone: 'UTC', maintenanceMode: false } })
  @IsOptional()
  @IsObject()
  value?: Record<string, unknown>

  @ApiPropertyOptional({ example: 'Core system settings' })
  @IsOptional()
  @IsString()
  description?: string
}
