import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { InventoryItem } from './schemas/inventory-item.schema'
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto'
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto'

@Injectable()
export class InventoryService extends CrudService<
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto
> {
  constructor(@InjectModel(InventoryItem.name) model: Model<InventoryItem>) {
    super(model, {
      entityName: 'Inventory item',
      list: {
        allowedFilters: ['status', 'vendorId', 'location', 'sku'],
        allowedSort: ['createdAt', 'name', 'sku', 'quantity', 'status'],
        searchFields: ['name', 'sku', 'location'],
      },
    })
  }
}
