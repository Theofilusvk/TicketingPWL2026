import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function NotFoundPage() {
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 relative">
      {/* Background noise */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#CBFF00]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#FF4D4D]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 reveal">
        {/* Error Code */}
        <div className="relative mb-8">
          <h1
            className={`font-display text-[12rem] md:text-[18rem] leading-none text-transparent tracking-tighter select-none ${
              glitch ? 'animate-pulse' : ''
            }`}
            style={{
              WebkitTextStroke: '2px rgba(203, 255, 0, 0.3)',
            }}
          >
            404
          </h1>
          <h1
            className={`font-display text-[12rem] md:text-[18rem] leading-none text-[#CBFF00] tracking-tighter absolute inset-0 select-none ${
              glitch ? 'translate-x-1 -translate-y-1' : ''
            } transition-transform duration-100`}
            style={{
              clipPath: glitch ? 'inset(20% 0 30% 0)' : 'none',
            }}
          >
            404
          </h1>
        </div>

        {/* Status Message */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center justify-center gap-3 font-accent text-[10px] tracking-widest uppercase text-[#FF4D4D]">
            <span className="w-2 h-2 bg-[#FF4D4D] rounded-full animate-pulse shadow-[0_0_8px_#FF4D4D]" />
            SYSTEM_ERROR: NODE_NOT_FOUND
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-white">
            SIGNAL <span className="text-zinc-500">LOST</span>
          </h2>
          <p className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            The coordinates you entered do not match any known location in the Vortex network.
            This sector may have been decommissioned or never existed.
          </p>
        </div>

        {/* Terminal-style error log */}
        <div className="bg-black/60 border border-zinc-800 p-6 max-w-md mx-auto text-left mb-12">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#CBFF00]" />
            <span className="font-mono text-[8px] text-zinc-600 ml-auto">VORTEX_TERMINAL v2.0</span>
          </div>
          <div className="font-mono text-[10px] space-y-1 text-zinc-500">
            <p><span className="text-[#CBFF00]">$</span> route --resolve <span className="text-white">{window.location.pathname}</span></p>
            <p className="text-[#FF4D4D]">ERROR: Route not found in registry</p>
            <p><span className="text-[#CBFF00]">$</span> suggest --fallback</p>
            <p className="text-zinc-400">→ Redirecting to base station...</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#CBFF00] text-black px-8 py-4 font-accent font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(203,255,0,0.2)]"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            RETURN TO BASE
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 px-8 py-4 font-accent text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">explore</span>
            BROWSE EVENTS
          </Link>
        </div>
      </div>
    </main>
  )
}
