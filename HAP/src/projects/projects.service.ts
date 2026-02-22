import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { Project } from './schemas/project.schema'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'

@Injectable()
export class ProjectsService extends CrudService<
  Project,
  CreateProjectDto,
  UpdateProjectDto
> {
  constructor(@InjectModel(Project.name) model: Model<Project>) {
    super(model, {
      entityName: 'Project',
      list: {
        allowedFilters: ['departmentId', 'ownerId', 'status'],
        allowedSort: ['createdAt', 'name', 'status'],
        searchFields: ['name', 'description'],
      },
    })
  }
}
