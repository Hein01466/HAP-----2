import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { Department } from './schemas/department.schema'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'

@Injectable()
export class DepartmentsService extends CrudService<
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto
> {
  constructor(@InjectModel(Department.name) model: Model<Department>) {
    super(model, {
      entityName: 'Department',
      list: {
        allowedFilters: ['name'],
        allowedSort: ['createdAt', 'name'],
        searchFields: ['name', 'description'],
      },
    })
  }
}
