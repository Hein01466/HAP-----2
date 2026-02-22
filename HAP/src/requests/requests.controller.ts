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
import { RequestsService } from './requests.service'
import { CreateRequestDto } from './dto/create-request.dto'
import { UpdateRequestDto } from './dto/update-request.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Role } from '../users/role.enum'
import { ListQuery } from '../common/list-query'
import { toCsv } from '../common/csv'
import { Response } from 'express'
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('requests')
@ApiBearerAuth()
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

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
      rows.items.map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        priority: r.priority,
        requesterId: r.requesterId,
        departmentId: r.departmentId,
        createdAt: r.createdAt,
      })),
      ['id', 'title', 'status', 'priority', 'requesterId', 'departmentId', 'createdAt'],
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="requests.csv"')
    res.send(csv)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post()
  @Roles(Role.Admin, Role.User)
  create(@Body() dto: CreateRequestDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.User)
  update(@Param('id') id: string, @Body() dto: UpdateRequestDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.User)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
