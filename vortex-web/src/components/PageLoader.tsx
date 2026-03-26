import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function PageLoader() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[200] bg-background-dark flex items-center justify-center pointer-events-none animate-fade-out">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing Logo */}
        <div className="relative">
          <span className="material-symbols-outlined text-6xl text-primary animate-pulse">cyclone</span>
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping" />
        </div>
        {/* Loading Bar */}
        <div className="w-48 h-[2px] bg-zinc-800 overflow-hidden">
          <div className="h-full bg-primary animate-loader-bar" />
        </div>
        <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-[0.3em]">
          LOADING_PROTOCOL
        </p>
      </div>
    </div>
  )
}
