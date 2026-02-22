import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { Employee } from './schemas/employee.schema'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'

@Injectable()
export class EmployeesService extends CrudService<
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto
> {
  constructor(@InjectModel(Employee.name) model: Model<Employee>) {
    super(model, {
      entityName: 'Employee',
      list: {
        allowedFilters: ['departmentId', 'status', 'position'],
        allowedSort: ['createdAt', 'firstName', 'lastName', 'email'],
        searchFields: ['firstName', 'lastName', 'email', 'position'],
      },
    })
  }
}
