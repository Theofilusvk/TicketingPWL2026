import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService, type AuthUser } from '../services/authService'

export type User = {
  id: string | number
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
  isLoading: boolean
  login: (params: { username?: string; email?: string; password: string }) => Promise<{ ok: true; user: User } | { ok: false; message: string }>
  signup: (params: {
    name: string
    email: string
    password: string
    passwordConfirmation: string
  }) => Promise<{ ok: true } | { ok: false; message: string }>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Helper function to convert AuthUser to User type
function convertAuthUserToUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    displayName: authUser.name,
    email: authUser.email,
    avatarUrl: authUser.avatar,
    bio: authUser.bio,
    credits: authUser.credits || 0,
    isAdmin: authUser.isAdmin || false,
  }
}

// Helper function to convert User to AuthUser-like object
function convertUserToAuthUser(user: User): Partial<AuthUser> {
  return {
    name: user.displayName,
    email: user.email || '',
    avatar: user.avatarUrl,
    bio: user.bio,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authUser = await authService.getCurrentUser()
        if (authUser) {
          setUser(convertAuthUserToUser(authUser))
        }
      } catch {
        // User not authenticated
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signup = useCallback(
    async ({ name, email, password, passwordConfirmation }: {
      name: string
      email: string
      password: string
      passwordConfirmation: string
    }) => {
      setIsLoading(true)
      try {
        const result = await authService.register(name, email, password, passwordConfirmation)
        if (result.ok) {
          setUser(convertAuthUserToUser(result.user))
          return { ok: true as const }
        }
        return { ok: false as const, message: result.message || 'Registration failed' }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const login = useCallback(async ({ username, email, password }: {
    username?: string
    email?: string
    password: string
  }) => {
    setIsLoading(true)
    try {
      // Accept both username and email, email takes precedence
      const emailToUse = email || (username ? `${username}@vortex.local` : '')
      if (!emailToUse || !password) {
        return { ok: false as const, message: 'Email and password are required.' }
      }

      const result = await authService.login(emailToUse, password)
      if (result.ok) {
        const mappedUser = convertAuthUserToUser(result.user)
        setUser(mappedUser)
        return { ok: true as const, user: mappedUser }
      }
      return { ok: false as const, message: result.message || 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return

    setIsLoading(true)
    try {
      const authUpdates = convertUserToAuthUser({ ...user, ...updates })
      const result = await authService.updateProfile(authUpdates)
      if (result.ok) {
        setUser(convertAuthUserToUser(result.user))
      }
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, isLoading, login, signup, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

