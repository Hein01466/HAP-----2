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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AssetsService } from './assets.service'
import { CreateAssetDto } from './dto/create-asset.dto'
import { UpdateAssetDto } from './dto/update-asset.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Role } from '../users/role.enum'
import { ListQuery } from '../common/list-query'
import { toCsv } from '../common/csv'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { uploadConfig } from '../common/upload'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger'

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('assets')
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

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
        name: a.name,
        assetTag: a.assetTag,
        status: a.status,
        departmentId: a.departmentId,
        imageUrl: a.imageUrl,
        createdAt: a.createdAt,
      })),
      ['id', 'name', 'assetTag', 'status', 'departmentId', 'imageUrl', 'createdAt'],
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="assets.csv"')
    res.send(csv)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Post(':id/image')
  @Roles(Role.Admin, Role.User)
  @UseInterceptors(FileInterceptor('file', uploadConfig('assets')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.update(id, { imageUrl: `/uploads/assets/${file.filename}` })
  }

  @Post()
  @Roles(Role.Admin, Role.User)
  create(@Body() dto: CreateAssetDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.User)
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.User)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
