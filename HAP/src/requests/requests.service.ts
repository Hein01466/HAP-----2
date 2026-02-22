import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { Request } from './schemas/request.schema'
import { CreateRequestDto } from './dto/create-request.dto'
import { UpdateRequestDto } from './dto/update-request.dto'
import { EmailService } from '../email/email.service'

@Injectable()
export class RequestsService extends CrudService<Request, CreateRequestDto, UpdateRequestDto> {
  constructor(
    @InjectModel(Request.name) model: Model<Request>,
    private readonly emailService: EmailService,
  ) {
    super(model, {
      entityName: 'Request',
      list: {
        allowedFilters: ['departmentId', 'requesterId', 'status', 'priority'],
        allowedSort: ['createdAt', 'title', 'status', 'priority'],
        searchFields: ['title', 'description'],
      },
    })
  }

  override async create(dto: CreateRequestDto) {
    const created = await super.create(dto)
    await this.emailService.sendMail(
      process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'support@example.com',
      'New request created',
      `A new request was created: ${created.title}`,
    )
    return created
  }
}
