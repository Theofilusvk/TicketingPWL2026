import { authAPI } from '../lib/api-endpoints'
import { apiClient } from '../lib/api'

export interface AuthUser {
  id: number | string
  name: string
  email: string
  email_verified_at?: string
  avatar?: string
  bio?: string
  credits?: number
  isAdmin?: boolean
  created_at?: string
  updated_at?: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
  refresh_token?: string
}

export interface RegisterResponse {
  user: AuthUser
  token: string
  refresh_token?: string
}

const TOKEN_KEY = 'vortex.auth.token'
const REFRESH_TOKEN_KEY = 'vortex.auth.refresh_token'
const USER_KEY = 'vortex.auth.user'

class AuthService {
  async login(email: string, password: string): Promise<{ ok: true; user: AuthUser; token: string } | { ok: false; message: string }> {
    try {
      const response = await authAPI.login(email, password)

      if (response.data.success && response.data.data) {
        const { user, token, refresh_token } = response.data.data as LoginResponse

        // Store tokens and user
        apiClient.setToken(token)
        if (refresh_token) {
          apiClient.setRefreshToken(refresh_token)
        }
        this.setCurrentUser(user)

        return { ok: true, user, token }
      }

      return { ok: false, message: response.data.message || 'Login failed' }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        'Login failed. Please check your credentials.'
      return { ok: false, message }
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{ ok: true; user: AuthUser } | { ok: false; message: string }> {
    try {
      const response = await authAPI.register(email, password, passwordConfirmation, name)

      if (response.data.success && response.data.data) {
        const { user, token, refresh_token } = response.data.data as RegisterResponse

        // Store tokens and user
        apiClient.setToken(token)
        if (refresh_token) {
          apiClient.setRefreshToken(refresh_token)
        }
        this.setCurrentUser(user)

        return { ok: true, user }
      }

      return { ok: false, message: response.data.message || 'Registration failed' }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      let message = 'Registration failed'

      if (errors) {
        const errorMessages = Object.values(errors)
          .flat()
          .join(' ')
        message = errorMessages
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      }

      return { ok: false, message }
    }
  }

  async logout(): Promise<void> {
    try {
      await authAPI.logout()
    } catch {
      // Even if logout fails on backend, clear local storage
    } finally {
      apiClient.clearAuth()
      this.clearCurrentUser()
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = apiClient.getRefreshToken()
      if (!refreshToken) {
        return false
      }

      const response = await authAPI.refreshToken(refreshToken)

      if (response.data.success && response.data.data) {
        const { token, refresh_token } = response.data.data

        apiClient.setToken(token)
        if (refresh_token) {
          apiClient.setRefreshToken(refresh_token)
        }

        return true
      }

      return false
    } catch {
      return false
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First check localStorage cache
      const cachedUser = this.getCurrentUserFromStorage()
      if (cachedUser && apiClient.getToken()) {
        return cachedUser
      }

      // If no cache or no token, fetch from API
      const response = await authAPI.getCurrentUser()

      if (response.data.success && response.data.data) {
        const user = response.data.data as AuthUser
        this.setCurrentUser(user)
        return user
      }

      return null
    } catch {
      // If API call fails but we have a cached user, return it
      return this.getCurrentUserFromStorage()
    }
  }

  async updateProfile(updates: { name?: string; email?: string; bio?: string; avatar?: string }): Promise<{ ok: true; user: AuthUser } | { ok: false; message: string }> {
    try {
      const response = await authAPI.updateProfile(updates)

      if (response.data.success && response.data.data) {
        const user = response.data.data as AuthUser
        this.setCurrentUser(user)
        return { ok: true, user }
      }

      return { ok: false, message: response.data.message || 'Update failed' }
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to update profile',
      }
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword, newPasswordConfirmation)

      if (response.data.success) {
        return { ok: true }
      }

      return { ok: false, message: response.data.message || 'Password change failed' }
    } catch (error: any) {
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to change password',
      }
    }
  }

  isAuthenticated(): boolean {
    return !!apiClient.getToken()
  }

  setCurrentUser(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  getCurrentUserFromStorage(): AuthUser | null {
    try {
      const user = localStorage.getItem(USER_KEY)
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }

  clearCurrentUser() {
    localStorage.removeItem(USER_KEY)
  }
}

export const authService = new AuthService()
