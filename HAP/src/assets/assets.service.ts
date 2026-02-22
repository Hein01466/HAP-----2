import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { Asset } from './schemas/asset.schema'
import { CreateAssetDto } from './dto/create-asset.dto'
import { UpdateAssetDto } from './dto/update-asset.dto'

@Injectable()
export class AssetsService extends CrudService<Asset, CreateAssetDto, UpdateAssetDto> {
  constructor(@InjectModel(Asset.name) model: Model<Asset>) {
    super(model, {
      entityName: 'Asset',
      list: {
        allowedFilters: ['status', 'departmentId', 'assetTag'],
        allowedSort: ['createdAt', 'name', 'assetTag', 'status'],
        searchFields: ['name', 'assetTag'],
      },
    })
  }
}
