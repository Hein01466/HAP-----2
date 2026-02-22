import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Department extends Document {
  @Prop({ required: true, trim: true })
  name: string

  @Prop({ default: '' })
  description: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const DepartmentSchema = SchemaFactory.createForClass(Department)
