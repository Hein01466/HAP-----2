import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateDepartmentDto {
  @ApiProperty({ example: 'IT' })
  @IsString()
  name: string

  @ApiPropertyOptional({ example: 'Infrastructure and support' })
  @IsOptional()
  @IsString()
  description?: string
}
