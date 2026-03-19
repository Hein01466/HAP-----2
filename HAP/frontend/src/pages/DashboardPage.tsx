import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { clearToken } from '../lib/auth'
import type { Asset, Department, User } from '../lib/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [departmentName, setDepartmentName] = useState('')
  const [departmentDesc, setDepartmentDesc] = useState('')

  const [assetName, setAssetName] = useState('')
  const [assetTag, setAssetTag] = useState('')
  const [assetStatus, setAssetStatus] = useState('active')
  const [assetDepartmentId, setAssetDepartmentId] = useState('')

  async function loadData() {
    setError('')
    setLoading(true)
    try {
      const [userRes, depRes, assetRes] = await Promise.all([
        api.getUsers(),
        api.getDepartments(),
        api.getAssets(),
      ])
      setUsers(userRes.items)
      setDepartments(depRes.items)
      setAssets(assetRes.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const stats = useMemo(
    () => [
      { label: 'Users', value: users.length },
      { label: 'Departments', value: departments.length },
      { label: 'Assets', value: assets.length },
    ],
    [users.length, departments.length, assets.length],
  )

  async function createDepartment(event: FormEvent) {
    event.preventDefault()
    await api.createDepartment({ name: departmentName, description: departmentDesc })
    setDepartmentName('')
    setDepartmentDesc('')
    await loadData()
  }

  async function createAsset(event: FormEvent) {
    event.preventDefault()
    await api.createAsset({
      name: assetName,
      assetTag,
      status: assetStatus,
      departmentId: assetDepartmentId || undefined,
    })
    setAssetName('')
    setAssetTag('')
    setAssetStatus('active')
    setAssetDepartmentId('')
    await loadData()
  }

  async function removeDepartment(id: string) {
    await api.removeDepartment(id)
    await loadData()
  }

  function logout() {
    clearToken()
    navigate('/auth')
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Operational Workspace</p>
          <h1>Management Control Panel</h1>
        </div>
        <div className="header-actions">
          <button onClick={() => void loadData()}>Refresh</button>
          <button className="danger" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error && <p className="error-box">{error}</p>}

      <section className="stats-grid">
        {stats.map((item) => (
          <article key={item.label} className="stat-card">
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Create Department</h2>
          <form onSubmit={createDepartment} className="stack-form">
            <input
              placeholder="Department name"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              required
            />
            <input
              placeholder="Description (optional)"
              value={departmentDesc}
              onChange={(e) => setDepartmentDesc(e.target.value)}
            />
            <button type="submit">Save Department</button>
          </form>
        </article>

        <article className="panel">
          <h2>Create Asset</h2>
          <form onSubmit={createAsset} className="stack-form">
            <input placeholder="Asset name" value={assetName} onChange={(e) => setAssetName(e.target.value)} required />
            <input placeholder="Asset tag" value={assetTag} onChange={(e) => setAssetTag(e.target.value)} required />
            <select value={assetStatus} onChange={(e) => setAssetStatus(e.target.value)}>
              <option value="active">active</option>
              <option value="in_maintenance">in_maintenance</option>
              <option value="retired">retired</option>
            </select>
            <select value={assetDepartmentId} onChange={(e) => setAssetDepartmentId(e.target.value)}>
              <option value="">No department</option>
              {departments.map((dep) => (
                <option key={dep.id || dep._id} value={dep.id || dep._id}>
                  {dep.name}
                </option>
              ))}
            </select>
            <button type="submit">Save Asset</button>
          </form>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Departments</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="item-list">
              {departments.map((dep) => {
                const id = dep.id || dep._id || ''
                return (
                  <li key={id}>
                    <div>
                      <strong>{dep.name}</strong>
                      <p>{dep.description || 'No description'}</p>
                    </div>
                    {id && (
                      <button className="danger" onClick={() => void removeDepartment(id)}>
                        Delete
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </article>

        <article className="panel">
          <h2>Assets</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="item-list">
              {assets.map((asset) => (
                <li key={asset.id || asset._id}>
                  <div>
                    <strong>{asset.name}</strong>
                    <p>
                      {asset.assetTag} | {asset.status || 'unknown'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="panel">
        <h2>Users</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="item-list">
            {users.map((user) => (
              <li key={user.id || user._id}>
                <div>
                  <strong>{user.email}</strong>
                  <p>{user.role}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
