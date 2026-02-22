import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { AssetStatus } from '../schemas/asset.schema'

export class UpdateAssetDto {
  @ApiPropertyOptional({ example: 'Office Printer' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'AST-001' })
  @IsOptional()
  @IsString()
  assetTag?: string

  @ApiPropertyOptional({ enum: AssetStatus, example: AssetStatus.Active })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  departmentId?: string

  @ApiPropertyOptional({ example: '/uploads/assets/image.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string
}
