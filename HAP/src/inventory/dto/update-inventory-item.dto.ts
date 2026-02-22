import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator'
import { InventoryStatus } from '../schemas/inventory-item.schema'

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ example: 'Laptop' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'LAP-001' })
  @IsOptional()
  @IsString()
  sku?: string

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number

  @ApiPropertyOptional({ example: 'Warehouse A' })
  @IsOptional()
  @IsString()
  location?: string

  @ApiPropertyOptional({ enum: InventoryStatus, example: InventoryStatus.InStock })
  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  vendorId?: string
}
