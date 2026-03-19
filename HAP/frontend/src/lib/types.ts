export type Role = 'admin' | 'user'

export type AuthUser = {
  id: string
  email: string
  role: Role
}

export type LoginResponse = {
  access_token: string
}

export type ListResult<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

export type Department = {
  _id?: string
  id?: string
  name: string
  description?: string
  createdAt?: string
}

export type Asset = {
  _id?: string
  id?: string
  name: string
  assetTag: string
  status?: string
  departmentId?: string
  imageUrl?: string
  createdAt?: string
}

export type User = {
  _id?: string
  id?: string
  email: string
  role: Role
  avatarUrl?: string
  createdAt?: string
}
