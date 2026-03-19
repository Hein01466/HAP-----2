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
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
