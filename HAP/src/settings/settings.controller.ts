import { Body, Controller, Get, Param, Patch, Query, Res, UseGuards } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Role } from '../users/role.enum'
import { ListQuery } from '../common/list-query'
import { toCsv } from '../common/csv'
import { Response } from 'express'
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.User)
@ApiTags('settings')
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

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
      rows.items.map((s) => ({
        id: s.id,
        key: s.key,
        description: s.description,
        createdAt: s.createdAt,
      })),
      ['id', 'key', 'description', 'createdAt'],
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="settings.csv"')
    res.send(csv)
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key)
  }

  @Patch(':key')
  upsert(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.service.upsertByKey(key, dto)
  }
}
