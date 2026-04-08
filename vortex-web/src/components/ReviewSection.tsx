import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'

export function ReviewSection({ eventId }: { eventId: string }) {
  const { reviews, addReview, ownedTickets } = useStore()
  const { user, isAuthenticated } = useAuth()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const eventReviews = useMemo(() => reviews.filter(r => r.eventId === eventId), [reviews, eventId])
  const avgRating = eventReviews.length > 0 ? eventReviews.reduce((a, r) => a + r.rating, 0) / eventReviews.length : 0

  // User must have a SCANNED ticket for this event to review
  const hasCheckedInTicket = ownedTickets.some(t => t.eventId === eventId && t.status === 'SCANNED')
  const alreadyReviewed = eventReviews.some(r => r.userId === (user?.email || ''))

  const handleSubmit = () => {
    if (rating === 0 || !comment.trim()) return
    addReview({
      id: `review-${Date.now()}`,
      eventId,
      userId: user?.email || 'anon',
      userName: user?.displayName || 'Anonymous',
      rating,
      comment: comment.trim(),
      checkedIn: true,
      createdAt: new Date().toISOString()
    })
    setSubmitted(true)
    setComment('')
    setRating(0)
  }

  const StarDisplay = ({ value, size = 'text-lg' }: { value: number; size?: string }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={`material-symbols-outlined ${size} ${star <= value ? 'text-amber-400' : 'text-white/10'}`}>
          {star <= value ? 'star' : 'star'}
        </span>
      ))}
    </div>
  )

  return (
    <section className="reveal border border-white/10 p-8 md:p-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-white">REVIEWS</h2>
          <div className="flex items-center gap-3 mt-2">
            <StarDisplay value={Math.round(avgRating)} />
            <span className="font-mono text-sm text-zinc-400">{avgRating.toFixed(1)}</span>
            <span className="font-accent text-[9px] text-zinc-600 uppercase tracking-widest">({eventReviews.length} review{eventReviews.length !== 1 ? 's' : ''})</span>
          </div>
        </div>
      </div>

      {/* Review List */}
      {eventReviews.length > 0 ? (
        <div className="space-y-4">
          {eventReviews.map(r => (
            <div key={r.id} className="border border-white/5 p-5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 border border-white/10">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                  </div>
                  <div>
                    <p className="font-accent text-xs text-white uppercase tracking-widest">{r.userName}</p>
                    <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest mt-0.5">
                      {r.checkedIn && <span className="text-emerald-500 mr-1">✓ VERIFIED ATTENDEE</span>}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StarDisplay value={r.rating} size="text-sm" />
              </div>
              <p className="font-accent text-xs text-zinc-400 leading-relaxed pl-11">{r.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 border border-dashed border-white/10 text-center">
          <span className="material-symbols-outlined text-4xl text-white/15 mb-2 block">rate_review</span>
          <p className="text-xs text-zinc-600 uppercase tracking-widest">No reviews yet — be the first</p>
        </div>
      )}

      {/* Submit Review Form */}
      {isAuthenticated && hasCheckedInTicket && !alreadyReviewed && !submitted ? (
        <div className="border border-primary/20 p-6 space-y-4 bg-primary/[0.02]">
          <h3 className="font-accent text-[10px] text-primary uppercase tracking-widest font-bold">Leave Your Review</h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-125"
              >
                <span className={`material-symbols-outlined text-2xl transition-colors ${star <= (hoverRating || rating) ? 'text-amber-400' : 'text-white/15'}`}>star</span>
              </button>
            ))}
            {rating > 0 && <span className="ml-2 text-xs text-zinc-500 font-mono">{rating}/5</span>}
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full bg-black/30 border border-white/10 p-3 text-sm text-white resize-none focus:outline-none focus:border-primary/30 placeholder:text-zinc-700 font-accent text-xs tracking-wider"
          />
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || !comment.trim()}
            className="px-6 py-2.5 bg-primary text-black font-accent font-bold text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
          >
            Submit Review
          </button>
        </div>
      ) : submitted ? (
        <div className="border border-emerald-500/20 p-6 text-center bg-emerald-500/[0.03]">
          <span className="material-symbols-outlined text-emerald-400 text-3xl mb-2 block">check_circle</span>
          <p className="font-accent text-xs text-emerald-400 uppercase tracking-widest">Review submitted successfully</p>
        </div>
      ) : isAuthenticated && alreadyReviewed ? (
        <div className="border border-white/5 p-4 text-center">
          <p className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">You have already reviewed this event</p>
        </div>
      ) : isAuthenticated && !hasCheckedInTicket ? (
        <div className="border border-white/5 p-4 text-center">
          <span className="material-symbols-outlined text-white/20 text-xl mb-1 block">lock</span>
          <p className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Only verified attendees (checked-in) can leave reviews</p>
        </div>
      ) : null}
    </section>
  )
}
