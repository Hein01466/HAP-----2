import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { Task } from './schemas/task.schema'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@Injectable()
export class TasksService extends CrudService<Task, CreateTaskDto, UpdateTaskDto> {
  constructor(@InjectModel(Task.name) model: Model<Task>) {
    super(model, {
      entityName: 'Task',
      list: {
        allowedFilters: ['projectId', 'assigneeId', 'status', 'priority'],
        allowedSort: ['createdAt', 'title', 'status', 'priority', 'dueDate'],
        searchFields: ['title', 'description'],
      },
    })
  }
}
