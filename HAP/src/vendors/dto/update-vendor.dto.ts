import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateVendorDto {
  @ApiPropertyOptional({ example: 'Acme Supplies' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'sales@acme.test' })
  @IsOptional()
  @IsString()
  email?: string

  @ApiPropertyOptional({ example: '555-0101' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ example: '1 Supply Ave' })
  @IsOptional()
  @IsString()
  address?: string
}
