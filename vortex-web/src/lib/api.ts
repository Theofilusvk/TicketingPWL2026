/**
 * Centralized API configuration for all backend calls.
 * Defaults to localhost:8000 but uses relative URLs when possible.
 */

const API_BASE_URL = typeof window !== 'undefined' 
  ? `http://${window.location.hostname}:8000`
  : 'http://localhost:8000'

export const apiCall = async (
  endpoint: string,
  options: RequestInit & { token?: string } = {}
) => {
  const { token, ...requestOptions } = options
  
  // Build URL - use absolute if not relative
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : endpoint.startsWith('/') 
      ? `${API_BASE_URL}${endpoint}`
      : `${API_BASE_URL}/${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(requestOptions.headers as Record<string, string>),
  }

  // Add authorization if token provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...requestOptions,
    headers,
    credentials: 'include',
  })
}

// Export for any direct usage
export default {
  baseUrl: API_BASE_URL,
  apiCall,
}
