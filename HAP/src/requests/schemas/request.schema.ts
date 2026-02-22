import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum RequestStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Closed = 'closed',
}

export enum RequestPriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

@Schema({ timestamps: true })
export class Request extends Document {
  @Prop({ required: true, trim: true })
  title: string

  @Prop({ default: '' })
  description: string

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  requesterId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId

  @Prop({ enum: RequestStatus, default: RequestStatus.Open })
  status: string

  @Prop({ enum: RequestPriority, default: RequestPriority.Normal })
  priority: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const RequestSchema = SchemaFactory.createForClass(Request)
