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

export type EntityBase = {
  _id?: string
  id?: string
  createdAt?: string
}

export type Department = EntityBase & {
  name: string
  description?: string
}

export type Asset = EntityBase & {
  name: string
  assetTag: string
  status?: string
  departmentId?: string
  imageUrl?: string
}

export type User = EntityBase & {
  email: string
  role: Role
  avatarUrl?: string
}

export type Employee = EntityBase & {
  firstName: string
  lastName: string
  email: string
  phone?: string
  departmentId?: string
  position?: string
  status?: string
}

export type Project = EntityBase & {
  name: string
  description?: string
  departmentId?: string
  ownerId?: string
  status?: string
  startDate?: string
  endDate?: string
}

export type Task = EntityBase & {
  title: string
  description?: string
  projectId?: string
  assigneeId?: string
  status?: string
  dueDate?: string
  priority?: string
}

export type RequestRecord = EntityBase & {
  title: string
  description?: string
  requesterId?: string
  departmentId?: string
  status?: string
  priority?: string
}

export type InventoryItem = EntityBase & {
  name: string
  sku: string
  quantity?: number
  location?: string
  status?: string
  vendorId?: string
}

export type Vendor = EntityBase & {
  name: string
  email?: string
  phone?: string
  address?: string
}

export type PurchaseOrder = EntityBase & {
  orderNumber: string
  vendorId?: string
  itemId?: string
  quantity?: number
  status?: string
  totalCost?: number
}

export type MaintenanceRecord = EntityBase & {
  assetId?: string
  description: string
  status?: string
  scheduledDate?: string
  completedDate?: string
}

export type Setting = EntityBase & {
  key: string
  value?: Record<string, unknown>
  description?: string
}

export type AuditLog = EntityBase & {
  action: string
  actorId?: string
  entity: string
  entityId: string
  metadata?: Record<string, unknown>
}
