import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'
import { useEffect, useRef, useState, useCallback } from 'react'
import { ACHIEVEMENTS } from './AchievementsPage'
import type { AchievementData } from './AchievementsPage'
import { PaymentModal } from '../components/PaymentModal'

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const from = 0
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(from + (target - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

/* ─── Sparkline Canvas ─── */
function Sparkline({ data, color = '#CBFF00', height = 60 }: { data: number[]; color?: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const max = Math.max(...data, 1)
    const min = 0
    const range = max - min || 1
    const stepX = w / (data.length - 1)

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, color + '40')
    grad.addColorStop(1, color + '00')

    ctx.beginPath()
    ctx.moveTo(0, h)
    data.forEach((v, i) => {
      const x = i * stepX
      const y = h - ((v - min) / range) * (h * 0.85)
      if (i === 0) ctx.lineTo(x, y)
      else {
        // Smooth curve
        const prevX = (i - 1) * stepX
        const prevY = h - ((data[i - 1] - min) / range) * (h * 0.85)
        const cpx = (prevX + x) / 2
        ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y)
      }
    })
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = i * stepX
      const y = h - ((v - min) / range) * (h * 0.85)
      if (i === 0) ctx.moveTo(x, y)
      else {
        const prevX = (i - 1) * stepX
        const prevY = h - ((data[i - 1] - min) / range) * (h * 0.85)
        const cpx = (prevX + x) / 2
        ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y)
      }
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // End dot
    const lastX = (data.length - 1) * stepX
    const lastY = h - ((data[data.length - 1] - min) / range) * (h * 0.85)
    ctx.beginPath()
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.beginPath()
    ctx.arc(lastX, lastY, 6, 0, Math.PI * 2)
    ctx.strokeStyle = color + '60'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [data, color, height])

  useEffect(() => { draw() }, [draw])

  return (
    <canvas ref={canvasRef} className="w-full" style={{ height }} />
  )
}

/* ─── Tier Progress ─── */
const TIERS = [
  { name: 'PHANTOM', min: 0, color: '#71717A' },
  { name: 'SQUIRE', min: 1000, color: '#3B82F6' },
  { name: 'KNIGHT', min: 5000, color: '#CBFF00' },
  { name: 'LORD', min: 15000, color: '#F59E0B' },
  { name: 'SOVEREIGN', min: 50000, color: '#A855F7' },
]

