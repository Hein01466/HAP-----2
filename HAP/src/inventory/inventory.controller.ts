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
import { InventoryService } from './inventory.service'
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto'
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Role } from '../users/role.enum'
import { ListQuery } from '../common/list-query'
import { toCsv } from '../common/csv'
import { Response } from 'express'
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('inventory')
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

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
      rows.items.map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        quantity: i.quantity,
        location: i.location,
        status: i.status,
        vendorId: i.vendorId,
        createdAt: i.createdAt,
      })),
      [
        'id',
        'name',
        'sku',
        'quantity',
        'location',
        'status',
        'vendorId',
        'createdAt',
      ],
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"')
    res.send(csv)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post()
  @Roles(Role.Admin, Role.User)
  create(@Body() dto: CreateInventoryItemDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.User)
  update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.User)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
