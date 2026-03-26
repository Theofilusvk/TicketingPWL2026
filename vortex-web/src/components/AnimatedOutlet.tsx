import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

function GlitchOverlay({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Scanline sweep */}
      <div
        className="absolute inset-x-0 h-1 bg-primary/40"
        style={{
          animation: 'glitch-sweep 0.3s ease-out forwards',
          boxShadow: '0 0 20px rgba(203,255,0,0.3)',
        }}
      />
      {/* RGB split lines */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-x-0 h-px"
          style={{
            top: `${15 + i * 18}%`,
            background: i % 2 === 0 ? 'rgba(203,255,0,0.15)' : 'rgba(255,77,77,0.15)',
            animation: `glitch-line-${i % 3} 0.25s ease-out forwards`,
            animationDelay: `${i * 30}ms`,
          }}
        />
      ))}
      {/* Flash */}
      <div
        className="absolute inset-0 bg-primary/5"
        style={{ animation: 'glitch-flash 0.3s ease-out forwards' }}
      />
    </div>
  )
}

export function AnimatedOutlet() {
  const outlet = useOutlet()
  const location = useLocation()
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    setGlitching(true)
    const t = setTimeout(() => setGlitching(false), 350)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <>
      <GlitchOverlay active={glitching} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20, scale: 0.99, filter: 'blur(4px) brightness(1.5)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px) brightness(1)' }}
          exit={{ opacity: 0, y: -10, scale: 1.01, filter: 'blur(4px) brightness(0.8)' }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
