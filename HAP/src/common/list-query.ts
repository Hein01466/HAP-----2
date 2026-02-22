export type ListQuery = Record<string, string | undefined>

type BuildListOptions = {
  allowedFilters?: string[]
  allowedSort?: string[]
  searchFields?: string[]
  maxLimit?: number
  defaultLimit?: number
}

export function buildListQuery(query: ListQuery, options: BuildListOptions = {}) {
  const {
    allowedFilters = [],
    allowedSort = [],
    searchFields = [],
    maxLimit = 100,
    defaultLimit = 20,
  } = options

  const page = Math.max(parseInt(query.page || '1', 10) || 1, 1)
  const limitRaw = parseInt(query.limit || String(defaultLimit), 10) || defaultLimit
  const limit = Math.min(Math.max(limitRaw, 1), maxLimit)
  const skip = (page - 1) * limit

  const sortBy = query.sortBy && allowedSort.includes(query.sortBy) ? query.sortBy : 'createdAt'
  const sortOrder: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

  const filters: Record<string, unknown> = {}
  for (const key of allowedFilters) {
    const value = query[key]
    if (value !== undefined && value !== '') {
      filters[key] = value
    }
  }

  if (query.q && searchFields.length > 0) {
    const regex = new RegExp(query.q, 'i')
    filters.$or = searchFields.map((field) => ({ [field]: regex }))
  }

  return { filters, limit, skip, sort, page }
}

export function buildExportQuery(query: ListQuery, options: BuildListOptions = {}) {
  const { filters, sort } = buildListQuery(query, options)
  return { filters, sort }
}

export type ListResult<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}
