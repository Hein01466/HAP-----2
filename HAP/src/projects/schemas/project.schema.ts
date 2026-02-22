import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum ProjectStatus {
  Planned = 'planned',
  Active = 'active',
  OnHold = 'on_hold',
  Completed = 'completed',
}

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ default: '' })
  description: string

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  ownerId?: Types.ObjectId

  @Prop({ enum: ProjectStatus, default: ProjectStatus.Active })
  status: string

  @Prop({ default: '' })
  startDate: string

  @Prop({ default: '' })
  endDate: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
