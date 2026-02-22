import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum TaskStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Done = 'done',
}

export enum TaskPriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true, trim: true })
  title: string

  @Prop({ default: '' })
  description: string

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  projectId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  assigneeId?: Types.ObjectId

  @Prop({ enum: TaskStatus, default: TaskStatus.Open })
  status: string

  @Prop({ default: '' })
  dueDate: string

  @Prop({ enum: TaskPriority, default: TaskPriority.Normal })
  priority: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const TaskSchema = SchemaFactory.createForClass(Task)
