import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum InventoryStatus {
  InStock = 'in_stock',
  LowStock = 'low_stock',
  OutOfStock = 'out_of_stock',
}

@Schema({ timestamps: true })
export class InventoryItem extends Document {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, unique: true, trim: true })
  sku: string

  @Prop({ default: 0 })
  quantity: number

  @Prop({ default: '' })
  location: string

  @Prop({ enum: InventoryStatus, default: InventoryStatus.InStock })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
  vendorId?: Types.ObjectId

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem)
