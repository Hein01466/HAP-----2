import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './schemas/user.schema'

@Injectable()
export class UsersService extends CrudService<
  User,
  CreateUserDto & { password: string },
  UpdateUserDto
> {
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model, {
      entityName: 'User',
      select: '-password',
      list: {
        allowedFilters: ['role'],
        allowedSort: ['createdAt', 'email', 'role'],
        searchFields: ['email'],
      },
    })
  }

  findByEmail(email: string) {
    return this.model.findOne({ email, isDeleted: false }).exec()
  }
}
