import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'

interface WaitingListEntry {
  list_id: number
  event_id: number
  user_id: number
  ticket_type_id: number
  status: string
  queue_position: number
  created_at: string
  event?: {
    event_id: number
    title: string
    start_time: string
  }
  ticketType?: {
    ticket_type_id: number
    ticket_type_name: string
  }
}

export function WaitingListDisplay() {
  const { user } = useAuth()
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWaitingList = async () => {
      try {
        const response = await fetch('/api/waiting-list/my', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch waiting list')
        const data = await response.json()
        setWaitingList(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchWaitingList()
  }, [user])

  const handleLeaveWaitingList = async (listId: number) => {
    try {
      const response = await fetch('/api/waiting-list/leave', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ list_id: listId })
      })
      if (!response.ok) throw new Error('Failed to leave waiting list')
      setWaitingList(prev => prev.filter(entry => entry.list_id !== listId))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 font-accent text-xs uppercase p-4 border border-red-500">Error: {error}</div>
  }

  if (waitingList.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-zinc-700 rounded-lg">
        <span className="material-symbols-outlined text-4xl text-zinc-600 block mb-3">done_all</span>
        <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest">You are not in any waiting lists</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl text-primary mb-4">WAITING_LIST</h3>
      
      {waitingList.map((entry) => {
        const eventDate = entry.event?.start_time ? new Date(entry.event.start_time).toLocaleDateString() : 'TBA'
        const isConverted = entry.status === 'converted'
        const isExpired = entry.status === 'expired'

        return (
          <div
            key={entry.list_id}
            className={`border-2 p-4 rounded-lg transition-all ${
              isConverted
                ? 'border-green-500 bg-green-500/5'
                : isExpired
                  ? 'border-zinc-700 bg-zinc-900/50 opacity-60'
                  : 'border-primary bg-black/60 hover:border-primary/80'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-display text-lg text-white mb-1">
                  {entry.event?.title || 'Unknown Event'}
                </h4>
                <p className="font-accent text-[8px] text-zinc-400 uppercase tracking-widest">
                  {isConverted ? '✓ CONVERTED TO ORDER' : isExpired ? 'EXPIRED' : `QUEUE_POSITION: #${entry.queue_position}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl text-primary font-bold">{entry.queue_position}</p>
                <p className="font-accent text-[7px] text-zinc-500 uppercase">Position</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-white/10">
              <div>
                <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">Ticket Type</p>
                <p className="font-mono text-xs text-zinc-300">{entry.ticketType?.ticket_type_name || 'TBA'}</p>
              </div>
              <div>
                <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">Event Date</p>
                <p className="font-mono text-xs text-zinc-300">{eventDate}</p>
              </div>
              <div>
                <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                <p className={`font-accent text-[8px] uppercase tracking-widest ${
                  isConverted ? 'text-green-400' : 'text-primary'
                }`}>
                  {entry.status}
                </p>
              </div>
            </div>

            {/* Action */}
            {!isConverted && !isExpired && (
              <button
                onClick={() => handleLeaveWaitingList(entry.list_id)}
                className="w-full py-2 border border-zinc-700 text-zinc-400 font-accent text-xs uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-colors rounded"
              >
                Leave Waiting List
              </button>
            )}
            {isConverted && (
              <div className="text-center">
                <p className="font-accent text-[8px] text-green-400 uppercase tracking-widest">
                  ✓ Your order has been created with this ticket
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
