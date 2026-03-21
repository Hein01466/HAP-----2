import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { API_URL, api } from '../lib/api'
import { clearToken, getToken } from '../lib/auth'
import type {
  Asset,
  AuditLog,
  Department,
  Employee,
  EntityBase,
  InventoryItem,
  MaintenanceRecord,
  Project,
  PurchaseOrder,
  RequestRecord,
  Setting,
  Task,
  User,
  Vendor,
} from '../lib/types'

type Toast = {
  id: number
  tone: 'success' | 'error'
  message: string
}

type SectionId =
  | 'dashboard'
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

type WorkspaceData = {
  users: User[]
  departments: Department[]
  assets: Asset[]
  employees: Employee[]
  projects: Project[]
  tasks: Task[]
  requests: RequestRecord[]
  inventory: InventoryItem[]
  vendors: Vendor[]
  purchaseOrders: PurchaseOrder[]
  maintenance: MaintenanceRecord[]
  auditLogs: AuditLog[]
  settings: Setting[]
}

type AnyRow = EntityBase & Record<string, unknown>
type FormState = Record<string, string>

type SelectOption = {
  value: string
  label: string
}

type FieldType = 'text' | 'email' | 'password' | 'number' | 'select' | 'date' | 'textarea' | 'json'

type FieldConfig = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  help?: string
  allowEmpty?: boolean
  readOnlyOnEdit?: boolean
  options?: SelectOption[]
  getOptions?: (ctx: OptionContext) => SelectOption[]
}

type CollectionConfig = {
  id: Exclude<SectionId, 'dashboard'>
  label: string
  path: string
  eyebrow: string
  title: string
  description: string
  emptyTitle: string
  emptyMessage: string
  createLabel?: string
  canCreate?: boolean
  canDelete?: boolean
  canExport?: boolean
  fields: FieldConfig[]
  getRows: (data: WorkspaceData) => AnyRow[]
  create?: (payload: Record<string, unknown>) => Promise<unknown>
  update?: (id: string, payload: Record<string, unknown>) => Promise<unknown>
  remove?: (id: string) => Promise<unknown>
  exportData?: () => Promise<void>
  defaults?: FormState
  getInitialValues?: (row: AnyRow) => FormState
  searchText: (row: AnyRow, helpers: HelperMaps) => string
  columns: (helpers: HelperMaps) => Array<{
    header: string
    render: (row: AnyRow) => ReactNode
  }>
}

type OptionContext = {
  data: WorkspaceData
}

type HelperMaps = {
  userName: Map<string, string>
  departmentName: Map<string, string>
  assetName: Map<string, string>
  employeeName: Map<string, string>
  projectName: Map<string, string>
  vendorName: Map<string, string>
  inventoryName: Map<string, string>
}

type ModalState = {
  section: Exclude<SectionId, 'dashboard'>
  mode: 'create' | 'edit'
  itemId?: string
}

type NavItem = {
  id: SectionId
  label: string
  path: string
  icon: JSX.Element
}

const EMPTY_DATA: WorkspaceData = {
  users: [],
  departments: [],
  assets: [],
  employees: [],
  projects: [],
  tasks: [],
  requests: [],
  inventory: [],
  vendors: [],
  purchaseOrders: [],
  maintenance: [],
  auditLogs: [],
  settings: [],
}

const TASK_STATUS_OPTIONS: SelectOption[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const REQUEST_STATUS_OPTIONS: SelectOption[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
]

const PROJECT_STATUS_OPTIONS: SelectOption[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
]

const INVENTORY_STATUS_OPTIONS: SelectOption[] = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out Of Stock' },
]

const PURCHASE_ORDER_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
]

const MAINTENANCE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
]

function toId(item: EntityBase | null | undefined): string {
  return item?.id || item?._id || ''
}