function TierProgressBar({ credits }: { credits: number }) {
  const [animWidth, setAnimWidth] = useState(0)
  const currentIdx = TIERS.findIndex((_t, i) => {
    const next = TIERS[i + 1]
    return !next || credits < next.min
  })
  const current = TIERS[currentIdx]
  const next = TIERS[currentIdx + 1]

  let progress = 100
  if (next) {
    progress = ((credits - current.min) / (next.min - current.min)) * 100
    progress = Math.min(100, Math.max(0, progress))
  }

  useEffect(() => {
    const t = setTimeout(() => setAnimWidth(progress), 100)
    return () => clearTimeout(t)
  }, [progress])

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: current.color, boxShadow: `0 0 8px ${current.color}60` }} />
          <span className="font-display text-xl" style={{ color: current.color }}>{current.name}</span>
        </div>
        {next && (
          <div className="flex items-center gap-2">
            <span className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest">
              {(next.min - credits).toLocaleString()} CRD TO
            </span>
            <span className="font-display text-sm" style={{ color: next.color }}>{next.name}</span>
          </div>
        )}
      </div>
      <div className="h-2.5 bg-zinc-900 border border-zinc-800 relative overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{
            width: `${animWidth}%`,
            background: `linear-gradient(90deg, ${current.color}80, ${current.color})`,
            boxShadow: `0 0 12px ${current.color}60`,
          }}
        />
        {/* Tier markers */}
        {TIERS.slice(1).map(t => {
          const pos = next ? ((t.min - current.min) / (next.min - current.min)) * 100 : 100
          if (pos < 0 || pos > 100 || !next) return null
          return (
            <div
              key={t.name}
              className="absolute top-0 bottom-0 w-px"
              style={{ left: `${pos}%`, backgroundColor: t.color + '40' }}
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="font-mono text-[8px] text-zinc-600">{current.min.toLocaleString()} CRD</span>
        {next && <span className="font-mono text-[8px] text-zinc-600">{next.min.toLocaleString()} CRD</span>}
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { user } = useAuth()
  const { ownedTickets, orderHistory, credits, tier } = useStore()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const tierColor = 
    tier === 'SOVEREIGN' ? 'text-purple-400 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' :
    tier === 'LORD' ? 'text-amber-400 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' :
    tier === 'KNIGHT' ? 'text-primary border-primary shadow-[0_0_20px_rgba(203,255,0,0.3)]' :
    tier === 'SQUIRE' ? 'text-blue-400 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 
    'text-zinc-400 border-zinc-500'

  const totalSpent = orderHistory.reduce((acc, o) => acc + o.total, 0)

  // Animated counters
  const animTickets = useAnimatedCounter(ownedTickets.length)
  const animOrders = useAnimatedCounter(orderHistory.length)
  const animSpent = useAnimatedCounter(Math.round(totalSpent))
  const animCredits = useAnimatedCounter(credits)

  // Generate sparkline data from order history (cumulative credits)
  const sparklineData = (() => {
    if (orderHistory.length === 0) return [0, 0]
    let cum = 0
    const points = [0]
    orderHistory.forEach(o => {
      cum += o.creditsEarned
      points.push(cum)
    })
    // Pad to at least 6 points for visual effect
    while (points.length < 6) points.unshift(0)
    return points
  })()

  // Monthly spend data (mock visual if no real data)
  const monthlySpend = (() => {
    const months: number[] = [0, 0, 0, 0, 0, 0]
    const labels = ['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR']
    orderHistory.forEach(o => {
      const d = new Date(o.date)
      const monthIdx = d.getMonth()
      // map to last 6 months
      const now = new Date()
      const diff = (now.getFullYear() * 12 + now.getMonth()) - (d.getFullYear() * 12 + monthIdx)
      if (diff >= 0 && diff < 6) months[5 - diff] += o.total
    })
    return { data: months, labels }
  })()

  const maxMonthly = Math.max(...monthlySpend.data, 1)

  // Achievement data
  const achievementData: AchievementData = { tickets: ownedTickets.length, orders: orderHistory.length, credits, tier, totalSpent }
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(achievementData))

  const quickLinks = [
    { to: '/tickets', label: 'MY TICKETS', icon: 'confirmation_number', count: ownedTickets.length },
    { to: '/history', label: 'ORDER LOG', icon: 'receipt_long', count: orderHistory.length },
    { to: '/achievements', label: 'ACHIEVEMENTS', icon: 'emoji_events', count: unlockedAchievements.length },
    { to: '/settings', label: 'SETTINGS', icon: 'settings', count: null },
  ]

  // Activity timeline from orders
  const timeline = orderHistory.slice(-5).reverse().map(o => ({
    id: o.id,
    date: new Date(o.date),
    title: `Order ${o.id}`,
    subtitle: `${o.items.length} item${o.items.length > 1 ? 's' : ''} · ${o.total.toFixed(2)} USD`,
    credits: o.creditsEarned,
  }))

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 mb-20 space-y-8">
      {/* Hero Profile */}
      <section className="reveal relative overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-hot-coral/5 pointer-events-none" />
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className={`w-24 h-24 md:w-32 md:h-32 border-4 ${tierColor} shrink-0 overflow-hidden`}>
            <img
              src={user?.avatarUrl ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5mp-WOImDCtb73Ca1NFmIt1welAuuSQXwMCZ_dey2ftzBzn_Ql_y_Oi7kwhGIox5c2aPxepI50EZ92Cq6EtVhi-JRdEFB-_jlOeVIRMa0XhkcEcFGdW6h-fblPg_SRktbcTRJapXyULn3NKrD__6w88TNPyYGJveVEVjSQzIZF0sofs7KTy1KP8N401cBNYuumlVlM12MKGguLXmi-rqI-d5AQU6pYPk72mSHR-hbLG2iEls2y_VkxqVT4RRer1ZJCGykkrgL3y8'}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">AGENT_PROFILE</p>
            <h1 className="font-display text-5xl md:text-7xl text-white leading-none mb-2">{user?.displayName || 'UNKNOWN'}</h1>
            <p className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest">VORTEX_COLLECTIVE MEMBER</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <span className={`font-display text-xl ${tierColor.split(' ')[0]} border ${tierColor.split(' ')[1]} px-4 py-1`}>
                {tier}
              </span>
              <div className="flex bg-primary/5 border border-primary/30">
                <span className="font-mono text-primary text-xl px-4 py-1.5 border-r border-primary/30">
                  {credits.toLocaleString()} CRD
                </span>
                <button onClick={() => setShowPaymentModal(true)} className="px-5 py-1.5 text-primary hover:text-black hover:bg-primary transition-colors tracking-widest font-accent text-[10px] font-bold flex items-center gap-1 group">
                  TOP UP <span className="material-symbols-outlined text-[14px] group-hover:rotate-90 transition-transform">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section className="reveal grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/10">
        <div className="p-6 border-r border-b md:border-b-0 border-white/10 text-center group hover:bg-primary/5 transition-colors">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">TICKETS_HELD</p>
          <p className="font-display text-4xl text-primary transition-transform group-hover:scale-110">{animTickets}</p>
        </div>
        <div className="p-6 border-b md:border-b-0 md:border-r border-white/10 text-center group hover:bg-white/5 transition-colors">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">ORDERS_EXECUTED</p>
          <p className="font-display text-4xl text-white transition-transform group-hover:scale-110">{animOrders}</p>
        </div>
        <div className="p-6 border-r border-white/10 text-center group hover:bg-hot-coral/5 transition-colors">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">TOTAL_SPENT</p>
          <p className="font-display text-4xl text-hot-coral transition-transform group-hover:scale-110">{animSpent}</p>
          <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest">USD</p>
        </div>
        <div className="p-6 text-center group hover:bg-primary/5 transition-colors">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">CREDITS</p>
          <p className="font-display text-4xl text-primary transition-transform group-hover:scale-110">{animCredits.toLocaleString()}</p>
          <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest">CRD</p>
        </div>
      </section>

      {/* Tier Progress */}
      <section className="reveal border border-white/10 p-6 bg-black/30">
        <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-4">/ TIER_PROGRESSION</p>
        <TierProgressBar credits={credits} />
      </section>

      {/* Analytics Charts */}
      <section className="reveal grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Credit History Sparkline */}
        <div className="border border-white/10 p-6 bg-black/30">
          <div className="flex justify-between items-center mb-4">
            <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">/ CREDIT_ACCUMULATION</p>
            <span className="font-mono text-xs text-primary">{credits.toLocaleString()} CRD</span>
          </div>
          <Sparkline data={sparklineData} color="#CBFF00" height={80} />
          <div className="flex justify-between mt-2">
            <span className="font-accent text-[7px] text-zinc-700 uppercase tracking-widest">FIRST ORDER</span>
            <span className="font-accent text-[7px] text-zinc-700 uppercase tracking-widest">NOW</span>
          </div>
        </div>

        {/* Monthly Spend Bar Chart */}
        <div className="border border-white/10 p-6 bg-black/30">
          <div className="flex justify-between items-center mb-4">
            <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">/ MONTHLY_SPEND</p>
            <span className="font-mono text-xs text-hot-coral">{totalSpent.toFixed(0)} USD</span>
          </div>
          <div className="flex items-end gap-2 h-20">
            {monthlySpend.data.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative" style={{ height: 64 }}>
                  <div
                    className="absolute bottom-0 w-full transition-all duration-700 ease-out"
                    style={{
                      height: `${Math.max(2, (val / maxMonthly) * 100)}%`,
                      background: val > 0 ? 'linear-gradient(180deg, #FF4D4D, #FF4D4D80)' : '#27272A',
                      boxShadow: val > 0 ? '0 0 8px #FF4D4D40' : 'none',
                    }}
                  />
                </div>
                <span className="font-accent text-[6px] text-zinc-600 uppercase tracking-widest">{monthlySpend.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="group border border-zinc-800 bg-black/40 p-6 hover:border-primary/50 transition-all hover:-translate-y-1 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <span className="material-symbols-outlined text-2xl text-zinc-500 group-hover:text-primary transition-colors">{link.icon}</span>
              {link.count !== null && (
                <span className="font-mono text-xl text-primary">{link.count}</span>
              )}
            </div>
            <p className="font-accent text-xs text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">{link.label}</p>
          </Link>
        ))}
      </section>

      {/* Activity Timeline */}
      <section className="reveal">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-3xl text-white">ACTIVITY_LOG</h2>
          <Link to="/history" className="font-accent text-[10px] text-primary uppercase tracking-widest hover:underline">
            VIEW ALL →
          </Link>
        </div>
        {timeline.length > 0 ? (
          <div className="relative border-l-2 border-zinc-800 ml-3 space-y-6">
            {timeline.map((item, i) => (
              <div key={item.id} className="relative pl-8 group">
                {/* Timeline dot */}
                <div
                  className="absolute left-[-9px] top-1 w-4 h-4 border-2 border-zinc-700 bg-zinc-950 group-hover:border-primary group-hover:bg-primary/20 transition-colors"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
                <div className="border border-zinc-800 bg-black/40 p-4 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs text-white">{item.title}</p>
                      <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5">{item.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-accent text-[8px] text-primary uppercase tracking-widest">+{item.credits.toLocaleString()} CRD</p>
                      <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mt-0.5">
                        {item.date.toLocaleDateString()} · {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest border border-zinc-800 p-8 text-center">
            NO ACTIVITY RECORDED. MAKE YOUR FIRST PURCHASE TO SEE DATA HERE.
          </p>
        )}
      </section>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </main>
  )
}
