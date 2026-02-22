import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { EmployeeStatus } from '../schemas/employee.schema'

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Alex' })
  @IsString()
  firstName: string

  @ApiProperty({ example: 'Morgan' })
  @IsString()
  lastName: string

  @ApiProperty({ example: 'alex@company.test' })
  @IsEmail()
  email: string

  @ApiPropertyOptional({ example: '555-0202' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  departmentId?: string

  @ApiPropertyOptional({ example: 'IT Specialist' })
  @IsOptional()
  @IsString()
  position?: string

  @ApiPropertyOptional({ enum: EmployeeStatus, example: EmployeeStatus.Active })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus
}
