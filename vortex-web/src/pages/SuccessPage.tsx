import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShareButton } from '../components/ShareButton'
import { EmailModal } from '../components/EmailModal'
import { useAudio } from '../lib/audio'

// Confetti particle system
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#CBFF00', '#FF4D4D', '#FFD700', '#00FFFF', '#FF00FF', '#FFFFFF']

    interface Particle {
      x: number; y: number; w: number; h: number
      dx: number; dy: number; rot: number; dRot: number
      color: string; alpha: number; decay: number
    }

    const particles: Particle[] = []
    // Burst from center top
    for (let i = 0; i < 150; i++) {
      const angle = (Math.random() * Math.PI * 2)
      const speed = Math.random() * 8 + 2
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.3,
        w: Math.random() * 8 + 3,
        h: Math.random() * 4 + 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 3,
        rot: Math.random() * Math.PI * 2,
        dRot: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.008 + 0.003,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        if (p.alpha <= 0) continue
        alive = true
        p.x += p.dx
        p.y += p.dy
        p.dy += 0.15 // gravity
        p.rot += p.dRot
        p.alpha -= p.decay
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (alive) animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" />
}

// Animated checkmark SVG
function AnimatedCheck() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow rings */}
      <div className="absolute w-32 h-32 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-pulse" />
      
      {/* Circle + Check */}
      <div className={`relative w-20 h-20 rounded-full bg-primary flex items-center justify-center transition-all duration-700 ${show ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        style={{ boxShadow: '0 0 40px rgba(203,255,0,0.5), 0 0 80px rgba(203,255,0,0.2)' }}
      >
        <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M5 13l4 4L19 7"
            className={`transition-all duration-500 delay-300 ${show ? 'opacity-100' : 'opacity-0'}`}
            style={{
              strokeDasharray: 24,
              strokeDashoffset: show ? 0 : 24,
              transition: 'stroke-dashoffset 0.6s ease 0.5s, opacity 0.3s ease 0.3s',
            }}
          />
        </svg>
      </div>
    </div>
  )
}

export function SuccessPage() {
  const { playSuccessSound } = useAudio()
  const [stage, setStage] = useState(0)
  const [showEmailModal, setShowEmailModal] = useState(false)

  // Staggered reveal
  useEffect(() => {
    playSuccessSound()
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => setStage(3), 1300),
      setTimeout(() => setStage(4), 1800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const staggerClass = (s: number) =>
    `transition-all duration-700 ${stage >= s ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

  return (
    <>
      <ConfettiCanvas />
      <main className="mx-auto w-full max-w-4xl relative z-10">
        {/* Animated Check */}
        <div className={`mt-16 mb-8 flex justify-center ${staggerClass(0)}`}>
          <AnimatedCheck />
        </div>

        {/* Status Badge + Title */}
        <div className={`mb-12 text-center ${staggerClass(1)}`}>
          <div className="inline-block bg-hot-coral text-black px-4 py-1 font-accent font-bold text-[10px] mb-6 uppercase tracking-widest leading-loose animate-pulse">
            PROTOCOL_STATUS: VERIFIED
          </div>
          <h1 className="font-display text-6xl md:text-8xl leading-none text-primary drop-shadow-[0_0_20px_rgba(203,255,0,0.6)]">
            PAYMENT_CONFIRMED
          </h1>
          <p className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest mt-4">
            TRANSACTION ENCRYPTED & STORED ON VORTEX MAINFRAME
          </p>
        </div>

        {/* Order Confirmation Card */}
        <div className={`w-full p-8 md:p-12 mb-16 overflow-hidden bg-black/40 border border-t-primary border-r-hot-coral border-b-hot-coral border-l-primary shadow-[0_0_40px_rgba(203,255,0,0.05)] ${staggerClass(2)}`}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 relative items-center">
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                  EVENT_ID
                </p>
                <h2 className="font-display text-4xl text-white tracking-wide">NEON CHAOS <span className="text-zinc-400">2025</span></h2>
              </div>
              <div className="flex gap-12">
                <div>
                  <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                    DATE
                  </p>
                  <p className="font-mono tracking-widest text-sm text-white">08.12.25</p>
                </div>
                <div>
                  <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                    ACCESS
                  </p>
                  <p className="font-mono tracking-widest text-sm text-white">VIP_TIER</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            <div className="flex flex-col gap-8 h-full justify-between">
              <div className="flex justify-between items-start gap-8">
                <div>
                  <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                    ORDER_NUMBER
                  </p>
                  <p className="font-mono tracking-widest text-sm text-hot-coral">#VTX-99281-XC</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                  <span className="material-symbols-outlined text-2xl text-primary">verified</span>
                </div>
              </div>
              <div>
                <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                  TOTAL_PAID
                </p>
                <p className="font-mono tracking-widest text-white text-3xl font-bold">$249.00 <span className="text-xl">USD</span></p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">SECURED VIA VORTEX PROTOCOL</span>
            </div>
            <div className="flex gap-1">
               <div className="w-1.5 h-6 bg-primary" />
               <div className="w-3 h-6 bg-[#3a3b2f]" />
               <div className="w-1.5 h-6 bg-hot-coral" />
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className={staggerClass(3)}>
          <div className="mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
            <h2 className="font-display text-3xl text-primary">WHAT'S_NEXT?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 border-b border-white/10 pb-20">
            <Link
              to="/tickets"
              className="flex items-center gap-4 p-5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group bg-black/40 hover:shadow-[0_0_20px_rgba(203,255,0,0.05)]"
            >
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">confirmation_number</span>
              <div className="text-left flex flex-col">
                <span className="font-display text-xl text-white group-hover:text-primary transition-colors tracking-wide">VIEW TICKETS</span>
                <span className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase">ACCESS_VAULT</span>
              </div>
            </Link>
            <Link
              to="/tickets"
              className="flex items-center gap-4 p-5 border border-white/10 hover:border-hot-coral/50 hover:bg-hot-coral/5 transition-all group bg-black/40 hover:shadow-[0_0_20px_rgba(255,77,77,0.05)]"
            >
              <span className="material-symbols-outlined text-hot-coral text-xl group-hover:scale-110 transition-transform">qr_code_2</span>
              <div className="text-left flex flex-col">
                <span className="font-display text-xl text-white group-hover:text-hot-coral transition-colors tracking-wide">DOWNLOAD QR</span>
                <span className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase">PDF_EXPORT</span>
              </div>
            </Link>
            <Link
              to="/events"
              className="flex items-center gap-4 p-5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group bg-black/40 hover:shadow-[0_0_20px_rgba(203,255,0,0.05)]"
            >
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">dashboard</span>
               <div className="text-left flex flex-col">
                <span className="font-display text-xl text-white group-hover:text-primary transition-colors tracking-wide">DASHBOARD</span>
                <span className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase">EXIT_PROCESS</span>
              </div>
            </Link>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-4 p-5 border border-white/10 hover:border-indigo-400/50 hover:bg-indigo-500/5 transition-all group bg-black/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] text-left"
            >
              <span className="material-symbols-outlined text-indigo-400 text-xl group-hover:scale-110 transition-transform">mail</span>
              <div className="flex flex-col">
                <span className="font-display text-xl text-white group-hover:text-indigo-400 transition-colors tracking-wide">SEND EMAIL</span>
                <span className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase">E-TICKET_DELIVERY</span>
              </div>
            </button>
          </div>
        </div>

        <div className={`text-center font-accent uppercase tracking-[0.3em] text-[10px] text-zinc-500 flex flex-col items-center gap-6 mb-20 ${staggerClass(4)}`}>
          <span>BROADCAST COMPLETION</span>
          <ShareButton title="Neon Chaos 2025" text="I just locked in my access to Neon Chaos 2025!" />
        </div>

      </main>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        ticketInfo={{
          eventName: 'NEON CHAOS 2025',
          ticketId: '#VTX-99281-XC',
          tier: 'VIP TIER'
        }}
      />
    </>
  )
}
