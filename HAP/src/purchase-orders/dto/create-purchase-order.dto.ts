import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator'
import { PurchaseOrderStatus } from '../schemas/purchase-order.schema'

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'PO-1001' })
  @IsString()
  orderNumber: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  vendorId?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  itemId?: string

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number

  @ApiPropertyOptional({ enum: PurchaseOrderStatus, example: PurchaseOrderStatus.Pending })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalCost?: number
}
