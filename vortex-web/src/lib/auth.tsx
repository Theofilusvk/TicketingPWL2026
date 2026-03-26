import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type User = {
  id: string
  displayName: string
  avatarUrl?: string
  credits?: number
  email?: string
  bio?: string
  isAdmin?: boolean
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (params: { username: string; password: string }) => { ok: true; user: User } | { ok: false; message: string }
  signup: (params: {
    username: string
    password: string
  }) => { ok: true } | { ok: false; message: string }
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const STORAGE_KEY = 'vortex.auth.user'
const STORAGE_USERS_KEY = 'vortex.auth.users'

type StoredUser = {
  username: string
  password: string
}

function safeParseUser(value: string | null): User | null {
  if (!value) return null
  try {
    return JSON.parse(value) as User
  } catch {
    return null
  }
}

function safeParseUsers(value: string | null): StoredUser[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((u) => {
        if (!u || typeof u !== 'object') return null
        const maybe = u as Partial<StoredUser>
        if (typeof maybe.username !== 'string' || typeof maybe.password !== 'string') return null
        return { username: maybe.username, password: maybe.password }
      })
      .filter(Boolean) as StoredUser[]
  } catch {
    return []
  }
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    safeParseUser(localStorage.getItem(STORAGE_KEY)),
  )

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setUser(safeParseUser(e.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const signup = useCallback(
    ({ username, password }: { username: string; password: string }) => {
      const u = normalizeUsername(username)
      if (!u) return { ok: false as const, message: 'Username is required.' }
      if (!password) return { ok: false as const, message: 'Security key is required.' }
      if (u === 'admin') return { ok: false as const, message: 'Username reserved by system.' }

      const users = safeParseUsers(localStorage.getItem(STORAGE_USERS_KEY))
      if (users.some((x) => normalizeUsername(x.username) === u)) {
        return { ok: false as const, message: 'User already exists. Please login.' }
      }

      const nextUsers: StoredUser[] = [...users, { username: u, password }]
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(nextUsers))
      return { ok: true as const }
    },
    [],
  )

  const login = useCallback(({ username, password }: { username: string; password: string }) => {
    const u = normalizeUsername(username)
    if (!u) return { ok: false as const, message: 'Username is required.' }
    if (!password) return { ok: false as const, message: 'Security key is required.' }

    // Hardcoded Admin Account Bypass
    if (u === 'admin' && password === 'vortexadmin') {
      const adminUser: User = {
        id: 'sys_admin_77',
        displayName: 'SYS_ADMIN',
        isAdmin: true,
        email: 'root@vortex.net',
        bio: 'Supreme architect of the Vortex ecosystem.',
        avatarUrl: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80&w=200&h=200',
        credits: 999999,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser))
      setUser(adminUser)
      return { ok: true as const, user: adminUser }
    }

    const users = safeParseUsers(localStorage.getItem(STORAGE_USERS_KEY))
    const existing = users.find((x) => normalizeUsername(x.username) === u)
    if (!existing) {
      return { ok: false as const, message: 'Account not found. Please sign up.' }
    }
    if (existing.password !== password) {
      return { ok: false as const, message: 'Invalid security key.' }
    }

    const next: User = {
      id: `user_${Math.random().toString(16).slice(2)}`,
      displayName: u.toUpperCase(),
      isAdmin: false,
      email: `${u}@vortex.net`,
      bio: 'Infiltrating the mainframe since the last solar flare. High-frequency trader of rave-credits.',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBzxmQbfxvOo0UHykfktpWT3JkM4VIJm6AFKFMQd4O1dbg1UuxoEY56Xlg-ywtodIHULIxUr1vIPx_KeBAngxZYsET5peyuOc7Y0uKF2uDRVTRe-ZUoItyKErofCHyQBJdjDaLJlTTv9U2GDZbUhmppVYMHLrHZphIDTROO-OTiB84VqFo6oj9-6H3d6j3qIMlMSg9b127XJ31grtOlPKB61ck7iBnWXGNsDz17x5URz-kyDHPvWN5QtcxE1xVAw0rVEhc7Og-VzQM',
      credits: 420,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
    return { ok: true as const, user: next }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, login, signup, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

