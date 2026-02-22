import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { AuditLog } from './schemas/audit-log.schema'
import { CreateAuditLogDto } from './dto/create-audit-log.dto'
import { UpdateAuditLogDto } from './dto/update-audit-log.dto'

@Injectable()
export class AuditLogsService extends CrudService<
  AuditLog,
  CreateAuditLogDto,
  UpdateAuditLogDto
> {
  constructor(@InjectModel(AuditLog.name) model: Model<AuditLog>) {
    super(model, {
      entityName: 'Audit log',
      list: {
        allowedFilters: ['action', 'entity', 'actorId'],
        allowedSort: ['createdAt', 'action', 'entity'],
        searchFields: ['entity', 'entityId'],
      },
    })
  }
}
