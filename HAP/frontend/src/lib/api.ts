import { clearToken, getToken } from './auth'
import type {
  Asset,
  AuditLog,
  AuthUser,
  Department,
  Employee,
  InventoryItem,
  ListResult,
  LoginResponse,
  MaintenanceRecord,
  Project,
  PurchaseOrder,
  RequestRecord,
  Setting,
  Task,
  User,
  Vendor,
} from './types'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(path: string, init: RequestInit = {}, useAuth = true): Promise<T> {
  const headers = new Headers(init.headers)
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData
  if (!isFormData) {
    headers.set('Content-Type', 'application/json')
  }

  if (useAuth) {
    const token = getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  })

  if (res.status === 401) {
    clearToken()
  }

  if (!res.ok) {
    const payload = await res.text()
    throw new Error(payload || `Request failed with ${res.status}`)
  }

  if (res.status === 204) {
    return {} as T
  }

  return (await res.json()) as T
}

async function download(path: string, filename: string) {
  const headers = new Headers()
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_URL}${path}`, { headers })
  if (!res.ok) {
    const payload = await res.text()
    throw new Error(payload || `Request failed with ${res.status}`)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

type CollectionResource =
  | 'users'
  | 'departments'
  | 'assets'
  | 'employees'
  | 'projects'
  | 'tasks'
  | 'requests'
  | 'inventory'
  | 'vendors'
  | 'purchase-orders'
  | 'maintenance'
  | 'audit-logs'
  | 'settings'

function listResource<T>(resource: CollectionResource, limit = 100) {
  return request<ListResult<T>>(`/${resource}?page=1&limit=${limit}`)
}

function createResource<T>(resource: Exclude<CollectionResource, 'users' | 'settings'>, payload: unknown) {
  return request<T>(`/${resource}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

