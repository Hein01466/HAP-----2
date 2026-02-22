import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Role } from '../role.enum'

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ enum: Role, default: Role.User })
  role: Role

  @Prop({ default: '' })
  avatarUrl: string

  @Prop({ default: false })
  isDeleted: boolean

  @Prop()
  deletedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
