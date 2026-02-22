import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Vendor extends Document {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ default: '', lowercase: true, trim: true })
  email: string

  @Prop({ default: '' })
  phone: string

  @Prop({ default: '' })
  address: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const VendorSchema = SchemaFactory.createForClass(Vendor)
