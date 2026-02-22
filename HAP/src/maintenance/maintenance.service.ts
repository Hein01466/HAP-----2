import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { Maintenance } from './schemas/maintenance.schema'
import { CreateMaintenanceDto } from './dto/create-maintenance.dto'
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto'

@Injectable()
export class MaintenanceService extends CrudService<
  Maintenance,
  CreateMaintenanceDto,
  UpdateMaintenanceDto
> {
  constructor(@InjectModel(Maintenance.name) model: Model<Maintenance>) {
    super(model, {
      entityName: 'Maintenance record',
      list: {
        allowedFilters: ['status', 'assetId'],
        allowedSort: ['createdAt', 'status', 'scheduledDate', 'completedDate'],
        searchFields: ['description'],
      },
    })
  }
}
