import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { AssetStatus } from '../schemas/asset.schema'

export class CreateAssetDto {
  @ApiProperty({ example: 'Office Printer' })
  @IsString()
  name: string

  @ApiProperty({ example: 'AST-001' })
  @IsString()
  assetTag: string

  @ApiPropertyOptional({ enum: AssetStatus, example: AssetStatus.Active })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  departmentId?: string
}
