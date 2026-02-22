import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum PurchaseOrderStatus {
  Pending = 'pending',
  Approved = 'approved',
  Received = 'received',
  Cancelled = 'cancelled',
}

@Schema({ timestamps: true })
export class PurchaseOrder extends Document {
  @Prop({ required: true, trim: true })
  orderNumber: string

  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
  vendorId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'InventoryItem' })
  itemId?: Types.ObjectId

  @Prop({ default: 1 })
  quantity: number

  @Prop({ enum: PurchaseOrderStatus, default: PurchaseOrderStatus.Pending })
  status: string

  @Prop({ default: 0 })
  totalCost: number

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder)
