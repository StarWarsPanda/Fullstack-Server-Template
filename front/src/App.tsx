import { useEffect, useState, type FormEvent } from 'react'
import { loginUser, registerUser, type UserProfile } from './api/auth'
import { API_CONFIG } from './config/api'
import './App.css'

type Page = 'home' | 'auth' | 'settings'
type AuthMode = 'login' | 'register'

const LOCAL_USER_KEY = 'auth_user_v1'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value == null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string'
  )
}

function readStoredUser(): UserProfile | null {
  const raw = localStorage.getItem(LOCAL_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (isUserProfile(parsed)) {
      return parsed
    }
  } catch {
    localStorage.removeItem(LOCAL_USER_KEY)
  }

  return null
}

function persistUser(user: UserProfile): void {
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user))
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = readStoredUser()
    if (storedUser) {
      setUser(storedUser)
      setPage('settings')
    }
  }, [])

  const goHome = () => {
    setError(null)
    setPage('home')
  }

  const goAuth = (mode: AuthMode) => {
    setError(null)
    setAuthMode(mode)
    setPage('auth')
  }

  const goSettings = () => {
    if (!user) {
      setError('Please login first to access settings.')
      setPage('auth')
      return
    }

    setError(null)
    setPage('settings')
  }

  const clearAuthForm = () => {
    setPassword('')
    setConfirmPassword('')
  }

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_USER_KEY)
    setUser(null)
    setError(null)
    setPage('home')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()

    if (!trimmedUsername) {
      setError('Username is required.')
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    if (authMode === 'register') {
      if (password !== confirmPassword) {
        setError('Password confirmation does not match.')
        return
      }

      if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
        setError('Please enter a valid email address.')
        return
      }
    }

    setLoading(true)

    try {
      if (authMode === 'login') {
        const loginResult = await loginUser(trimmedUsername, password)
        if (!loginResult.ok) {
          setError(loginResult.message)
          return
        }

        persistUser(loginResult.data)
        setUser(loginResult.data)
        clearAuthForm()
        setPage('settings')
        return
      }

      const registerResult = await registerUser(trimmedUsername, password, trimmedEmail)
      if (!registerResult.ok) {
        setError(registerResult.message)
        return
      }

      const loginResult = await loginUser(trimmedUsername, password)
      if (loginResult.ok) {
        persistUser(loginResult.data)
        setUser(loginResult.data)
        clearAuthForm()
        setPage('settings')
        return
      }

      const fallbackUser: UserProfile = {
        id: registerResult.data.id,
        name: trimmedUsername,
        email: trimmedEmail,
      }
      persistUser(fallbackUser)
      setUser(fallbackUser)
      clearAuthForm()
      setPage('settings')
    } finally {
      setLoading(false)
    }
  }

  const renderPage = () => {
    if (page === 'home') {
      return (
        <section>
          <h1>Home</h1>
          <p>Basic page switching and auth flow are ready.</p>
          <p>API base URL: {API_CONFIG.baseUrl}</p>
          <div>
            <button type="button" onClick={() => goAuth('login')}>
              Login
            </button>
            <button type="button" onClick={() => goAuth('register')}>
              Registration
            </button>
            <button type="button" onClick={goSettings}>
              User Settings
            </button>
          </div>
        </section>
      )
    }

    if (page === 'auth') {
      return (
        <section>
          <h2>{authMode === 'login' ? 'Login' : 'Registration'}</h2>
          <div>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              disabled={authMode === 'login' || loading}
            >
              Login Mode
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              disabled={authMode === 'register' || loading}
            >
              Register Mode
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={loading}
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label htmlFor="email">Email (optional)</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading
                ? 'Submitting...'
                : authMode === 'login'
                  ? 'Login'
                  : 'Create Account'}
            </button>
            <button type="button" onClick={goHome} disabled={loading}>
              Back to Home
            </button>
          </form>
        </section>
      )
    }

    if (page === 'settings') {
      return (
        <section>
          <h2>User Settings</h2>
          {user ? (
            <div>
              <p>User ID: {user.id}</p>
              <p>Username: {user.name}</p>
              <p>Email: {user.email || '(none provided)'}</p>
            </div>
          ) : (
            <p>No user data available.</p>
          )}
          <button type="button" onClick={goHome}>
            Back to Home
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </section>
      )
    }

    return null
  }

  return (
    <>
      <nav>
        <button type="button" onClick={goHome}>
          Home
        </button>
        <button type="button" onClick={() => goAuth('login')}>
          Login/Registration
        </button>
        <button type="button" onClick={goSettings}>
          User Settings
        </button>
      </nav>

      {error && <p>{error}</p>}
      {renderPage()}
    </>
  )
}

export default App
