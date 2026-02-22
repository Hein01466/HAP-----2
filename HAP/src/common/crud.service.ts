import { NotFoundException } from '@nestjs/common'
import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose'
import { buildListQuery, ListQuery, ListResult } from './list-query'

export type CrudListOptions = {
  allowedFilters: string[]
  allowedSort: string[]
  searchFields: string[]
}

export type CrudServiceOptions = {
  entityName: string
  list: CrudListOptions
  select?: string
}

export class CrudService<T extends Document, CreateDto, UpdateDto> {
  constructor(
    protected readonly model: Model<T>,
    private readonly options: CrudServiceOptions,
  ) {}

  create(dto: CreateDto): Promise<T> {
    return new this.model(dto as unknown as T).save()
  }

  async findAll(query: ListQuery): Promise<ListResult<T>> {
    const { filters, limit, skip, sort, page } = buildListQuery(query, this.options.list)
    const baseFilter = {
      ...(filters as Record<string, unknown>),
      isDeleted: false,
    } as FilterQuery<T>
    let findQuery = this.model.find(baseFilter).sort(sort).skip(skip).limit(limit)
    if (this.options.select) {
      findQuery = findQuery.select(this.options.select)
    }
    const [items, total] = await Promise.all([
      findQuery.exec(),
      this.model.countDocuments(baseFilter).exec(),
    ])
    return { items, total, page, limit }
  }

  async findOne(id: string): Promise<T> {
    let findQuery = this.model.findOne({ _id: id, isDeleted: false } as FilterQuery<T>)
    if (this.options.select) {
      findQuery = findQuery.select(this.options.select)
    }
    const doc = await findQuery.exec()
    if (!doc) throw new NotFoundException(`${this.options.entityName} not found`)
    return doc
  }

  async update(id: string, dto: UpdateDto): Promise<T> {
    const doc = await this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: false } as FilterQuery<T>,
        dto as unknown as UpdateQuery<T>,
        {
        new: true,
        },
      )
      .exec()
    if (!doc) throw new NotFoundException(`${this.options.entityName} not found`)
    return doc
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const doc = await this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: false } as FilterQuery<T>,
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      )
      .exec()
    if (!doc) throw new NotFoundException(`${this.options.entityName} not found`)
    return { deleted: true }
  }
}
