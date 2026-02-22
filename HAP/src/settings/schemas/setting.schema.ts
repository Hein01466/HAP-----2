import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Setting extends Document {
  @Prop({ required: true, unique: true, trim: true })
  key: string

  @Prop({ type: Object, default: {} })
  value: Record<string, unknown>

  @Prop({ default: '' })
  description: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const SettingSchema = SchemaFactory.createForClass(Setting)
