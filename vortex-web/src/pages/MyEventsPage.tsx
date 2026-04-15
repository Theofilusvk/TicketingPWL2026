import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useAudio } from '../lib/audio'
import { WaitingListDisplay } from '../components/WaitingListDisplay'
import { TicketTransferManager } from '../components/TicketTransferManager'

type Tab = 'tickets' | 'waiting-list' | 'transfers'

export function MyEventsPage() {
  const { user } = useAuth()
  const { playClickSound, playHoverSound } = useAudio()
  const [activeTab, setActiveTab] = useState<Tab>('tickets')

  if (!user) {
    return (
      <div className="reveal max-w-4xl mx-auto py-12 text-center">
        <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest">
          Please login to view your events
        </p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'tickets', label: 'My Tickets', icon: 'confirmation_number' },
    { id: 'waiting-list', label: 'Waiting List', icon: 'schedule' },
    { id: 'transfers', label: 'Transfers', icon: 'send' },
  ]

  return (
    <main className="reveal max-w-6xl mx-auto px-4 lg:px-8 py-12 mb-20">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-display text-5xl md:text-7xl leading-none text-primary mb-4">
          MY_EVENTS
        </h1>
        <p className="font-accent text-xs text-zinc-400 uppercase tracking-widest">
          Manage your tickets, waiting lists, and transfers
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b border-zinc-800 overflow-x-auto pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playClickSound()
              setActiveTab(tab.id)
            }}
            onMouseEnter={playHoverSound}
            className={`inline-flex items-center gap-2 py-3 px-4 font-accent text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary shadow-[0_0_15px_rgba(203,255,0,0.2)]'
                : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[50vh]">
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <TicketsSection userId={user.id} />
          </div>
        )}

        {activeTab === 'waiting-list' && (
          <div className="space-y-6">
            <WaitingListDisplay />
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="space-y-6">
            <TicketTransferManager />
          </div>
        )}
      </div>
    </main>
  )
}

interface Ticket {
  ticket_id: number
  unique_code: string
  qr_code_path: string | null
  status: 'available' | 'used' | 'cancelled'
  checked_in_at: string | null
  orderItem?: {
    order_item_id: number
    ticket_type: string
    order?: {
      event_id: number
      status: string
      event?: {
        title: string
        start_time: string
        location: string
      }
    }
  }
}

function TicketsSection({ userId }: { userId: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { playClickSound, playHoverSound } = useAudio()

  React.useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/tickets`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch tickets')
        const data = await response.json()
        setTickets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [userId])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 font-accent text-xs p-4 border border-red-500 rounded">Error: {error}</div>
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-zinc-700 rounded-lg">
        <span className="material-symbols-outlined text-6xl text-zinc-600 block mb-4">confirmation_number</span>
        <h3 className="font-display text-xl text-zinc-500 mb-2">NO_TICKETS</h3>
        <p className="font-accent text-xs text-zinc-600 uppercase tracking-widest">
          You haven't purchased any tickets yet
        </p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-400/10 border-green-400'
      case 'used': return 'text-blue-400 bg-blue-400/10 border-blue-400'
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400'
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400'
    }
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const event = ticket.orderItem?.order?.event
        const eventDate = event?.start_time ? new Date(event.start_time).toLocaleDateString() : 'TBA'

        return (
          <div key={ticket.ticket_id} className="border border-zinc-800 bg-black/60 rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display text-lg text-white mb-1">{event?.title || 'Unknown Event'}</h3>
                <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">
                  Ticket #{ticket.unique_code}
                </p>
              </div>
              <span
                className={`px-3 py-1 font-accent text-[8px] uppercase tracking-widest rounded border ${getStatusColor(ticket.status)}`}
              >
                {ticket.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 pb-4 border-b border-zinc-800">
              <div>
                <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Type</p>
                <p className="font-accent text-sm text-zinc-300">{ticket.orderItem?.ticket_type || 'TBA'}</p>
              </div>
              <div>
                <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Date</p>
                <p className="font-accent text-sm text-zinc-300">{eventDate}</p>
              </div>
              <div>
                <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Location</p>
                <p className="font-accent text-sm text-zinc-300 truncate">{event?.location || 'TBA'}</p>
              </div>
              <div>
                <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest mb-1">
                  {ticket.checked_in_at ? 'Checked In' : 'Check-in'}
                </p>
                <p className="font-accent text-sm text-zinc-300">
                  {ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleDateString() : 'Pending'}
                </p>
              </div>
            </div>

            {/* QR Code & Actions */}
            <div className="flex justify-between items-center">
              {ticket.qr_code_path && ticket.status === 'available' ? (
                <img
                  src={ticket.qr_code_path}
                  alt="Ticket QR Code"
                  className="w-20 h-20 border border-zinc-700 p-1"
                />
              ) : (
                <div className="w-20 h-20 border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600">
                  <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                </div>
              )}

              {ticket.status === 'available' && (
                <button
                  onClick={() => playClickSound()}
                  onMouseEnter={playHoverSound}
                  className="flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-black font-accent text-xs uppercase tracking-widest transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Transfer / Cancel
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Re-export from React to fix import
import React from 'react'
