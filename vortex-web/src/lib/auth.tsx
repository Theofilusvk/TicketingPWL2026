import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authAPI } from './api/auth'
import { AxiosError } from 'axios'

export type User = {
  id: number | string
  displayName?: string
  name?: string
  avatarUrl?: string
  avatar_url?: string
  credits?: number
  email?: string
  bio?: string
  isAdmin?: boolean
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (params: { email: string; password: string }) => Promise<{ ok: true; user: User } | { ok: false; message: string }>
  signup: (params: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => Promise<{ ok: true } | { ok: false; message: string }>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  clearError: () => void
}

const STORAGE_KEY = 'vortex.auth.token'
const STORAGE_USER_KEY = 'vortex.auth.user'

function safeParseUser(value: string | null): User | null {
  if (!value) return null
  try {
    return JSON.parse(value) as User
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    safeParseUser(localStorage.getItem(STORAGE_USER_KEY)),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Try to restore user session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(STORAGE_KEY)
      if (token) {
        try {
          setIsLoading(true)
          const response = await authAPI.getCurrentUser()
          if (response.success && response.data) {
            setUser(response.data)
          } else {
            localStorage.removeItem(STORAGE_KEY)
            localStorage.removeItem(STORAGE_USER_KEY)
            setUser(null)
          }
        } catch (err) {
          console.error('Failed to restore session:', err)
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(STORAGE_USER_KEY)
          setUser(null)
        } finally {
          setIsLoading(false)
        }
      }
    }

    restoreSession()
  }, [])

  const signup = useCallback(
    async (params: {
      name: string
      email: string
      password: string
      password_confirmation: string
    }) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await authAPI.register(params)
        if (response.success) {
          return { ok: true as const }
        } else {
          const message = response.message || 'Registration failed'
          setError(message)
          return { ok: false as const, message }
        }
      } catch (err) {
        let message = 'An error occurred during registration'
        if (err instanceof AxiosError) {
          message = err.response?.data?.message || err.message
        } else if (err instanceof Error) {
          message = err.message
        }
        setError(message)
        return { ok: false as const, message }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const login = useCallback(
    async (params: { email: string; password: string }) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await authAPI.login(params)

        if (response.success && response.token) {
          localStorage.setItem(STORAGE_KEY, response.token)

          // Fetch and cache user data
          const userResponse = await authAPI.getCurrentUser()
          if (userResponse.success && userResponse.data) {
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userResponse.data))
            setUser(userResponse.data)
            return { ok: true as const, user: userResponse.data }
          }
        }

        const message = response.message || 'Login failed'
        setError(message)
        return { ok: false as const, message }
      } catch (err) {
        let message = 'Login failed'
        if (err instanceof AxiosError) {
          message = err.response?.data?.message || err.message
        } else if (err instanceof Error) {
          message = err.message
        }
        setError(message)
        return { ok: false as const, message }
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await authAPI.updateProfile(updates)
        if (response.success && response.data) {
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(response.data))
          setUser(response.data)
        }
      } catch (err) {
        let message = 'Failed to update profile'
        if (err instanceof AxiosError) {
          message = err.response?.data?.message || err.message
        } else if (err instanceof Error) {
          message = err.message
        }
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      signup,
      logout,
      updateUser,
      clearError,
    }),
    [user, isLoading, error, login, signup, logout, updateUser, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

