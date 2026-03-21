import { Navigate, Route, Routes } from 'react-router-dom'
import { getToken } from './lib/auth'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!getToken()) {
    return <Navigate to="/auth" replace />
  }
  return children
}

export function App() {
  const protectedPaths = [
    '/dashboard',
    '/users',
    '/departments',
    '/assets',
    '/employees',
    '/projects',
    '/tasks',
    '/requests',
    '/inventory',
    '/vendors',
    '/purchase-orders',
    '/maintenance',
    '/audit-logs',
    '/settings',
  ]

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      {protectedPaths.map((path) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
