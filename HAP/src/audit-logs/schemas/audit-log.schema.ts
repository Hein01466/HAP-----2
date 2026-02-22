import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop({ required: true, trim: true })
  action: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  actorId?: Types.ObjectId

  @Prop({ required: true, trim: true })
  entity: string

  @Prop({ required: true, trim: true })
  entityId: string

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog)
