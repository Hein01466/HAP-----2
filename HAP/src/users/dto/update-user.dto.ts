import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator'
import { Role } from '../role.enum'

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'passw0rd' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must include letters and numbers',
  })
  password?: string

  @ApiPropertyOptional({ enum: Role, example: Role.User })
  @IsOptional()
  @IsEnum(Role)
  role?: Role

  @ApiPropertyOptional({ example: '/uploads/users/avatar.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string
}
