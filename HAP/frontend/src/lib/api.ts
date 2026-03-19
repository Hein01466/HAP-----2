import { clearToken, getToken } from './auth'
import type { Asset, AuthUser, Department, ListResult, LoginResponse, User } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request<T>(path: string, init: RequestInit = {}, useAuth = true): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

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
    return request<ListResult<User>>('/users?page=1&limit=20')
  },
  getDepartments() {
    return request<ListResult<Department>>('/departments?page=1&limit=50')
  },
  createDepartment(payload: Pick<Department, 'name' | 'description'>) {
    return request<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  removeDepartment(id: string) {
    return request<{ deleted: true }>(`/departments/${id}`, { method: 'DELETE' })
  },
  getAssets() {
    return request<ListResult<Asset>>('/assets?page=1&limit=50')
  },
  createAsset(payload: Pick<Asset, 'name' | 'assetTag' | 'status' | 'departmentId'>) {
    return request<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
