import { useState, useMemo } from 'react'
import { useStore } from '../../lib/store'

export function AdminReviewsPage() {
  const { events, reviews } = useStore()
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '')

  const eventReviews = useMemo(() => reviews.filter(r => r.eventId === selectedEventId), [reviews, selectedEventId])
  const avgRating = eventReviews.length > 0 ? eventReviews.reduce((a, r) => a + r.rating, 0) / eventReviews.length : 0

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: eventReviews.filter(r => r.rating === star).length,
    pct: eventReviews.length > 0 ? Math.round((eventReviews.filter(r => r.rating === star).length / eventReviews.length) * 100) : 0
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Review Dashboard</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Read-only view of verified attendee reviews</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-1 shadow-inner relative flex items-center min-w-[240px]">
          <span className="material-symbols-outlined text-white/40 absolute left-3 pointer-events-none">event</span>
          <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="w-full bg-transparent text-white font-semibold tracking-wide text-sm outline-none appearance-none cursor-pointer pl-10 pr-10 py-2 [color-scheme:dark]">
            {events.map(e => <option key={e.id} value={e.id} className="bg-zinc-900 text-white">{e.name}</option>)}
          </select>
          <span className="material-symbols-outlined text-white/40 absolute right-3 pointer-events-none">expand_content</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating */}
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] p-6 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Average Rating</p>
          <p className="text-5xl font-bold text-white mb-2">{avgRating.toFixed(1)}</p>
          <div className="flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className={`material-symbols-outlined text-lg ${s <= Math.round(avgRating) ? 'text-amber-400' : 'text-white/10'}`}>star</span>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-2">{eventReviews.length} review{eventReviews.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Distribution */}
        <div className="md:col-span-2 bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] p-6 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">Rating Distribution</p>
          <div className="space-y-2.5">
            {distribution.map(d => (
              <div key={d.star} className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 w-16 justify-end">
                  <span className="text-xs font-bold text-white/60">{d.star}</span>
                  <span className="material-symbols-outlined text-sm text-amber-400">star</span>
                </div>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-xs font-mono text-white/40 w-12 text-right">{d.count} ({d.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">All Reviews</h2>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Read-Only — Cannot be modified</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {eventReviews.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-white/15 block mb-2">rate_review</span>
              <p className="text-sm text-white/30">No reviews for this event yet</p>
            </div>
          ) : eventReviews.map(r => (
            <div key={r.id} className="p-5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 border border-white/10">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{r.userName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.checkedIn && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="material-symbols-outlined text-[10px]">verified</span>VERIFIED
                        </span>
                      )}
                      <span className="text-[10px] text-white/30 font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`material-symbols-outlined text-sm ${s <= r.rating ? 'text-amber-400' : 'text-white/10'}`}>star</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/50 pl-12 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
