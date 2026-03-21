import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'

export function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await api.register(email, password)
      }
      const login = await api.login(email, password)
      setToken(login.access_token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <article className="auth-showcase">
          <div className="auth-showcase-copy">
            <p className="eyebrow">HAP Management System</p>
            <h1>Modern control for teams, assets, and operations.</h1>
            <p>
              A production-ready workspace for departments, inventory, and user administration with
              clear reporting and cleaner workflows.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-card">
              <strong>Live inventory oversight</strong>
              <p>Track asset status, ownership, and department distribution from one dashboard.</p>
            </div>
            <div className="auth-feature-card">
              <strong>Role-based access</strong>
              <p>Separate admin and user permissions with a simple, secure sign-in flow.</p>
            </div>
            <div className="auth-feature-card">
              <strong>Operational clarity</strong>
              <p>Reduce manual coordination with organized data tables and guided actions.</p>
            </div>
          </div>
        </article>

        <article className="auth-card">
          <div className="auth-card-header">
            <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create workspace access'}</p>
            <h2>{mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}</h2>
            <p className="section-copy">
              {mode === 'login'
                ? 'Use your company email to continue to the management console.'
                : 'Register a new account, then continue directly into the dashboard.'}
            </p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <label>
              Work email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
              <span className="field-help">Use the email address associated with your workspace access.</span>
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <span className="field-help">Minimum 6 characters. Use a strong password for admin accounts.</span>
            </label>

            {error && <p className="error-box">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Register & Continue'}
            </button>
          </form>

          <button
            type="button"
            className="link-button"
            onClick={() => {
              setError('')
              setMode(mode === 'login' ? 'register' : 'login')
            }}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
        </article>
      </section>
    </main>
  )
}
