import { useEffect, useState, useRef, useCallback } from 'react'

interface LiveQueueProps {
  onComplete: () => void
  eventName: string
}

export function LiveQueue({ onComplete, eventName }: LiveQueueProps) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState('')
  const initialQueue = useRef(Math.floor(Math.random() * 200) + 80)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)
  const completedRef = useRef(false)

  // Total queue duration in ms (8-12 seconds for the queue phase)
  const QUEUE_DURATION = useRef(8000 + Math.random() * 4000).current

  // Derive queue position from progress (inversely linked)
  const queuePos = Math.max(0, Math.round(initialQueue.current * (1 - progress / 100)))

  // Phase progression
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 3500),
      setTimeout(() => setPhase(3), 5000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Unified progress + queue animation using requestAnimationFrame
  useEffect(() => {
    if (phase < 2) return

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      
      // Ease-in-out cubic for more natural feeling
      const raw = Math.min(elapsed / QUEUE_DURATION, 1)
      // Add slight randomness to feel more "real-time"
      const jitter = raw < 1 ? (Math.sin(elapsed * 0.01) * 0.5 + 0.5) * 0.02 : 0
      const eased = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2
      
      const newProgress = Math.min(100, (eased + jitter) * 100)
      setProgress(newProgress)

      if (newProgress < 100) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, QUEUE_DURATION])

  // Complete when both reach end
  const handleComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  }, [onComplete])

  useEffect(() => {
    if (progress >= 100 && queuePos <= 0) {
      const t = setTimeout(handleComplete, 800)
      return () => clearTimeout(t)
    }
  }, [progress, queuePos, handleComplete])

  // Dot animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 400)
    return () => clearInterval(interval)
  }, [])

  const statusLines = [
    { text: 'ESTABLISHING SECURE CONNECTION', done: phase >= 1 },
    { text: 'VERIFYING PHANTOM CREDENTIALS', done: phase >= 2 },
    { text: 'ENTERING QUEUE PROTOCOL', done: phase >= 3 },
  ]

  const progressPct = Math.min(100, Math.floor(progress))

  return (
    <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center">
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(203,255,0,0.03) 2px, rgba(203,255,0,0.03) 4px)',
        }}
      />

      <div className="w-full max-w-lg px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="material-symbols-outlined text-primary text-6xl animate-spin" style={{ animationDuration: '3s' }}>
            cyclone
          </span>
          <h1 className="font-display text-4xl text-primary tracking-widest mt-4">VORTEX_QUEUE</h1>
          <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest mt-2">{eventName}</p>
        </div>

        {/* Terminal Output */}
        <div className="bg-black border border-primary/30 p-6 font-mono text-xs space-y-2 mb-8">
          {statusLines.map((line, i) => (
            <div key={i} className={`flex items-center gap-2 transition-opacity duration-500 ${i <= phase ? 'opacity-100' : 'opacity-0'}`}>
              <span className={line.done ? 'text-primary' : 'text-zinc-600'}>
                {line.done ? '[✓]' : '[...]'}
              </span>
              <span className={line.done ? 'text-primary' : 'text-zinc-500'}>
                {line.text}{!line.done && i === phase ? dots : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Queue Position */}
        {phase >= 2 && (
          <div className="text-center mb-8 animate-in fade-in">
            <p className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest mb-2">QUEUE_POSITION</p>
            <p className="font-display text-7xl text-primary drop-shadow-[0_0_30px_rgba(203,255,0,0.4)]">
              {queuePos}
            </p>
            <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest mt-2">
              {queuePos > 0 ? 'PHANTOMS AHEAD OF YOU' : 'YOUR TURN — REDIRECTING'}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {phase >= 2 && (
          <div className="animate-in fade-in">
            <div className="flex justify-between font-accent text-[8px] text-zinc-600 uppercase tracking-widest mb-2">
              <span>SYNC_PROGRESS</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 border border-zinc-800">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${progressPct}%`, boxShadow: '0 0 10px rgba(203,255,0,0.5)' }}
              />
            </div>
          </div>
        )}

        {/* Warning */}
        <p className="font-accent text-[8px] text-zinc-700 uppercase tracking-widest text-center mt-8">
          DO NOT CLOSE THIS TAB — YOUR POSITION WILL BE LOST
        </p>
      </div>
    </div>
  )
}
