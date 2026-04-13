import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type User = {
  id: string
  displayName: string
  avatarUrl?: string
  credits?: number
  email?: string
  bio?: string
  isAdmin?: boolean
  role?: string
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (params: { username: string; password: string }) => Promise<{ ok: true; user: User } | { ok: false; message: string }>
  signup: (params: {
    username: string
    password: string
    email: string
    otp: string
  }) => Promise<{ ok: true } | { ok: false; message: string }>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const STORAGE_KEY = 'vortex.auth.token'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [isInitializing, setIsInitializing] = useState(true)

  // Mapping from Laravel user to React user
  const mapUser = (apiUser: any): User => ({
    id: String(apiUser.user_id || apiUser.id),
    displayName: apiUser.username,
    email: apiUser.email,
    role: apiUser.role,
    isAdmin: apiUser.role === 'admin' || apiUser.role === 'organizer',
    credits: apiUser.credits || 0,
    avatarUrl: apiUser.profile_photo || 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80&w=200&h=200',
    bio: ''
  })

  useEffect(() => {
    if (!token) {
      setIsInitializing(false)
      setUser(null)
      return
    }

    // Tries to restore session using token
    fetch('/api/auth/me', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async res => {
        if (!res.ok) throw new Error('Session exact')
        return res.json()
      })
      .then(payload => {
        setUser(mapUser(payload.data))
      })
      .catch(() => {
        // Invalid token
        setToken(null)
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
      })
      .finally(() => {
        setIsInitializing(false)
      })
  }, [token])

  const signup = useCallback(
    async ({ username, password, email, otp }: { username: string; password: string; email: string; otp: string }) => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username,
            password,
            email,
            otp,
          })
        })

        const payload = await response.json()
        if (!response.ok) {
          const errors = payload.errors ? Object.values(payload.errors).join(', ') : payload.message;
          return { ok: false as const, message: errors || 'Registration failed' }
        }

        return { ok: true as const }
      } catch (err) {
        return { ok: false as const, message: 'Network error occurred.' }
      }
    },
    [],
  )

  const login = useCallback(async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: username.includes('@') ? username : undefined,
          username: !username.includes('@') ? username : undefined,
          password
        })
      })

      const payload = await response.json()

      if (!response.ok) {
        return { ok: false as const, message: payload.message || 'Login failed' }
      }

      const t = payload.token;
      localStorage.setItem(STORAGE_KEY, t)
      setToken(t)
      const u = mapUser(payload.data)
      setUser(u)

      return { ok: true as const, user: u }
    } catch (err) {
      return { ok: false as const, message: 'Terminal offline. Server unresponsive.' }
    }
  }, [])

  const logout = useCallback(async () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }).catch(console.error)
    }
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [token])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isInitializing,
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, isInitializing, login, signup, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
