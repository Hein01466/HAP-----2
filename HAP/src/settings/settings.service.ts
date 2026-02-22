import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Setting } from './schemas/setting.schema'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { buildListQuery, ListQuery, ListResult } from '../common/list-query'

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private model: Model<Setting>) {}

  async findAll(query: ListQuery): Promise<ListResult<Setting>> {
    const { filters, limit, skip, sort, page } = buildListQuery(query, {
      allowedFilters: ['key'],
      allowedSort: ['createdAt', 'key'],
      searchFields: ['key', 'description'],
    })
    const baseFilter = { ...filters, isDeleted: false }
    const [items, total] = await Promise.all([
      this.model.find(baseFilter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(baseFilter).exec(),
    ])
    return { items, total, page, limit }
  }

  async findByKey(key: string) {
    const setting = await this.model.findOne({ key, isDeleted: false }).exec()
    if (!setting) throw new NotFoundException('Setting not found')
    return setting
  }

  async upsertByKey(key: string, dto: UpdateSettingDto) {
    const updated = await this.model.findOneAndUpdate(
      { key, isDeleted: false },
      { $set: { key, ...dto } },
      { new: true, upsert: true },
    )
    return updated
  }
}
