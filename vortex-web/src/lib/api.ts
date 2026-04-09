import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'vortex.auth.token'
const REFRESH_TOKEN_KEY = 'vortex.auth.refresh_token'

interface ApiErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

class ApiClient {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    // Request interceptor: Add auth token
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = this.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor: Handle errors and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && originalRequest && !('_retry' in originalRequest && (originalRequest as any)._retry)) {
          (originalRequest as any)._retry = true

          try {
            // Try to refresh token
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refresh_token: refreshToken,
              })

              if (response.data.data?.token) {
                this.setToken(response.data.data.token)
                if (response.data.data.refresh_token) {
                  this.setRefreshToken(response.data.data.refresh_token)
                }

                // Retry original request
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`
                }
                return this.api(originalRequest)
              }
            }
          } catch {
            // Refresh failed, clear auth and redirect to login
            this.clearAuth()
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Token management
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  // API Methods
  get<T>(url: string, config?: any) {
    return this.api.get<ApiResponse<T>>(url, config)
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.api.post<ApiResponse<T>>(url, data, config)
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.api.put<ApiResponse<T>>(url, data, config)
  }

  patch<T>(url: string, data?: any, config?: any) {
    return this.api.patch<ApiResponse<T>>(url, data, config)
  }

  delete<T>(url: string, config?: any) {
    return this.api.delete<ApiResponse<T>>(url, config)
  }

  // Multipart form data uploads
  postFormData<T>(url: string, formData: FormData, config?: any) {
    return this.api.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
}

export const apiClient = new ApiClient()
export type { ApiResponse, ApiErrorResponse }
