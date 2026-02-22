import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum AssetStatus {
  Active = 'active',
  Inactive = 'inactive',
  Retired = 'retired',
}

@Schema({ timestamps: true })
export class Asset extends Document {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, trim: true })
  assetTag: string

  @Prop({ enum: AssetStatus, default: AssetStatus.Active })
  status: string

  @Prop({ default: '' })
  imageUrl: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId
}

export const AssetSchema = SchemaFactory.createForClass(Asset)
