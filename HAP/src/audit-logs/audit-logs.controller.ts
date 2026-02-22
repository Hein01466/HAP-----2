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
import { AuditLogsService } from './audit-logs.service'
import { CreateAuditLogDto } from './dto/create-audit-log.dto'
import { UpdateAuditLogDto } from './dto/update-audit-log.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Role } from '../users/role.enum'
import { ListQuery } from '../common/list-query'
import { toCsv } from '../common/csv'
import { Response } from 'express'
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('audit-logs')
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

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
      rows.items.map((a) => ({
        id: a.id,
        action: a.action,
        entity: a.entity,
        entityId: a.entityId,
        actorId: a.actorId,
        createdAt: a.createdAt,
      })),
      ['id', 'action', 'entity', 'entityId', 'actorId', 'createdAt'],
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"')
    res.send(csv)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post()
  @Roles(Role.Admin, Role.User)
  create(@Body() dto: CreateAuditLogDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.User)
  update(@Param('id') id: string, @Body() dto: UpdateAuditLogDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.User)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
