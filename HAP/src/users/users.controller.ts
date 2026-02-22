import {
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
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../common/roles.decorator'
import { RolesGuard } from '../common/roles.guard'
import { Role } from './role.enum'
import { ListQuery } from '../common/list-query'
import { toCsv } from '../common/csv'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { uploadConfig } from '../common/upload'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.User)
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'q', required: false })
  findAll(@Query() query: ListQuery) {
    return this.usersService.findAll(query)
  }

  @Get('export')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'q', required: false })
  async exportCsv(@Res() res: Response, @Query() query: ListQuery) {
    const users = await this.usersService.findAll({ ...query, limit: '1000' })
    const csv = toCsv(
      users.items.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
      ['id', 'email', 'role', 'createdAt'],
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"')
    res.send(csv)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file', uploadConfig('users')))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.update(id, { avatarUrl: `/uploads/users/${file.filename}` })
  }

  @Patch(':id')
  update(@Param('id') id: string, dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
