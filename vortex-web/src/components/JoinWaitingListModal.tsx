import { useState } from 'react'
import { useNotification } from '../lib/useNotification'

interface TicketType {
  id: string
  name: string
  price: number
}

interface JoinWaitingListModalProps {
  eventId: string
  eventTitle: string
  ticketTypes: TicketType[]
  onClose: () => void
  onSuccess: () => void
}

export function JoinWaitingListModal({
  eventId,
  eventTitle,
  ticketTypes,
  onClose,
  onSuccess
}: JoinWaitingListModalProps) {
  const { scheduleNotification } = useNotification()
  const [selectedTicketType, setSelectedTicketType] = useState<string>(ticketTypes[0]?.id || '')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const payload: Record<string, any> = {
        event_id: parseInt(eventId),
        ticket_type_id: parseInt(selectedTicketType)
      }

      if (maxPrice) {
        payload.preferred_price = parseFloat(maxPrice)
      }

      const response = await fetch('/api/waiting-list/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join waiting list')
      }

      scheduleNotification('✓ JOINED WAITING LIST', 2000, {
        body: `Added to queue for ${eventTitle}. Check your position in My Events.`
      })

      onSuccess()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join waiting list'
      setError(message)
      scheduleNotification('✗ JOIN FAILED', 2000, { body: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full space-y-6 p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-white">JOIN WAITING LIST</h2>
            <p className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
              Secure your spot for {eventTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
            <p className="font-accent text-xs text-red-400 uppercase tracking-widest">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ticket Type Selection */}
          <div>
            <label className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest mb-2 block">
              Ticket Type
            </label>
            <div className="space-y-2">
              {ticketTypes.map(tt => (
                <label
                  key={tt.id}
                  className="flex items-center gap-3 p-3 border border-zinc-800 rounded cursor-pointer hover:bg-zinc-800/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="ticketType"
                    value={tt.id}
                    checked={selectedTicketType === tt.id}
                    onChange={e => setSelectedTicketType(e.target.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{tt.name}</p>
                    <p className="font-mono text-xs text-zinc-500">${tt.price}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Max Price (Optional) */}
          <div>
            <label htmlFor="maxPrice" className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest mb-2 block">
              Max Price (Optional)
            </label>
            <input
              id="maxPrice"
              type="number"
              step="0.01"
              min="0"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="Leave blank for any price"
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-primary"
            />
            <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mt-1">
              We won't notify you of tickets above this price
            </p>
          </div>

          {/* Info */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded p-3 space-y-1">
            <p className="font-accent text-[9px] text-zinc-400 uppercase tracking-widest">
              <span className="text-primary">✓</span> Queue position assigned automatically
            </p>
            <p className="font-accent text-[9px] text-zinc-400 uppercase tracking-widest">
              <span className="text-primary">✓</span> You'll be notified when tickets available
            </p>
            <p className="font-accent text-[9px] text-zinc-400 uppercase tracking-widest">
              <span className="text-primary">✓</span> Check status in My Events anytime
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded border border-zinc-700 text-white font-accent text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedTicketType}
              className="flex-1 px-4 py-2 rounded bg-primary text-black font-accent text-xs uppercase tracking-widest font-bold hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
