import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function AdminPageLoader() {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setLoading(true)
    setProgress(0)

    // Simulate a fast progress bar — admin style
    const steps = [
      setTimeout(() => setProgress(30), 50),
      setTimeout(() => setProgress(60), 150),
      setTimeout(() => setProgress(85), 300),
      setTimeout(() => setProgress(100), 450),
      setTimeout(() => setLoading(false), 600),
    ]
    return () => steps.forEach(clearTimeout)
  }, [location.pathname])

  if (!loading) return null

  return (
    <>
      {/* Top progress bar — sleek indigo gradient */}
      <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
        {/* Glowing tip */}
        <div
          className="absolute top-0 h-[3px] w-8 bg-white/80 blur-sm transition-all duration-300 ease-out"
          style={{ left: `calc(${progress}% - 16px)` }}
        />
      </div>

      {/* Full screen overlay — minimal admin style */}
      {progress < 100 && (
        <div className="fixed inset-0 z-[199] bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center pointer-events-none animate-fade-out">
          <div className="flex flex-col items-center gap-5">
            {/* Spinning hexagon loader */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/30 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-1 rounded-xl border-2 border-sky-400/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <div className="absolute inset-3 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-400 text-xl animate-pulse">dashboard</span>
              </div>
            </div>
            {/* Progress text */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '100ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '200ms' }} />
              </div>
              <p className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.3em]">
                CONSOLE LOADING
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
