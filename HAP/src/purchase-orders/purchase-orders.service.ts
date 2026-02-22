import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CrudService } from '../common/crud.service'
import { PurchaseOrder } from './schemas/purchase-order.schema'
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto'
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto'

@Injectable()
export class PurchaseOrdersService extends CrudService<
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto
> {
  constructor(@InjectModel(PurchaseOrder.name) model: Model<PurchaseOrder>) {
    super(model, {
      entityName: 'Purchase order',
      list: {
        allowedFilters: ['status', 'vendorId', 'itemId', 'orderNumber'],
        allowedSort: ['createdAt', 'orderNumber', 'status', 'totalCost'],
        searchFields: ['orderNumber'],
      },
    })
  }
}
