import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { Vendor } from './schemas/vendor.schema'
import { CreateVendorDto } from './dto/create-vendor.dto'
import { UpdateVendorDto } from './dto/update-vendor.dto'

@Injectable()
export class VendorsService extends CrudService<Vendor, CreateVendorDto, UpdateVendorDto> {
  constructor(@InjectModel(Vendor.name) model: Model<Vendor>) {
    super(model, {
      entityName: 'Vendor',
      list: {
        allowedFilters: ['name'],
        allowedSort: ['createdAt', 'name'],
        searchFields: ['name', 'email', 'phone', 'address'],
      },
    })
  }
}
