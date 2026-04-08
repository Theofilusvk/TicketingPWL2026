import { useState, useRef, useEffect } from 'react'
import { useStore } from '../lib/store'

export function NotificationBell() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const iconByType: Record<string, string> = {
    EMAIL_BLAST: 'campaign',
    REMINDER: 'schedule',
    PAYMENT: 'payments',
    TICKET: 'confirmation_number',
    WAITLIST: 'hourglass_top',
    REFUND: 'currency_exchange',
    REVIEW: 'rate_review'
  }

  const colorByType: Record<string, string> = {
    EMAIL_BLAST: 'text-indigo-400',
    REMINDER: 'text-amber-400',
    PAYMENT: 'text-emerald-400',
    TICKET: 'text-primary',
    WAITLIST: 'text-sky-400',
    REFUND: 'text-rose-400',
    REVIEW: 'text-purple-400'
  }

  const recent = notifications.slice(0, 10)

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
      >
        <span className="material-symbols-outlined text-xl text-zinc-400 hover:text-white transition-colors">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.6)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 max-h-[420px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white tracking-tight">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllNotificationsRead()} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[340px] divide-y divide-white/[0.04]">
            {recent.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-white/20 mb-2 block">notifications_off</span>
                <p className="text-xs text-white/30">No notifications yet</p>
              </div>
            ) : (
              recent.map(n => (
                <div
                  key={n.id}
                  onClick={() => { markNotificationRead(n.id) }}
                  className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-white/[0.04] ${!n.read ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className={`mt-0.5 ${colorByType[n.type] || 'text-white/40'}`}>
                    <span className="material-symbols-outlined text-lg">{iconByType[n.type] || 'info'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-semibold truncate ${!n.read ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-white/40 line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-white/25 mt-1 font-mono">{timeAgo(n.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
