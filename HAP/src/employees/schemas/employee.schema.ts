import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum EmployeeStatus {
  Active = 'active',
  Inactive = 'inactive',
}

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ required: true, trim: true })
  firstName: string

  @Prop({ required: true, trim: true })
  lastName: string

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  @Prop({ default: '' })
  phone: string

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId

  @Prop({ default: '' })
  position: string

  @Prop({ enum: EmployeeStatus, default: EmployeeStatus.Active })
  status: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee)
