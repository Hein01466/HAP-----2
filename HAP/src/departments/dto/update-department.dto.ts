import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'IT' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'Infrastructure and support' })
  @IsOptional()
  @IsString()
  description?: string
}
