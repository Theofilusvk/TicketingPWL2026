import { useStore } from '../lib/store'
import { Link } from 'react-router-dom'

/* ─── Achievement Definitions ─── */
type Achievement = {
  id: string
  icon: string
  title: string
  description: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  check: (data: AchievementData) => boolean
}

type AchievementData = {
  tickets: number
  orders: number
  credits: number
  tier: string
  totalSpent: number
}

const RARITY_STYLES = {
  COMMON: { border: 'border-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-500/10', glow: '', label: 'text-zinc-500' },
  RARE: { border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]', label: 'text-blue-400' },
  EPIC: { border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', label: 'text-purple-400' },
  LEGENDARY: { border: 'border-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]', label: 'text-amber-400' },
}

const ACHIEVEMENTS: Achievement[] = [
  // Common
  { id: 'first_login', icon: 'login', title: 'SYSTEM_BREACH', description: 'Access the VORTEX network for the first time', rarity: 'COMMON', check: () => true },
  { id: 'first_ticket', icon: 'confirmation_number', title: 'FIRST_PROTOCOL', description: 'Acquire your first access ticket', rarity: 'COMMON', check: (d) => d.tickets >= 1 },
  { id: 'first_order', icon: 'receipt_long', title: 'TRANSACTION_INIT', description: 'Complete your first order', rarity: 'COMMON', check: (d) => d.orders >= 1 },
  { id: 'credits_100', icon: 'toll', title: 'CREDIT_SEED', description: 'Earn 100+ credits', rarity: 'COMMON', check: (d) => d.credits >= 100 },
  
  // Rare
  { id: 'tickets_3', icon: 'style', title: 'COLLECTOR_MK1', description: 'Hold 3+ access tickets simultaneously', rarity: 'RARE', check: (d) => d.tickets >= 3 },
  { id: 'orders_5', icon: 'shopping_bag', title: 'REPEAT_AGENT', description: 'Complete 5+ orders', rarity: 'RARE', check: (d) => d.orders >= 5 },
  { id: 'credits_1000', icon: 'monetization_on', title: 'CREDIT_SURGE', description: 'Accumulate 1,000+ credits', rarity: 'RARE', check: (d) => d.credits >= 1000 },
  { id: 'spent_100', icon: 'payments', title: 'BIG_SPENDER', description: 'Spend 100+ USD total', rarity: 'RARE', check: (d) => d.totalSpent >= 100 },
  { id: 'tier_squire', icon: 'shield', title: 'SQUIRE_RANK', description: 'Achieve SQUIRE tier status', rarity: 'RARE', check: (d) => ['SQUIRE', 'KNIGHT', 'LORD', 'SOVEREIGN'].includes(d.tier) },

  // Epic
  { id: 'tickets_5', icon: 'inventory_2', title: 'COLLECTOR_MK2', description: 'Hold 5+ access tickets simultaneously', rarity: 'EPIC', check: (d) => d.tickets >= 5 },
  { id: 'orders_10', icon: 'local_fire_department', title: 'VETERAN_AGENT', description: 'Complete 10+ orders', rarity: 'EPIC', check: (d) => d.orders >= 10 },
  { id: 'credits_5000', icon: 'diamond', title: 'CREDIT_OVERLOAD', description: 'Accumulate 5,000+ credits', rarity: 'EPIC', check: (d) => d.credits >= 5000 },
  { id: 'tier_knight', icon: 'security', title: 'KNIGHT_RANK', description: 'Achieve KNIGHT tier status', rarity: 'EPIC', check: (d) => ['KNIGHT', 'LORD', 'SOVEREIGN'].includes(d.tier) },
  { id: 'spent_500', icon: 'account_balance', title: 'ELITE_PATRON', description: 'Spend 500+ USD total', rarity: 'EPIC', check: (d) => d.totalSpent >= 500 },

  // Legendary
  { id: 'tickets_10', icon: 'military_tech', title: 'SUPREME_COLLECTOR', description: 'Hold 10+ access tickets', rarity: 'LEGENDARY', check: (d) => d.tickets >= 10 },
  { id: 'tier_lord', icon: 'crown', title: 'LORD_ASCENSION', description: 'Achieve LORD tier status', rarity: 'LEGENDARY', check: (d) => ['LORD', 'SOVEREIGN'].includes(d.tier) },
  { id: 'credits_15000', icon: 'bolt', title: 'POWER_UNLIMITED', description: 'Accumulate 15,000+ credits', rarity: 'LEGENDARY', check: (d) => d.credits >= 15000 },
  { id: 'tier_sovereign', icon: 'auto_awesome', title: 'SOVEREIGN_OMEGA', description: 'Achieve the ultimate SOVEREIGN tier', rarity: 'LEGENDARY', check: (d) => d.tier === 'SOVEREIGN' },
  { id: 'spent_1000', icon: 'workspace_premium', title: 'WHALE_STATUS', description: 'Spend 1,000+ USD total', rarity: 'LEGENDARY', check: (d) => d.totalSpent >= 1000 },
]

export function AchievementsPage() {
  const { ownedTickets, orderHistory, credits, tier } = useStore()
  const totalSpent = orderHistory.reduce((acc, o) => acc + o.total, 0)

  const data: AchievementData = {
    tickets: ownedTickets.length,
    orders: orderHistory.length,
    credits,
    tier,
    totalSpent,
  }

  const unlocked = ACHIEVEMENTS.filter(a => a.check(data))
  const locked = ACHIEVEMENTS.filter(a => !a.check(data))
  const progress = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)

  const rarityCounts = {
    COMMON: ACHIEVEMENTS.filter(a => a.rarity === 'COMMON').length,
    RARE: ACHIEVEMENTS.filter(a => a.rarity === 'RARE').length,
    EPIC: ACHIEVEMENTS.filter(a => a.rarity === 'EPIC').length,
    LEGENDARY: ACHIEVEMENTS.filter(a => a.rarity === 'LEGENDARY').length,
  }

  const unlockedRarity = {
    COMMON: unlocked.filter(a => a.rarity === 'COMMON').length,
    RARE: unlocked.filter(a => a.rarity === 'RARE').length,
    EPIC: unlocked.filter(a => a.rarity === 'EPIC').length,
    LEGENDARY: unlocked.filter(a => a.rarity === 'LEGENDARY').length,
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 mb-20 space-y-8">
      {/* Header */}
      <section className="reveal">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/profile" className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest hover:text-primary transition-colors">
            ← PROFILE
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest">ACHIEVEMENTS</span>
        </div>
        <h1 className="distort-title font-display text-7xl md:text-9xl mb-2 text-white">ACHIEVEMENTS</h1>
        <div className="flex gap-4 font-accent text-[10px] tracking-widest mt-4">
          <span className="bg-primary text-black px-2 py-1 font-bold uppercase">
            {unlocked.length}/{ACHIEVEMENTS.length} UNLOCKED
          </span>
          <span className="border border-primary text-primary px-2 py-1 uppercase">
            {progress}% COMPLETE
          </span>
        </div>
      </section>

      {/* Global Progress Bar */}
      <section className="reveal border border-white/10 p-6 bg-black/30">
        <div className="flex justify-between items-center mb-3">
          <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">/ COMPLETION_PROGRESS</p>
          <p className="font-mono text-xs text-primary">{progress}%</p>
        </div>
        <div className="h-2.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-1000 ease-out"
            style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(203,255,0,0.4)' }}
          />
        </div>
        {/* Rarity breakdown */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map(r => (
            <div key={r} className="text-center">
              <p className={`font-accent text-[7px] uppercase tracking-widest ${RARITY_STYLES[r].label}`}>{r}</p>
              <p className="font-mono text-xs text-white mt-1">{unlockedRarity[r]}/{rarityCounts[r]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <section className="reveal">
          <h2 className="font-display text-3xl text-white mb-6">UNLOCKED</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unlocked.map((a, i) => {
              const style = RARITY_STYLES[a.rarity]
              return (
                <div
                  key={a.id}
                  className={`group border ${style.border} ${style.bg} ${style.glow} p-5 transition-all hover:-translate-y-1 hover:scale-[1.02]`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`material-symbols-outlined text-3xl ${style.text}`}>{a.icon}</span>
                    <span className={`font-accent text-[7px] uppercase tracking-widest ${style.label} border ${style.border} px-2 py-0.5`}>
                      {a.rarity}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-white mb-1 group-hover:text-primary transition-colors">{a.title}</h3>
                  <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest leading-relaxed">{a.description}</p>
                  <div className="mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span className="font-accent text-[7px] text-primary uppercase tracking-widest font-bold">UNLOCKED</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Locked Achievements */}
      {locked.length > 0 && (
        <section className="reveal">
          <h2 className="font-display text-3xl text-zinc-600 mb-6">LOCKED</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {locked.map(a => {
              const style = RARITY_STYLES[a.rarity]
              return (
                <div
                  key={a.id}
                  className="border border-zinc-800 bg-zinc-950/50 p-5 opacity-50 hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="material-symbols-outlined text-3xl text-zinc-700">lock</span>
                    <span className={`font-accent text-[7px] uppercase tracking-widest ${style.label} opacity-50 border border-zinc-800 px-2 py-0.5`}>
                      {a.rarity}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-zinc-600 mb-1">{a.title}</h3>
                  <p className="font-accent text-[8px] text-zinc-700 uppercase tracking-widest leading-relaxed">{a.description}</p>
                  <div className="mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-zinc-700 text-sm">lock</span>
                    <span className="font-accent text-[7px] text-zinc-700 uppercase tracking-widest">CLASSIFIED</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

/* ─── Export achievement checker for ProfilePage ─── */
export { ACHIEVEMENTS, RARITY_STYLES }
export type { AchievementData }