function updateResource<T>(resource: Exclude<CollectionResource, 'settings'>, id: string, payload: unknown) {
  return request<T>(`/${resource}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

function removeResource(resource: Exclude<CollectionResource, 'settings'>, id: string) {
  return request<{ deleted: true }>(`/${resource}/${id}`, { method: 'DELETE' })
}

function exportResource(resource: CollectionResource, filename: string) {
  return download(`/${resource}/export`, filename)
}

export const api = {
  register(email: string, password: string) {
    return request<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false)
  },
  login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false)
  },
  getUsers() {
    return listResource<User>('users')
  },
  updateUser(id: string, payload: { role?: User['role']; password?: string }) {
    return updateResource<User>('users', id, payload)
  },
  removeUser(id: string) {
    return removeResource('users', id)
  },
  uploadUserAvatar(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request<User>(`/users/${id}/avatar`, {
      method: 'POST',
      body: formData,
    })
  },
  exportUsersCsv() {
    return exportResource('users', 'users.csv')
  },
  getDepartments() {
    return listResource<Department>('departments')
  },
  createDepartment(payload: Pick<Department, 'name' | 'description'>) {
    return createResource<Department>('departments', payload)
  },
  updateDepartment(id: string, payload: Pick<Department, 'name' | 'description'>) {
    return updateResource<Department>('departments', id, payload)
  },
  removeDepartment(id: string) {
    return removeResource('departments', id)
  },
  exportDepartmentsCsv() {
    return exportResource('departments', 'departments.csv')
  },
  getAssets() {
    return listResource<Asset>('assets')
  },
  createAsset(payload: Pick<Asset, 'name' | 'assetTag' | 'status' | 'departmentId'>) {
    return createResource<Asset>('assets', payload)
  },
  updateAsset(id: string, payload: Pick<Asset, 'name' | 'assetTag' | 'status' | 'departmentId'>) {
    return updateResource<Asset>('assets', id, payload)
  },
  removeAsset(id: string) {
    return removeResource('assets', id)
  },
  uploadAssetImage(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request<Asset>(`/assets/${id}/image`, {
      method: 'POST',
      body: formData,
    })
  },
  exportAssetsCsv() {
    return exportResource('assets', 'assets.csv')
  },
  getEmployees() {
    return listResource<Employee>('employees')
  },
  createEmployee(payload: Omit<Employee, 'id' | '_id' | 'createdAt'>) {
    return createResource<Employee>('employees', payload)
  },
  updateEmployee(id: string, payload: Partial<Employee>) {
    return updateResource<Employee>('employees', id, payload)
  },
  removeEmployee(id: string) {
    return removeResource('employees', id)
  },
  exportEmployeesCsv() {
    return exportResource('employees', 'employees.csv')
  },
  getProjects() {
    return listResource<Project>('projects')
  },
  createProject(payload: Omit<Project, 'id' | '_id' | 'createdAt'>) {
    return createResource<Project>('projects', payload)
  },
  updateProject(id: string, payload: Partial<Project>) {
    return updateResource<Project>('projects', id, payload)
  },
  removeProject(id: string) {
    return removeResource('projects', id)
  },
  exportProjectsCsv() {
    return exportResource('projects', 'projects.csv')
  },
  getTasks() {
    return listResource<Task>('tasks')
  },
  createTask(payload: Omit<Task, 'id' | '_id' | 'createdAt'>) {
    return createResource<Task>('tasks', payload)
  },
  updateTask(id: string, payload: Partial<Task>) {
    return updateResource<Task>('tasks', id, payload)
  },
  removeTask(id: string) {
    return removeResource('tasks', id)
  },
  exportTasksCsv() {
    return exportResource('tasks', 'tasks.csv')
  },
  getRequests() {
    return listResource<RequestRecord>('requests')
  },
  createRequest(payload: Omit<RequestRecord, 'id' | '_id' | 'createdAt'>) {
    return createResource<RequestRecord>('requests', payload)
  },
  updateRequest(id: string, payload: Partial<RequestRecord>) {
    return updateResource<RequestRecord>('requests', id, payload)
  },
  removeRequest(id: string) {
    return removeResource('requests', id)
  },
  exportRequestsCsv() {
    return exportResource('requests', 'requests.csv')
  },
  getInventory() {
    return listResource<InventoryItem>('inventory')
  },
  createInventoryItem(payload: Omit<InventoryItem, 'id' | '_id' | 'createdAt'>) {
    return createResource<InventoryItem>('inventory', payload)
  },
  updateInventoryItem(id: string, payload: Partial<InventoryItem>) {
    return updateResource<InventoryItem>('inventory', id, payload)
  },
  removeInventoryItem(id: string) {
    return removeResource('inventory', id)
  },
  exportInventoryCsv() {
    return exportResource('inventory', 'inventory.csv')
  },
  getVendors() {
    return listResource<Vendor>('vendors')
  },
  createVendor(payload: Omit<Vendor, 'id' | '_id' | 'createdAt'>) {
    return createResource<Vendor>('vendors', payload)
  },
  updateVendor(id: string, payload: Partial<Vendor>) {
    return updateResource<Vendor>('vendors', id, payload)
  },
  removeVendor(id: string) {
    return removeResource('vendors', id)
  },
  exportVendorsCsv() {
    return exportResource('vendors', 'vendors.csv')
  },
  getPurchaseOrders() {
    return listResource<PurchaseOrder>('purchase-orders')
  },
  createPurchaseOrder(payload: Omit<PurchaseOrder, 'id' | '_id' | 'createdAt'>) {
    return createResource<PurchaseOrder>('purchase-orders', payload)
  },
  updatePurchaseOrder(id: string, payload: Partial<PurchaseOrder>) {
    return updateResource<PurchaseOrder>('purchase-orders', id, payload)
  },
  removePurchaseOrder(id: string) {
    return removeResource('purchase-orders', id)
  },
  exportPurchaseOrdersCsv() {
    return exportResource('purchase-orders', 'purchase-orders.csv')
  },
  getMaintenance() {
    return listResource<MaintenanceRecord>('maintenance')
  },
  createMaintenanceRecord(payload: Omit<MaintenanceRecord, 'id' | '_id' | 'createdAt'>) {
    return createResource<MaintenanceRecord>('maintenance', payload)
  },
  updateMaintenanceRecord(id: string, payload: Partial<MaintenanceRecord>) {
    return updateResource<MaintenanceRecord>('maintenance', id, payload)
  },
  removeMaintenanceRecord(id: string) {
    return removeResource('maintenance', id)
  },
  exportMaintenanceCsv() {
    return exportResource('maintenance', 'maintenance.csv')
  },
  getAuditLogs() {
    return listResource<AuditLog>('audit-logs')
  },
  createAuditLog(payload: Omit<AuditLog, 'id' | '_id' | 'createdAt'>) {
    return createResource<AuditLog>('audit-logs', payload)
  },
  updateAuditLog(id: string, payload: Partial<AuditLog>) {
    return updateResource<AuditLog>('audit-logs', id, payload)
  },
  removeAuditLog(id: string) {
    return removeResource('audit-logs', id)
  },
  exportAuditLogsCsv() {
    return exportResource('audit-logs', 'audit-logs.csv')
  },
  getSettings() {
    return listResource<Setting>('settings')
  },
  upsertSetting(key: string, payload: Pick<Setting, 'description' | 'value'>) {
    return request<Setting>(`/settings/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  exportSettingsCsv() {
    return exportResource('settings', 'settings.csv')
  },
}
