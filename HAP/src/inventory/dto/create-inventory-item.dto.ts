import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator'
import { InventoryStatus } from '../schemas/inventory-item.schema'

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'Laptop' })
  @IsString()
  name: string

  @ApiProperty({ example: 'LAP-001' })
  @IsString()
  sku: string

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
