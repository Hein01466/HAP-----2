import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import { PurchaseOrdersService } from './purchase-orders.service'
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto'
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Role } from '../users/role.enum'
import { ListQuery } from '../common/list-query'
import { toCsv } from '../common/csv'
import { Response } from 'express'
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('purchase-orders')
@ApiBearerAuth()
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'q', required: false })
  findAll(@Query() query: ListQuery) {
    return this.service.findAll(query)
  }

  @Get('export')
  @Roles(Role.Admin, Role.User)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'q', required: false })
  async exportCsv(@Res() res: Response, @Query() query: ListQuery) {
    const rows = await this.service.findAll({ ...query, limit: '1000' })
    const csv = toCsv(
      rows.items.map((p) => ({
        id: p.id,
        orderNumber: p.orderNumber,
        status: p.status,
        vendorId: p.vendorId,
        itemId: p.itemId,
        quantity: p.quantity,
        totalCost: p.totalCost,
        createdAt: p.createdAt,
      })),
      [
        'id',
        'orderNumber',
        'status',
        'vendorId',
        'itemId',
        'quantity',
        'totalCost',
        'createdAt',
      ],
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="purchase-orders.csv"')
    res.send(csv)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post()
  @Roles(Role.Admin, Role.User)
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.User)
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.User)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
