import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { ProjectStatus } from '../schemas/project.schema'

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Network Upgrade' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ example: 'Switch and router refresh' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  departmentId?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  ownerId?: string

  @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.Active })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsString()
  endDate?: string
}
