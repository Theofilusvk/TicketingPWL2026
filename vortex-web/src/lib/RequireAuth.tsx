import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-primary animate-pulse">CONNECTING_TO_MAINFRAME...</div>
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }

  return children
}

