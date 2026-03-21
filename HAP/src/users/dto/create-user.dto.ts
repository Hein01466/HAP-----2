import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator'
import { Role } from '../role.enum'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'passw0rd' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must include letters and numbers',
  })
  password: string

  @ApiPropertyOptional({ enum: Role, example: Role.User })
  @IsOptional()
  @IsEnum(Role)
  role?: Role
}
