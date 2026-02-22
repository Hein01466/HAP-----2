import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum MaintenanceStatus {
  Scheduled = 'scheduled',
  InProgress = 'in_progress',
  Completed = 'completed',
}

@Schema({ timestamps: true })
export class Maintenance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Asset' })
  assetId?: Types.ObjectId

  @Prop({ required: true, trim: true })
  description: string

  @Prop({ enum: MaintenanceStatus, default: MaintenanceStatus.Scheduled })
  status: string

  @Prop({ default: '' })
  scheduledDate: string

  @Prop({ default: '' })
  completedDate: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance)
