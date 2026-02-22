import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateVendorDto {
  @ApiProperty({ example: 'Acme Supplies' })
  @IsString()
  name: string

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
