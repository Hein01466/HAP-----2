import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator'
import { TaskPriority, TaskStatus } from '../schemas/task.schema'

export class CreateTaskDto {
  @ApiProperty({ example: 'Rack new switches' })
  @IsString()
  title: string

  @ApiPropertyOptional({ example: 'Install hardware in DC' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  projectId?: string

  @ApiPropertyOptional({ example: '64f1234abc1234abc1234abc' })
  @IsOptional()
  @IsMongoId()
  assigneeId?: string

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.Open })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional({ example: '2026-02-15' })
  @IsOptional()
  @IsString()
  dueDate?: string

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.Normal })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority
}