function formatDate(value?: unknown) {
  if (typeof value !== 'string' || !value) {
    return 'Not set'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString()
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return 'Not set'
  }
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

function labelize(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getStatusTone(value?: string) {
  if (!value) {
    return 'is-neutral'
  }
  if (['active', 'approved', 'received', 'completed', 'done', 'closed', 'in_stock'].includes(value)) {
    return 'is-success'
  }
  if (
    ['pending', 'planned', 'scheduled', 'in_progress', 'on_hold', 'low_stock', 'in_maintenance'].includes(value)
  ) {
    return 'is-warning'
  }
  if (['admin', 'high'].includes(value)) {
    return 'is-info'
  }
  return 'is-neutral'
}

function getMediaUrl(path?: string) {
  if (!path) {
    return ''
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${API_URL}${path}`
}

function getUserInitials(value: string) {
  const parts = value.split(/[.@_\s-]+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'US'
}

function decodeToken() {
  const token = getToken()
  if (!token) {
    return null
  }

  try {
    const [, payload] = token.split('.')
    if (!payload) {
      return null
    }
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const parsed = JSON.parse(window.atob(normalized))
    return {
      email: typeof parsed.email === 'string' ? parsed.email : 'Workspace user',
      role: typeof parsed.role === 'string' ? parsed.role : 'user',
    }
  } catch {
    return null
  }
}

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4Zm9 0A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v1A1.5 1.5 0 0 1 18.5 8h-4A1.5 1.5 0 0 1 13 6.5v-1Zm0 7A1.5 1.5 0 0 1 14.5 11h4a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-6Zm-9 3A1.5 1.5 0 0 1 5.5 14h4a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-3Z" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.5 11a3.5 3.5 0 1 0-2.47-5.97A3.5 3.5 0 0 0 16.5 11Zm-9 1a4 4 0 1 0-2.82-6.82A4 4 0 0 0 7.5 12Zm9 2c-2.77 0-5.5 1.35-5.5 3v1h11v-1c0-1.65-2.73-3-5.5-3Zm-9 1c-3.04 0-6 1.48-6 3.3V20h7v-1c0-1.04.47-2.02 1.35-2.83-.7-.1-1.44-.17-2.35-.17Z" />
    </svg>
  )
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Zm-9 8.5L12 16l9-4.5M3 16.5 12 21l9-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPackage() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Zm0 0v8m7.5-4L12 11 4.5 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 8.5.96-1.94 2.2.1.78 2.06 1.85 1.18 1.94-.95 1.1 1.9-1.5 1.62.16 2.18 1.76 1.33-1.1 1.9-2.1-.4-1.77 1.29-.47 2.16h-2.2L12 19.5l-1.95 1.18h-2.2l-.47-2.16-1.77-1.3-2.1.41-1.1-1.9 1.76-1.32.16-2.18-1.5-1.63 1.1-1.89 1.94.95 1.85-1.18.78-2.06 2.2-.1L12 8.5Zm0 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0 1.6 4.8M20 4v7h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m20 20-3.8-3.8M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 15 4-4 3 3 6-7m0 0h-4m4 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4h6m-7 3h8m-9 13h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.2a2 2 0 0 0-1.8-1h-4a2 2 0 0 0-1.8 1H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7m-12 3h16m-14 0v7.5A1.5 1.5 0 0 0 7.5 19h9a1.5 1.5 0 0 0 1.5-1.5V10M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v2A1.5 1.5 0 0 1 18.5 12h-13A1.5 1.5 0 0 1 4 10.5v-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconList() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5c4.42 0 8 1.34 8 3s-3.58 3-8 3-8-1.34-8-3 3.58-3 8-3Zm8 7c0 1.66-3.58 3-8 3s-8-1.34-8-3m16 4c0 1.66-3.58 3-8 3s-8-1.34-8-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 7h2.5l3.5 4v5h-2M14 7v9m0-9H4v9h2m8 0H10m-4 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm12 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconWrench() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14 6 4 4m-8.5 8.5L4 20l1.5-5.5L14 6l4 4-8.5 8.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm5 0v4h4M9 13h6M9 17h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-kicker">Workspace data</p>
        <h2>{title}</h2>
        <p className="section-copy">{description}</p>
      </div>
      {action}
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <IconDashboard />
      </div>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState<WorkspaceData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [modal, setModal] = useState<ModalState | null>(null)
  const [formValues, setFormValues] = useState<FormState>({})
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [assetFile, setAssetFile] = useState<File | null>(null)
  const [userFile, setUserFile] = useState<File | null>(null)
  const [uploadSubmitting, setUploadSubmitting] = useState(false)

  const currentUser = useMemo(() => decodeToken(), [])

  const helperMaps = useMemo<HelperMaps>(() => {
    const userName = new Map<string, string>()
    for (const user of data.users) {
      userName.set(toId(user), user.email)
    }

    const departmentName = new Map<string, string>()
    for (const department of data.departments) {
      departmentName.set(toId(department), department.name)
    }

    const assetName = new Map<string, string>()
    for (const asset of data.assets) {
      assetName.set(toId(asset), asset.name)
    }

    const employeeName = new Map<string, string>()
    for (const employee of data.employees) {
      employeeName.set(toId(employee), `${employee.firstName} ${employee.lastName}`.trim())
    }

    const projectName = new Map<string, string>()
    for (const project of data.projects) {
      projectName.set(toId(project), project.name)
    }

    const vendorName = new Map<string, string>()
    for (const vendor of data.vendors) {
      vendorName.set(toId(vendor), vendor.name)
    }

    const inventoryName = new Map<string, string>()
    for (const item of data.inventory) {
      inventoryName.set(toId(item), item.name)
    }

    return {
      userName,
      departmentName,
      assetName,
      employeeName,
      projectName,
      vendorName,
      inventoryName,
    }
  }, [data])

  function pushToast(tone: Toast['tone'], message: string) {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, tone, message }])
  }

  useEffect(() => {
    if (!toasts.length) {
      return
    }

    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1))
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toasts])

  async function loadAll() {
    setLoading(true)
    setError('')

    try {
      const [
        users,
        departments,
        assets,
        employees,
        projects,
        tasks,
        requests,
        inventory,
        vendors,
        purchaseOrders,
        maintenance,
        auditLogs,
        settings,
      ] = await Promise.all([
        api.getUsers(),
        api.getDepartments(),
        api.getAssets(),
        api.getEmployees(),
        api.getProjects(),
        api.getTasks(),
        api.getRequests(),
        api.getInventory(),
        api.getVendors(),
        api.getPurchaseOrders(),
        api.getMaintenance(),
        api.getAuditLogs(),
        api.getSettings(),
      ])

      setData({
        users: users.items,
        departments: departments.items,
        assets: assets.items,
        employees: employees.items,
        projects: projects.items,
        tasks: tasks.items,
        requests: requests.items,
        inventory: inventory.items,
        vendors: vendors.items,
        purchaseOrders: purchaseOrders.items,
        maintenance: maintenance.items,
        auditLogs: auditLogs.items,
        settings: settings.items,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load workspace data'
      setError(message)
      pushToast('error', 'Unable to sync dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <IconDashboard /> },
    { id: 'users', label: 'Users', path: '/users', icon: <IconUsers /> },
    { id: 'departments', label: 'Departments', path: '/departments', icon: <IconLayers /> },
    { id: 'assets', label: 'Assets', path: '/assets', icon: <IconPackage /> },
    { id: 'employees', label: 'Employees', path: '/employees', icon: <IconBriefcase /> },
    { id: 'projects', label: 'Projects', path: '/projects', icon: <IconClipboard /> },
    { id: 'tasks', label: 'Tasks', path: '/tasks', icon: <IconList /> },
    { id: 'requests', label: 'Requests', path: '/requests', icon: <IconDocument /> },
    { id: 'inventory', label: 'Inventory', path: '/inventory', icon: <IconDatabase /> },
    { id: 'vendors', label: 'Vendors', path: '/vendors', icon: <IconTruck /> },
    { id: 'purchase-orders', label: 'Purchase Orders', path: '/purchase-orders', icon: <IconDocument /> },
    { id: 'maintenance', label: 'Maintenance', path: '/maintenance', icon: <IconWrench /> },
    { id: 'audit-logs', label: 'Audit Logs', path: '/audit-logs', icon: <IconList /> },
    { id: 'settings', label: 'Settings', path: '/settings', icon: <IconSettings /> },
  ]

  const activeSection = useMemo<SectionId>(() => {
    const match = navItems.find((item) => item.path === location.pathname)
    return match?.id || 'dashboard'
  }, [location.pathname])

  const optionContext = useMemo<OptionContext>(() => ({ data }), [data])

  const sectionMeta = useMemo<Record<Exclude<SectionId, 'dashboard'>, Omit<CollectionConfig, 'columns' | 'searchText' | 'getRows' | 'fields'>>>(() => ({
    users: {
      id: 'users',
      label: 'Users',
      path: '/users',
      eyebrow: 'Access management',
      title: 'Users',
      description: 'Manage workspace roles, credentials, and profile assets.',
      emptyTitle: 'No users found',
      emptyMessage: 'Register users through authentication, then manage them here.',
      canCreate: false,
      canDelete: true,
      canExport: true,
    },
    departments: {
      id: 'departments',
      label: 'Departments',
      path: '/departments',
      eyebrow: 'Structure management',
      title: 'Departments',
      description: 'Define organizational units and ownership boundaries.',
      emptyTitle: 'No departments found',
      emptyMessage: 'Create a department to organize teams and assets.',
      createLabel: 'Department',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    assets: {
      id: 'assets',
      label: 'Assets',
      path: '/assets',
      eyebrow: 'Inventory operations',
      title: 'Assets',
      description: 'Track equipment lifecycle, ownership, and media.',
      emptyTitle: 'No assets found',
      emptyMessage: 'Create an asset to start inventory tracking.',
      createLabel: 'Asset',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    employees: {
      id: 'employees',
      label: 'Employees',
      path: '/employees',
      eyebrow: 'Workforce records',
      title: 'Employees',
      description: 'Maintain employee directories, positions, and department assignment.',
      emptyTitle: 'No employees found',
      emptyMessage: 'Add the first employee to populate the directory.',
      createLabel: 'Employee',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    projects: {
      id: 'projects',
      label: 'Projects',
      path: '/projects',
      eyebrow: 'Delivery planning',
      title: 'Projects',
      description: 'Track projects by owner, department, and delivery window.',
      emptyTitle: 'No projects found',
      emptyMessage: 'Create a project to start planning work.',
      createLabel: 'Project',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    tasks: {
      id: 'tasks',
      label: 'Tasks',
      path: '/tasks',
      eyebrow: 'Execution tracking',
      title: 'Tasks',
      description: 'Break projects into assignable tasks with status and priority.',
      emptyTitle: 'No tasks found',
      emptyMessage: 'Create a task to start operational tracking.',
      createLabel: 'Task',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    requests: {
      id: 'requests',
      label: 'Requests',
      path: '/requests',
      eyebrow: 'Service intake',
      title: 'Requests',
      description: 'Capture service requests, urgency, and routing.',
      emptyTitle: 'No requests found',
      emptyMessage: 'Create a request to begin service intake tracking.',
      createLabel: 'Request',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    inventory: {
      id: 'inventory',
      label: 'Inventory',
      path: '/inventory',
      eyebrow: 'Stock control',
      title: 'Inventory',
      description: 'Manage SKUs, stock levels, and storage locations.',
      emptyTitle: 'No inventory found',
      emptyMessage: 'Create inventory records to manage stock.',
      createLabel: 'Inventory Item',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    vendors: {
      id: 'vendors',
      label: 'Vendors',
      path: '/vendors',
      eyebrow: 'Supplier network',
      title: 'Vendors',
      description: 'Maintain vendor contact details for procurement operations.',
      emptyTitle: 'No vendors found',
      emptyMessage: 'Add a vendor to manage purchasing relationships.',
      createLabel: 'Vendor',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    'purchase-orders': {
      id: 'purchase-orders',
      label: 'Purchase Orders',
      path: '/purchase-orders',
      eyebrow: 'Procurement',
      title: 'Purchase Orders',
      description: 'Track order status, quantity, and cost for procurement.',
      emptyTitle: 'No purchase orders found',
      emptyMessage: 'Create a purchase order to track incoming spend.',
      createLabel: 'Purchase Order',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    maintenance: {
      id: 'maintenance',
      label: 'Maintenance',
      path: '/maintenance',
      eyebrow: 'Asset service',
      title: 'Maintenance',
      description: 'Schedule and complete asset maintenance activities.',
      emptyTitle: 'No maintenance records found',
      emptyMessage: 'Create a maintenance record to schedule work.',
      createLabel: 'Maintenance Record',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    'audit-logs': {
      id: 'audit-logs',
      label: 'Audit Logs',
      path: '/audit-logs',
      eyebrow: 'Traceability',
      title: 'Audit Logs',
      description: 'Review entity changes and actor metadata.',
      emptyTitle: 'No audit logs found',
      emptyMessage: 'Audit events will appear here as actions are recorded.',
      createLabel: 'Audit Log',
      canCreate: true,
      canDelete: true,
      canExport: true,
    },
    settings: {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      eyebrow: 'Workspace controls',
      title: 'Settings',
      description: 'Manage runtime settings, configuration records, and logout.',
      emptyTitle: 'No settings found',
      emptyMessage: 'Create a setting to store environment or product configuration.',
      createLabel: 'Setting',
      canCreate: true,
      canDelete: false,
      canExport: true,
    },
  }), [])

  const collectionConfigs = useMemo<Record<Exclude<SectionId, 'dashboard'>, CollectionConfig>>(() => ({
    users: {
      ...sectionMeta.users,
      fields: [
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
          ],
          required: true,
        },
        {
          name: 'password',
          label: 'Reset Password',
          type: 'password',
          placeholder: 'Leave blank to keep current password',
          help: 'Optional. Must contain letters and numbers.',
        },
      ],
      defaults: { role: 'user', password: '' },
      getRows: (workspace) => workspace.users as AnyRow[],
      update: (id, payload) => api.updateUser(id, payload as { role?: User['role']; password?: string }),
      remove: (id) => api.removeUser(id),
      exportData: () => api.exportUsersCsv(),
      getInitialValues: (row) => ({
        role: String(row.role || 'user'),
        password: '',
      }),
      searchText: (row) => `${row.email || ''} ${row.role || ''}`,
      columns: () => [
        {
          header: 'User',
          render: (row) => {
            const user = row as User
            return (
              <div className="user-cell">
                {user.avatarUrl ? (
                  <img className="user-avatar-image" src={getMediaUrl(user.avatarUrl)} alt={user.email} />
                ) : (
                  <div className="user-avatar">{getUserInitials(user.email)}</div>
                )}
                <div className="table-primary">
                  <strong>{user.email}</strong>
                  <span>{user.avatarUrl ? 'Custom avatar configured' : 'Managed user account'}</span>
                </div>
              </div>
            )
          },
        },
        {
          header: 'Role',
          render: (row) => <span className={`badge ${row.role === 'admin' ? 'is-info' : 'is-neutral'}`}>{String(row.role)}</span>,
        },
        {
          header: 'Created',
          render: (row) => formatDate(row.createdAt),
        },
      ],
    },
    departments: {
      ...sectionMeta.departments,
      fields: [
        { name: 'name', label: 'Department Name', type: 'text', required: true, placeholder: 'Operations' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Handles day-to-day operational requests' },
      ],
      defaults: { name: '', description: '' },
      getRows: (workspace) => workspace.departments as AnyRow[],
      create: (payload) => api.createDepartment(payload as Pick<Department, 'name' | 'description'>),
      update: (id, payload) => api.updateDepartment(id, payload as Pick<Department, 'name' | 'description'>),
      remove: (id) => api.removeDepartment(id),
      exportData: () => api.exportDepartmentsCsv(),
      getInitialValues: (row) => ({
        name: String(row.name || ''),
        description: String(row.description || ''),
      }),
      searchText: (row) => `${row.name || ''} ${row.description || ''}`,
      columns: (helpers) => [
        {
          header: 'Department',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.name || '')}</strong>
              <span>{String(row.description || 'No description')}</span>
            </div>
          ),
        },
        {
          header: 'Assets',
          render: (row) => {
            const count = data.assets.filter((asset) => asset.departmentId === toId(row)).length
            return <span className="badge is-neutral">{count} tracked</span>
          },
        },
        {
          header: 'Created',
          render: (row) => formatDate(row.createdAt),
        },
      ],
    },
    assets: {
      ...sectionMeta.assets,
      fields: [
        { name: 'name', label: 'Asset Name', type: 'text', required: true, placeholder: 'MacBook Pro 16' },
        { name: 'assetTag', label: 'Asset Tag', type: 'text', required: true, placeholder: 'HAP-IT-1042' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'in_maintenance', label: 'In Maintenance' },
            { value: 'retired', label: 'Retired' },
          ],
          required: true,
        },
        {
          name: 'departmentId',
          label: 'Department',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.departments.map((department) => ({
              value: toId(department),
              label: department.name,
            })),
        },
      ],
      defaults: { name: '', assetTag: '', status: 'active', departmentId: '' },
      getRows: (workspace) => workspace.assets as AnyRow[],
      create: (payload) => api.createAsset(payload as Pick<Asset, 'name' | 'assetTag' | 'status' | 'departmentId'>),
      update: (id, payload) => api.updateAsset(id, payload as Pick<Asset, 'name' | 'assetTag' | 'status' | 'departmentId'>),
      remove: (id) => api.removeAsset(id),
      exportData: () => api.exportAssetsCsv(),
      getInitialValues: (row) => ({
        name: String(row.name || ''),
        assetTag: String(row.assetTag || ''),
        status: String(row.status || 'active'),
        departmentId: String(row.departmentId || ''),
      }),
      searchText: (row, helpers) =>
        `${row.name || ''} ${row.assetTag || ''} ${row.status || ''} ${helpers.departmentName.get(String(row.departmentId || '')) || ''}`,
      columns: (helpers) => [
        {
          header: 'Asset',
          render: (row) => {
            const asset = row as Asset
            return (
              <div className="asset-cell">
                {asset.imageUrl ? (
                  <img className="asset-thumb" src={getMediaUrl(asset.imageUrl)} alt={asset.name} />
                ) : (
                  <div className="asset-thumb asset-thumb-fallback">{asset.name.charAt(0).toUpperCase()}</div>
                )}
                <div className="table-primary">
                  <strong>{asset.name}</strong>
                  <span>{asset.assetTag}</span>
                </div>
              </div>
            )
          },
        },
        {
          header: 'Status',
          render: (row) => <span className={`badge ${getStatusTone(String(row.status || ''))}`}>{labelize(String(row.status || 'unknown'))}</span>,
        },
        {
          header: 'Department',
          render: (row) => helpers.departmentName.get(String(row.departmentId || '')) || 'Unassigned',
        },
      ],
    },
    employees: {
      ...sectionMeta.employees,
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Alex' },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true, placeholder: 'Morgan' },
        { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'alex@company.test' },
        { name: 'phone', label: 'Phone', type: 'text', placeholder: '555-0202' },
        {
          name: 'departmentId',
          label: 'Department',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.departments.map((department) => ({
              value: toId(department),
              label: department.name,
            })),
        },
        { name: 'position', label: 'Position', type: 'text', placeholder: 'IT Specialist' },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
          required: true,
        },
      ],
      defaults: { firstName: '', lastName: '', email: '', phone: '', departmentId: '', position: '', status: 'active' },
      getRows: (workspace) => workspace.employees as AnyRow[],
      create: (payload) => api.createEmployee(payload as Omit<Employee, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updateEmployee(id, payload as Partial<Employee>),
      remove: (id) => api.removeEmployee(id),
      exportData: () => api.exportEmployeesCsv(),
      getInitialValues: (row) => ({
        firstName: String(row.firstName || ''),
        lastName: String(row.lastName || ''),
        email: String(row.email || ''),
        phone: String(row.phone || ''),
        departmentId: String(row.departmentId || ''),
        position: String(row.position || ''),
        status: String(row.status || 'active'),
      }),
      searchText: (row, helpers) =>
        `${row.firstName || ''} ${row.lastName || ''} ${row.email || ''} ${row.position || ''} ${
          helpers.departmentName.get(String(row.departmentId || '')) || ''
        } ${row.status || ''}`,
      columns: (helpers) => [
        {
          header: 'Employee',
          render: (row) => (
            <div className="table-primary">
              <strong>{`${String(row.firstName || '')} ${String(row.lastName || '')}`.trim()}</strong>
              <span>{String(row.email || '')}</span>
            </div>
          ),
        },
        {
          header: 'Department',
          render: (row) => helpers.departmentName.get(String(row.departmentId || '')) || 'Unassigned',
        },
        {
          header: 'Status',
          render: (row) => <span className={`badge ${getStatusTone(String(row.status || ''))}`}>{labelize(String(row.status || 'active'))}</span>,
        },
      ],
    },
    projects: {
      ...sectionMeta.projects,
      fields: [
        { name: 'name', label: 'Project Name', type: 'text', required: true, placeholder: 'Network Upgrade' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Switch and router refresh' },
        {
          name: 'departmentId',
          label: 'Department',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.departments.map((department) => ({
              value: toId(department),
              label: department.name,
            })),
        },
        {
          name: 'ownerId',
          label: 'Owner',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.employees.map((employee) => ({
              value: toId(employee),
              label: `${employee.firstName} ${employee.lastName}`.trim(),
            })),
        },
        { name: 'status', label: 'Status', type: 'select', options: PROJECT_STATUS_OPTIONS, required: true },
        { name: 'startDate', label: 'Start Date', type: 'date' },
        { name: 'endDate', label: 'End Date', type: 'date' },
      ],
      defaults: { name: '', description: '', departmentId: '', ownerId: '', status: 'active', startDate: '', endDate: '' },
      getRows: (workspace) => workspace.projects as AnyRow[],
      create: (payload) => api.createProject(payload as Omit<Project, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updateProject(id, payload as Partial<Project>),
      remove: (id) => api.removeProject(id),
      exportData: () => api.exportProjectsCsv(),
      getInitialValues: (row) => ({
        name: String(row.name || ''),
        description: String(row.description || ''),
        departmentId: String(row.departmentId || ''),
        ownerId: String(row.ownerId || ''),
        status: String(row.status || 'active'),
        startDate: String(row.startDate || ''),
        endDate: String(row.endDate || ''),
      }),
      searchText: (row, helpers) =>
        `${row.name || ''} ${row.description || ''} ${row.status || ''} ${
          helpers.departmentName.get(String(row.departmentId || '')) || ''
        } ${helpers.employeeName.get(String(row.ownerId || '')) || ''}`,
      columns: (helpers) => [
        {
          header: 'Project',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.name || '')}</strong>
              <span>{String(row.description || 'No description')}</span>
            </div>
          ),
        },
        {
          header: 'Owner',
          render: (row) => helpers.employeeName.get(String(row.ownerId || '')) || 'Unassigned',
        },
        {
          header: 'Status',
          render: (row) => <span className={`badge ${getStatusTone(String(row.status || ''))}`}>{labelize(String(row.status || 'active'))}</span>,
        },
      ],
    },
    tasks: {
      ...sectionMeta.tasks,
      fields: [
        { name: 'title', label: 'Task Title', type: 'text', required: true, placeholder: 'Rack new switches' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Install hardware in DC' },
        {
          name: 'projectId',
          label: 'Project',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.projects.map((project) => ({
              value: toId(project),
              label: project.name,
            })),
        },
        {
          name: 'assigneeId',
          label: 'Assignee',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.employees.map((employee) => ({
              value: toId(employee),
              label: `${employee.firstName} ${employee.lastName}`.trim(),
            })),
        },
        { name: 'status', label: 'Status', type: 'select', options: TASK_STATUS_OPTIONS, required: true },
        { name: 'dueDate', label: 'Due Date', type: 'date' },
        { name: 'priority', label: 'Priority', type: 'select', options: PRIORITY_OPTIONS, required: true },
      ],
      defaults: { title: '', description: '', projectId: '', assigneeId: '', status: 'open', dueDate: '', priority: 'normal' },
      getRows: (workspace) => workspace.tasks as AnyRow[],
      create: (payload) => api.createTask(payload as Omit<Task, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updateTask(id, payload as Partial<Task>),
      remove: (id) => api.removeTask(id),
      exportData: () => api.exportTasksCsv(),
      getInitialValues: (row) => ({
        title: String(row.title || ''),
        description: String(row.description || ''),
        projectId: String(row.projectId || ''),
        assigneeId: String(row.assigneeId || ''),
        status: String(row.status || 'open'),
        dueDate: String(row.dueDate || ''),
        priority: String(row.priority || 'normal'),
      }),
      searchText: (row, helpers) =>
        `${row.title || ''} ${row.description || ''} ${row.status || ''} ${row.priority || ''} ${
          helpers.projectName.get(String(row.projectId || '')) || ''
        } ${helpers.employeeName.get(String(row.assigneeId || '')) || ''}`,
      columns: (helpers) => [
        {
          header: 'Task',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.title || '')}</strong>
              <span>{String(row.description || 'No description')}</span>
            </div>
          ),
        },
        {
          header: 'Assignment',
          render: (row) => (
            <div className="table-primary">
              <strong>{helpers.employeeName.get(String(row.assigneeId || '')) || 'Unassigned'}</strong>
              <span>{helpers.projectName.get(String(row.projectId || '')) || 'No project'}</span>
            </div>
          ),
        },
        {
          header: 'Status',
          render: (row) => (
            <div className="stack-cell">
              <span className={`badge ${getStatusTone(String(row.status || ''))}`}>{labelize(String(row.status || 'open'))}</span>
              <span className={`badge ${getStatusTone(String(row.priority || ''))}`}>{labelize(String(row.priority || 'normal'))}</span>
            </div>
          ),
        },
      ],
    },
    requests: {
      ...sectionMeta.requests,
      fields: [
        { name: 'title', label: 'Request Title', type: 'text', required: true, placeholder: 'New onboarding laptop' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Need a laptop for new hire' },
        {
          name: 'requesterId',
          label: 'Requester',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.employees.map((employee) => ({
              value: toId(employee),
              label: `${employee.firstName} ${employee.lastName}`.trim(),
            })),
        },
        {
          name: 'departmentId',
          label: 'Department',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.departments.map((department) => ({
              value: toId(department),
              label: department.name,
            })),
        },
        { name: 'status', label: 'Status', type: 'select', options: REQUEST_STATUS_OPTIONS, required: true },
        { name: 'priority', label: 'Priority', type: 'select', options: PRIORITY_OPTIONS, required: true },
      ],
      defaults: { title: '', description: '', requesterId: '', departmentId: '', status: 'open', priority: 'normal' },
      getRows: (workspace) => workspace.requests as AnyRow[],
      create: (payload) => api.createRequest(payload as Omit<RequestRecord, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updateRequest(id, payload as Partial<RequestRecord>),
      remove: (id) => api.removeRequest(id),
      exportData: () => api.exportRequestsCsv(),
      getInitialValues: (row) => ({
        title: String(row.title || ''),
        description: String(row.description || ''),
        requesterId: String(row.requesterId || ''),
        departmentId: String(row.departmentId || ''),
        status: String(row.status || 'open'),
        priority: String(row.priority || 'normal'),
      }),
      searchText: (row, helpers) =>
        `${row.title || ''} ${row.description || ''} ${row.status || ''} ${row.priority || ''} ${
          helpers.employeeName.get(String(row.requesterId || '')) || ''
        } ${helpers.departmentName.get(String(row.departmentId || '')) || ''}`,
      columns: (helpers) => [
        {
          header: 'Request',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.title || '')}</strong>
              <span>{String(row.description || 'No description')}</span>
            </div>
          ),
        },
        {
          header: 'Routing',
          render: (row) => (
            <div className="table-primary">
              <strong>{helpers.employeeName.get(String(row.requesterId || '')) || 'Unassigned'}</strong>
              <span>{helpers.departmentName.get(String(row.departmentId || '')) || 'No department'}</span>
            </div>
          ),
        },
        {
          header: 'Status',
          render: (row) => (
            <div className="stack-cell">
              <span className={`badge ${getStatusTone(String(row.status || ''))}`}>{labelize(String(row.status || 'open'))}</span>
              <span className={`badge ${getStatusTone(String(row.priority || ''))}`}>{labelize(String(row.priority || 'normal'))}</span>
            </div>
          ),
        },
      ],
    },
    inventory: {
      ...sectionMeta.inventory,
      fields: [
        { name: 'name', label: 'Item Name', type: 'text', required: true, placeholder: 'Laptop' },
        { name: 'sku', label: 'SKU', type: 'text', required: true, placeholder: 'LAP-001' },
        { name: 'quantity', label: 'Quantity', type: 'number', placeholder: '10' },
        { name: 'location', label: 'Location', type: 'text', placeholder: 'Warehouse A' },
        { name: 'status', label: 'Status', type: 'select', options: INVENTORY_STATUS_OPTIONS, required: true },
        {
          name: 'vendorId',
          label: 'Vendor',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.vendors.map((vendor) => ({
              value: toId(vendor),
              label: vendor.name,
            })),
        },
      ],
      defaults: { name: '', sku: '', quantity: '0', location: '', status: 'in_stock', vendorId: '' },
      getRows: (workspace) => workspace.inventory as AnyRow[],
      create: (payload) => api.createInventoryItem(payload as Omit<InventoryItem, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updateInventoryItem(id, payload as Partial<InventoryItem>),
      remove: (id) => api.removeInventoryItem(id),
      exportData: () => api.exportInventoryCsv(),
      getInitialValues: (row) => ({
        name: String(row.name || ''),
        sku: String(row.sku || ''),
        quantity: String(row.quantity ?? 0),
        location: String(row.location || ''),
        status: String(row.status || 'in_stock'),
        vendorId: String(row.vendorId || ''),
      }),
      searchText: (row, helpers) =>
        `${row.name || ''} ${row.sku || ''} ${row.location || ''} ${row.status || ''} ${
          helpers.vendorName.get(String(row.vendorId || '')) || ''
        }`,
      columns: (helpers) => [
        {
          header: 'Item',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.name || '')}</strong>
              <span>{String(row.sku || '')}</span>
            </div>
          ),
        },
        {
          header: 'Stock',
          render: (row) => (
            <div className="table-primary">
              <strong>{formatValue(row.quantity)}</strong>
              <span>{String(row.location || 'No location')}</span>
            </div>
          ),
        },
        {
          header: 'Vendor',
          render: (row) => helpers.vendorName.get(String(row.vendorId || '')) || 'Unassigned',
        },
      ],
    },
    vendors: {
      ...sectionMeta.vendors,
      fields: [
        { name: 'name', label: 'Vendor Name', type: 'text', required: true, placeholder: 'Acme Supplies' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'sales@acme.test' },
        { name: 'phone', label: 'Phone', type: 'text', placeholder: '555-0101' },
        { name: 'address', label: 'Address', type: 'textarea', placeholder: '1 Supply Ave' },
      ],
      defaults: { name: '', email: '', phone: '', address: '' },
      getRows: (workspace) => workspace.vendors as AnyRow[],
      create: (payload) => api.createVendor(payload as Omit<Vendor, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updateVendor(id, payload as Partial<Vendor>),
      remove: (id) => api.removeVendor(id),
      exportData: () => api.exportVendorsCsv(),
      getInitialValues: (row) => ({
        name: String(row.name || ''),
        email: String(row.email || ''),
        phone: String(row.phone || ''),
        address: String(row.address || ''),
      }),
      searchText: (row) => `${row.name || ''} ${row.email || ''} ${row.phone || ''} ${row.address || ''}`,
      columns: () => [
        {
          header: 'Vendor',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.name || '')}</strong>
              <span>{String(row.email || 'No email')}</span>
            </div>
          ),
        },
        {
          header: 'Contact',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.phone || 'No phone')}</strong>
              <span>{String(row.address || 'No address')}</span>
            </div>
          ),
        },
        {
          header: 'Created',
          render: (row) => formatDate(row.createdAt),
        },
      ],
    },
    'purchase-orders': {
      ...sectionMeta['purchase-orders'],
      fields: [
        { name: 'orderNumber', label: 'Order Number', type: 'text', required: true, placeholder: 'PO-1001' },
        {
          name: 'vendorId',
          label: 'Vendor',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.vendors.map((vendor) => ({
              value: toId(vendor),
              label: vendor.name,
            })),
        },
        {
          name: 'itemId',
          label: 'Inventory Item',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.inventory.map((item) => ({
              value: toId(item),
              label: `${item.name} (${item.sku})`,
            })),
        },
        { name: 'quantity', label: 'Quantity', type: 'number', placeholder: '5' },
        { name: 'status', label: 'Status', type: 'select', options: PURCHASE_ORDER_STATUS_OPTIONS, required: true },
        { name: 'totalCost', label: 'Total Cost', type: 'number', placeholder: '5000' },
      ],
      defaults: { orderNumber: '', vendorId: '', itemId: '', quantity: '1', status: 'pending', totalCost: '0' },
      getRows: (workspace) => workspace.purchaseOrders as AnyRow[],
      create: (payload) => api.createPurchaseOrder(payload as Omit<PurchaseOrder, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updatePurchaseOrder(id, payload as Partial<PurchaseOrder>),
      remove: (id) => api.removePurchaseOrder(id),
      exportData: () => api.exportPurchaseOrdersCsv(),
      getInitialValues: (row) => ({
        orderNumber: String(row.orderNumber || ''),
        vendorId: String(row.vendorId || ''),
        itemId: String(row.itemId || ''),
        quantity: String(row.quantity ?? 1),
        status: String(row.status || 'pending'),
        totalCost: String(row.totalCost ?? 0),
      }),
      searchText: (row, helpers) =>
        `${row.orderNumber || ''} ${row.status || ''} ${helpers.vendorName.get(String(row.vendorId || '')) || ''} ${
          helpers.inventoryName.get(String(row.itemId || '')) || ''
        }`,
      columns: (helpers) => [
        {
          header: 'Order',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.orderNumber || '')}</strong>
              <span>{helpers.vendorName.get(String(row.vendorId || '')) || 'No vendor'}</span>
            </div>
          ),
        },
        {
          header: 'Item',
          render: (row) => (
            <div className="table-primary">
              <strong>{helpers.inventoryName.get(String(row.itemId || '')) || 'No item linked'}</strong>
              <span>{`${formatValue(row.quantity)} units`}</span>
            </div>
          ),
        },
        {
          header: 'Status',
          render: (row) => (
            <div className="table-primary">
              <strong><span className={`badge ${getStatusTone(String(row.status || ''))}`}>{labelize(String(row.status || 'pending'))}</span></strong>
              <span>${formatValue(row.totalCost)}</span>
            </div>
          ),
        },
      ],
    },
    maintenance: {
      ...sectionMeta.maintenance,
      fields: [
        {
          name: 'assetId',
          label: 'Asset',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.assets.map((asset) => ({
              value: toId(asset),
              label: `${asset.name} (${asset.assetTag})`,
            })),
        },
        { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Replace toner and clean rollers' },
        { name: 'status', label: 'Status', type: 'select', options: MAINTENANCE_STATUS_OPTIONS, required: true },
        { name: 'scheduledDate', label: 'Scheduled Date', type: 'date' },
        { name: 'completedDate', label: 'Completed Date', type: 'date' },
      ],
      defaults: { assetId: '', description: '', status: 'scheduled', scheduledDate: '', completedDate: '' },
      getRows: (workspace) => workspace.maintenance as AnyRow[],
      create: (payload) => api.createMaintenanceRecord(payload as Omit<MaintenanceRecord, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updateMaintenanceRecord(id, payload as Partial<MaintenanceRecord>),
      remove: (id) => api.removeMaintenanceRecord(id),
      exportData: () => api.exportMaintenanceCsv(),
      getInitialValues: (row) => ({
        assetId: String(row.assetId || ''),
        description: String(row.description || ''),
        status: String(row.status || 'scheduled'),
        scheduledDate: String(row.scheduledDate || ''),
        completedDate: String(row.completedDate || ''),
      }),
      searchText: (row, helpers) =>
        `${row.description || ''} ${row.status || ''} ${helpers.assetName.get(String(row.assetId || '')) || ''}`,
      columns: (helpers) => [
        {
          header: 'Maintenance',
          render: (row) => (
            <div className="table-primary">
              <strong>{helpers.assetName.get(String(row.assetId || '')) || 'No asset linked'}</strong>
              <span>{String(row.description || '')}</span>
            </div>
          ),
        },
        {
          header: 'Schedule',
          render: (row) => (
            <div className="table-primary">
              <strong>{formatDate(row.scheduledDate)}</strong>
              <span>{formatDate(row.completedDate)}</span>
            </div>
          ),
        },
        {
          header: 'Status',
          render: (row) => <span className={`badge ${getStatusTone(String(row.status || ''))}`}>{labelize(String(row.status || 'scheduled'))}</span>,
        },
      ],
    },
    'audit-logs': {
      ...sectionMeta['audit-logs'],
      fields: [
        { name: 'action', label: 'Action', type: 'text', required: true, placeholder: 'create' },
        {
          name: 'actorId',
          label: 'Actor',
          type: 'select',
          allowEmpty: true,
          getOptions: (ctx) =>
            ctx.data.users.map((user) => ({
              value: toId(user),
              label: user.email,
            })),
        },
        { name: 'entity', label: 'Entity', type: 'text', required: true, placeholder: 'department' },
        { name: 'entityId', label: 'Entity Id', type: 'text', required: true, placeholder: '64f1234abc1234abc1234abc' },
        {
          name: 'metadata',
          label: 'Metadata JSON',
          type: 'json',
          placeholder: '{"path":"/departments"}',
        },
      ],
      defaults: { action: '', actorId: '', entity: '', entityId: '', metadata: '{}' },
      getRows: (workspace) => workspace.auditLogs as AnyRow[],
      create: (payload) => api.createAuditLog(payload as Omit<AuditLog, 'id' | '_id' | 'createdAt'>),
      update: (id, payload) => api.updateAuditLog(id, payload as Partial<AuditLog>),
      remove: (id) => api.removeAuditLog(id),
      exportData: () => api.exportAuditLogsCsv(),
      getInitialValues: (row) => ({
        action: String(row.action || ''),
        actorId: String(row.actorId || ''),
        entity: String(row.entity || ''),
        entityId: String(row.entityId || ''),
        metadata: JSON.stringify((row.metadata as Record<string, unknown>) || {}, null, 2),
      }),
      searchText: (row, helpers) =>
        `${row.action || ''} ${row.entity || ''} ${row.entityId || ''} ${
          helpers.userName.get(String(row.actorId || '')) || ''
        } ${JSON.stringify(row.metadata || {})}`,
      columns: (helpers) => [
        {
          header: 'Action',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.action || '')}</strong>
              <span>{String(row.entity || '')}</span>
            </div>
          ),
        },
        {
          header: 'Actor',
          render: (row) => helpers.userName.get(String(row.actorId || '')) || 'System',
        },
        {
          header: 'Target',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.entityId || '')}</strong>
              <span>{formatDate(row.createdAt)}</span>
            </div>
          ),
        },
      ],
    },
    settings: {
      ...sectionMeta.settings,
      fields: [
        { name: 'key', label: 'Key', type: 'text', required: true, placeholder: 'workspace', readOnlyOnEdit: true },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Core system settings' },
        {
          name: 'value',
          label: 'Value JSON',
          type: 'json',
          required: true,
          placeholder: '{"timezone":"UTC","maintenanceMode":false}',
        },
      ],
      defaults: { key: '', description: '', value: '{}' },
      getRows: (workspace) => workspace.settings as AnyRow[],
      create: (payload) => api.upsertSetting(String(payload.key || ''), payload as Pick<Setting, 'description' | 'value'>),
      update: (_id, payload) => api.upsertSetting(String(payload.key || ''), payload as Pick<Setting, 'description' | 'value'>),
      exportData: () => api.exportSettingsCsv(),
      getInitialValues: (row) => ({
        key: String(row.key || ''),
        description: String(row.description || ''),
        value: JSON.stringify((row.value as Record<string, unknown>) || {}, null, 2),
      }),
      searchText: (row) => `${row.key || ''} ${row.description || ''} ${JSON.stringify(row.value || {})}`,
      columns: () => [
        {
          header: 'Setting',
          render: (row) => (
            <div className="table-primary">
              <strong>{String(row.key || '')}</strong>
              <span>{String(row.description || 'No description')}</span>
            </div>
          ),
        },
        {
          header: 'Value',
          render: (row) => <code className="inline-code">{JSON.stringify(row.value || {})}</code>,
        },
        {
          header: 'Created',
          render: (row) => formatDate(row.createdAt),
        },
      ],
    },
  }), [data.assets, data.departments, data.employees, data.inventory, data.users, data.vendors, sectionMeta])

  const currentCollection = activeSection === 'dashboard' ? null : collectionConfigs[activeSection]
  const currentRows = useMemo(() => {
    if (!currentCollection) {
      return []
    }

    const query = search.trim().toLowerCase()
    const rows = currentCollection.getRows(data)
    if (!query) {
      return rows
    }

    return rows.filter((row) => currentCollection.searchText(row, helperMaps).toLowerCase().includes(query))
  }, [currentCollection, data, helperMaps, search])

  function openModal(section: Exclude<SectionId, 'dashboard'>, mode: 'create' | 'edit', row?: AnyRow) {
    const config = collectionConfigs[section]
    setFormError('')
    setAssetFile(null)
    setUserFile(null)
    setUploadSubmitting(false)
    setModal({ section, mode, itemId: row ? toId(row) : undefined })
    setFormValues(
      mode === 'edit' && row && config.getInitialValues
        ? config.getInitialValues(row)
        : { ...(config.defaults || {}) },
    )
  }

  function closeModal() {
    setModal(null)
    setFormValues({})
    setFormError('')
    setAssetFile(null)
    setUserFile(null)
    setUploadSubmitting(false)
  }

  function updateField(name: string, value: string) {
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  function logout() {
    clearToken()
    navigate('/auth', { replace: true })
  }

  function buildPayload(config: CollectionConfig, mode: 'create' | 'edit') {
    const payload: Record<string, unknown> = {}

    for (const field of config.fields) {
      const raw = formValues[field.name] ?? ''
      const trimmed = raw.trim()

      if (field.required && !trimmed) {
        throw new Error(`${field.label} is required`)
      }

      if (field.readOnlyOnEdit && mode === 'edit') {
        payload[field.name] = trimmed
        continue
      }

      if (!trimmed) {
        if (field.type === 'password') {
          continue
        }
        if (field.type === 'json') {
          payload[field.name] = {}
          continue
        }
        if (field.type === 'number') {
          continue
        }
        if (field.type === 'select') {
          continue
        }
        if (field.type === 'textarea' || field.type === 'text' || field.type === 'email' || field.type === 'date') {
          if (field.required) {
            payload[field.name] = ''
          }
          continue
        }
      }

      if (field.type === 'number') {
        payload[field.name] = Number(trimmed)
      } else if (field.type === 'json') {
        payload[field.name] = JSON.parse(trimmed)
      } else {
        payload[field.name] = trimmed
      }
    }

    if (config.id === 'settings') {
      payload.key = String(formValues.key || '').trim()
      payload.description = String(formValues.description || '').trim()
      payload.value = JSON.parse(String(formValues.value || '{}'))
    }

    return payload
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!modal) {
      return
    }

    const config = collectionConfigs[modal.section]
    setFormSubmitting(true)
    setFormError('')

    try {
      const payload = buildPayload(config, modal.mode)
      let saved: unknown
      if (modal.mode === 'create' && config.create) {
        saved = await config.create(payload)
      } else if (modal.mode === 'edit' && modal.itemId && config.update) {
        saved = await config.update(modal.itemId, payload)
      } else {
        throw new Error('This record cannot be saved from the current form')
      }

      const savedId = toId((saved as EntityBase) || null)
      if (modal.section === 'assets' && assetFile && savedId) {
        setUploadSubmitting(true)
        await api.uploadAssetImage(savedId, assetFile)
      }
      if (modal.section === 'users' && userFile && savedId) {
        setUploadSubmitting(true)
        await api.uploadUserAvatar(savedId, userFile)
      }

      await loadAll()
      closeModal()
      pushToast('success', `${config.label} ${modal.mode === 'create' ? 'created' : 'updated'}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save changes')
    } finally {
      setFormSubmitting(false)
      setUploadSubmitting(false)
    }
  }

  async function handleDelete(section: Exclude<SectionId, 'dashboard'>, itemId: string) {
    const config = collectionConfigs[section]
    if (!config.remove) {
      return
    }

    setDeleteId(itemId)
    try {
      await config.remove(itemId)
      await loadAll()
      pushToast('success', `${config.label} record deleted`)
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleteId('')
    }
  }

  const dashboardStats = [
    {
      label: 'Tracked assets',
      value: data.assets.length,
      copy: `${data.maintenance.length} maintenance records linked`,
    },
    {
      label: 'Active employees',
      value: data.employees.filter((employee) => employee.status !== 'inactive').length,
      copy: `${data.departments.length} departments staffed`,
    },
    {
      label: 'Open work',
      value:
        data.tasks.filter((task) => task.status !== 'done').length +
        data.requests.filter((request) => request.status !== 'closed').length,
      copy: `${data.projects.length} projects in motion`,
    },
    {
      label: 'Suppliers',
      value: data.vendors.length,
      copy: `${data.purchaseOrders.length} purchase orders tracked`,
    },
  ]

  const sectionActions =
    activeSection === 'dashboard' ? (
      <>
        <button type="button" className="secondary-button" onClick={() => openModal('departments', 'create')}>
          <span className="button-icon">
            <IconPlus />
          </span>
          Department
        </button>
        <button type="button" className="secondary-button" onClick={() => openModal('assets', 'create')}>
          <span className="button-icon">
            <IconPlus />
          </span>
          Asset
        </button>
        <button type="button" className="secondary-button" onClick={() => openModal('projects', 'create')}>
          <span className="button-icon">
            <IconPlus />
          </span>
          Project
        </button>
      </>
    ) : (
      <>
        {currentCollection?.canCreate && (
          <button type="button" className="secondary-button" onClick={() => openModal(currentCollection.id, 'create')}>
            <span className="button-icon">
              <IconPlus />
            </span>
            {currentCollection.createLabel || currentCollection.label}
          </button>
        )}
        <button type="button" className="ghost-button" onClick={() => void loadAll()}>
          <span className="button-icon">
            <IconRefresh />
          </span>
          Refresh
        </button>
      </>
    )

  const dashboardView = (
    <>
      <section className="hero-panel">
        <div>
          <p className="hero-kicker">Operational workspace</p>
          <h2>Management Control Panel</h2>
          <p>
            One workspace for people, departments, assets, projects, inventory, procurement, maintenance, and audit history.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" onClick={() => openModal('employees', 'create')}>
            <span className="button-icon">
              <IconPlus />
            </span>
            Employee
          </button>
          <button type="button" className="secondary-button" onClick={() => openModal('inventory', 'create')}>
            <span className="button-icon">
              <IconPlus />
            </span>
            Inventory Item
          </button>
        </div>
      </section>

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <div className="stat-card-top">
              <div>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </div>
              <span className="stat-trend">
                <IconTrend />
                Live
              </span>
            </div>
            <span>{stat.copy}</span>
          </article>
        ))}
      </section>

      <section className="insight-grid">
        <article className="panel">
          <SectionHeader
            title="Department Distribution"
            description="Track how assets are spread across operational units."
          />
          <div className="distribution-list">
            {data.departments.length ? (
              data.departments.map((department) => {
                const count = data.assets.filter((asset) => asset.departmentId === toId(department)).length
                const width = data.assets.length ? Math.max(8, (count / data.assets.length) * 100) : 8
                return (
                  <div key={toId(department)} className="distribution-item">
                    <div className="distribution-copy">
                      <div>
                        <strong>{department.name}</strong>
                        <span>{department.description || 'Operational unit'}</span>
                      </div>
                      <strong>{count}</strong>
                    </div>
                    <div className="distribution-bar">
                      <span style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <EmptyState title="No departments yet" message="Create departments to view operational distribution." />
            )}
          </div>
        </article>

        <article className="panel">
          <SectionHeader
            title="Recent Audit Activity"
            description="The latest logged actions across the workspace."
          />
          <div className="health-list">
            {data.auditLogs.slice(0, 5).length ? (
              data.auditLogs.slice(0, 5).map((entry) => (
                <div key={toId(entry)} className="health-item">
                  <span className="health-dot is-success" />
                  <div>
                    <strong>{`${entry.action} ${entry.entity}`}</strong>
                    <p>{helperMaps.userName.get(entry.actorId || '') || 'System'} • {formatDate(entry.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No audit events" message="Audit events will appear here after changes are recorded." />
            )}
          </div>
        </article>
      </section>

      <section className="insight-grid">
        <article className="panel">
          <SectionHeader
            title="Procurement Snapshot"
            description="Monitor stock, suppliers, and order pipeline in one view."
          />
          <div className="settings-list">
            <div className="setting-item">
              <span className="setting-label">Inventory items</span>
              <span>{data.inventory.length} SKUs tracked</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Low stock alerts</span>
              <span>{data.inventory.filter((item) => item.status === 'low_stock' || item.status === 'out_of_stock').length} items need attention</span>
            </div>
            <div className="setting-item">
              <span className="setting-label">Pending purchase orders</span>
              <span>{data.purchaseOrders.filter((order) => order.status === 'pending').length} awaiting action</span>
            </div>
          </div>
        </article>

        <article className="panel">
          <SectionHeader
            title="Workspace Settings"
            description="Live configuration records stored through the backend settings API."
          />
          <div className="settings-list">
            {data.settings.slice(0, 3).length ? (
              data.settings.slice(0, 3).map((setting) => (
                <div key={toId(setting)} className="setting-item">
                  <span className="setting-label">{setting.key}</span>
                  <code>{JSON.stringify(setting.value || {})}</code>
                </div>
              ))
            ) : (
              <EmptyState title="No settings configured" message="Create workspace settings to surface them here." />
            )}
          </div>
        </article>
      </section>
    </>
  )

  function renderCollectionSection(config: CollectionConfig) {
    return (
      <section className="panel">
        <SectionHeader
          title={config.title}
          description={config.description}
          action={
            <div className="toolbar-actions">
              {config.canExport && config.exportData && (
                <button type="button" className="ghost-button compact-button" onClick={() => void config.exportData?.()}>
                  Export CSV
                </button>
              )}
              {config.id === 'settings' && (
                <button type="button" className="ghost-danger-button" onClick={logout}>
                  Log out
                </button>
              )}
            </div>
          }
        />

        <div className="table-toolbar">
          <p>
            Showing <strong>{currentRows.length}</strong> records
          </p>
          {config.id === 'settings' && (
            <span className="badge is-info">Live settings API</span>
          )}
        </div>

        {loading ? (
          <div className="table-skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : currentRows.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {config.columns(helperMaps).map((column) => (
                    <th key={column.header}>{column.header}</th>
                  ))}
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => {
                  const rowId = toId(row)
                  return (
                    <tr key={rowId || JSON.stringify(row)}>
                      {config.columns(helperMaps).map((column) => (
                        <td key={column.header}>{column.render(row)}</td>
                      ))}
                      <td className="table-actions">
                        <div className="row-actions">
                          {config.update && (
                            <button type="button" className="ghost-button" onClick={() => openModal(config.id, 'edit', row)}>
                              Edit
                            </button>
                          )}
                          {config.canDelete && config.remove && rowId && (
                            <button
                              type="button"
                              className="ghost-danger-button"
                              onClick={() => void handleDelete(config.id, rowId)}
                              disabled={deleteId === rowId}
                            >
                              {deleteId === rowId ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={config.emptyTitle} message={config.emptyMessage} />
        )}
      </section>
    )
  }

  return (
    <>
      <main className="saas-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">H</div>
            <div>
              <strong>HAP Control</strong>
              <p>Management Suite</p>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-card">
            <p className="sidebar-card-label">Workspace status</p>
            <strong>All systems normal</strong>
            <p>
              {data.assets.length} assets, {data.tasks.length} tasks, {data.purchaseOrders.length} purchase orders.
            </p>
          </div>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">{activeSection === 'dashboard' ? 'Operational workspace' : sectionMeta[activeSection as Exclude<SectionId, 'dashboard'>].eyebrow}</p>
              <h1>{activeSection === 'dashboard' ? 'Management Control Panel' : sectionMeta[activeSection as Exclude<SectionId, 'dashboard'>].title}</h1>
              <p className="topbar-copy">
                {activeSection === 'dashboard'
                  ? 'A centralized view of teams, assets, projects, inventory, procurement, maintenance, and account activity.'
                  : sectionMeta[activeSection as Exclude<SectionId, 'dashboard'>].description}
              </p>
            </div>

            <div className="topbar-actions">
              <label className="search-field" aria-label="Search workspace data">
                <span className="search-icon">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  placeholder={activeSection === 'dashboard' ? 'Search a section from the sidebar' : `Search ${sectionMeta[activeSection as Exclude<SectionId, 'dashboard'>].label.toLowerCase()}`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              {search && (
                <button type="button" className="ghost-button compact-button" onClick={() => setSearch('')}>
                  Clear
                </button>
              )}

              {sectionActions}

              <div className="profile-chip">
                <div className="profile-avatar">{getUserInitials(currentUser?.email || 'Admin')}</div>
                <div>
                  <strong>{currentUser?.email || 'Admin workspace'}</strong>
                  <p>{currentUser?.role || 'administrator'}</p>
                </div>
              </div>
            </div>
          </header>

          {error && <p className="error-box">{error}</p>}

          {activeSection === 'dashboard' ? dashboardView : renderCollectionSection(collectionConfigs[activeSection])}
        </section>
      </main>

      {modal && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <section
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entity-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="section-kicker">{modal.mode === 'create' ? 'Create record' : 'Update record'}</p>
                <h2 id="entity-modal-title">
                  {modal.mode === 'create' ? `Create ${collectionConfigs[modal.section].createLabel || collectionConfigs[modal.section].label}` : `Edit ${collectionConfigs[modal.section].label}`}
                </h2>
              </div>
              <button type="button" className="ghost-button" onClick={closeModal}>
                Close
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="stack-form">
              {collectionConfigs[modal.section].fields.map((field) => {
                const options = field.options || field.getOptions?.(optionContext) || []
                const isReadOnly = field.readOnlyOnEdit && modal.mode === 'edit'

                if (field.type === 'textarea' || field.type === 'json') {
                  return (
                    <label key={field.name}>
                      {field.label}
                      <textarea
                        value={formValues[field.name] || ''}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={field.type === 'json' ? 7 : 4}
                        readOnly={isReadOnly}
                      />
                      {field.help && <span className="field-help">{field.help}</span>}
                    </label>
                  )
                }

                return (
                  <label key={field.name}>
                    {field.label}
                    {field.type === 'select' ? (
                      <select
                        value={formValues[field.name] || ''}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        required={field.required}
                        disabled={isReadOnly}
                      >
                        {field.allowEmpty && <option value="">Unassigned</option>}
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formValues[field.name] || ''}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        readOnly={isReadOnly}
                      />
                    )}
                    {field.help && <span className="field-help">{field.help}</span>}
                  </label>
                )
              })}

              {modal.section === 'assets' && (
                <label>
                  Asset Image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setAssetFile(event.target.files?.[0] || null)}
                  />
                  <span className="field-help">Optional. PNG, JPG, or WebP up to 5MB.</span>
                </label>
              )}

              {modal.section === 'users' && modal.mode === 'edit' && (
                <label>
                  User Avatar
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setUserFile(event.target.files?.[0] || null)}
                  />
                  <span className="field-help">Optional. Upload a new avatar while saving.</span>
                </label>
              )}

              {formError && <p className="error-box">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="ghost-button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting || uploadSubmitting}>
                  {formSubmitting || uploadSubmitting ? 'Saving...' : modal.mode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tone === 'success' ? 'is-success' : 'is-error'}`}>
            <strong>{toast.tone === 'success' ? 'Success' : 'Error'}</strong>
            <p>{toast.message}</p>
          </div>
        ))}
      </div>
    </>
  )
}
