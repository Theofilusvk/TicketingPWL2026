import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { useAudio } from '../lib/audio'

interface TicketTransfer {
  transfer_id: number
  ticket_id: number
  from_user_id: number
  to_user_id: number | null
  type: 'transfer' | 'cancellation'
  transfer_price: number | null
  reason: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired'
  expires_at: string
  created_at: string
  ticket?: {
    ticket_id: number
    unique_code: string
    status: string
  }
  fromUser?: {
    user_id: number
    username: string
  }
  toUser?: {
    user_id: number
    username: string
  }
}

export function TicketTransferManager() {
  const { user } = useAuth()
  const { playClickSound, playHoverSound } = useAudio()
  const [myTransfers, setMyTransfers] = useState<TicketTransfer[]>([])
  const [pendingTransfers, setPendingTransfers] = useState<TicketTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'outgoing' | 'incoming'>('incoming')

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const [myRes, pendingRes] = await Promise.all([
          fetch('/api/ticket-transfers/my', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/ticket-transfers/pending', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        if (!myRes.ok || !pendingRes.ok) throw new Error('Failed to fetch transfers')

        const myData = await myRes.json()
        const pendingData = await pendingRes.json()

        setMyTransfers(myData)
        setPendingTransfers(pendingData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (user && token) fetchTransfers()
  }, [user, token])

  const handleAcceptTransfer = async (transfer: TicketTransfer) => {
    try {
      playClickSound()
      const response = await fetch(`/api/ticket-transfers/${transfer.transfer_id}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to accept transfer')

      setPendingTransfers(prev => prev.filter(t => t.transfer_id !== transfer.transfer_id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectTransfer = async (transfer: TicketTransfer) => {
    try {
      playClickSound()
      const response = await fetch(`/api/ticket-transfers/${transfer.transfer_id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'User declined' })
      })

      if (!response.ok) throw new Error('Failed to reject transfer')

      setPendingTransfers(prev => prev.filter(t => t.transfer_id !== transfer.transfer_id))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 font-accent text-xs p-4 border border-red-500 rounded">Error: {error}</div>
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-700">
        <button
          onClick={() => { playClickSound(); setActiveTab('incoming') }}
          onMouseEnter={playHoverSound}
          className={`py-3 px-4 font-accent text-xs uppercase tracking-widest transition-colors ${
            activeTab === 'incoming'
              ? 'border-b-2 border-primary text-primary'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          Incoming ({pendingTransfers.length})
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('outgoing') }}
          onMouseEnter={playHoverSound}
          className={`py-3 px-4 font-accent text-xs uppercase tracking-widest transition-colors ${
            activeTab === 'outgoing'
              ? 'border-b-2 border-primary text-primary'
              : 'text-zinc-500 hover:text-zinc-400'
          }`}
        >
          Outgoing ({myTransfers.length})
        </button>
      </div>

      {/* Incoming Transfers */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {pendingTransfers.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-zinc-700 rounded-lg">
              <span className="material-symbols-outlined text-4xl text-zinc-600 block mb-3">mail</span>
              <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest">No pending transfer offers</p>
            </div>
          ) : (
            pendingTransfers.map((transfer) => (
              <div key={transfer.transfer_id} className="border-2 border-yellow-600 bg-yellow-600/5 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-display text-lg text-yellow-400 mb-1">
                      {transfer.fromUser?.username || 'Unknown User'} wants to transfer a ticket
                    </h4>
                    <p className="font-accent text-[8px] text-zinc-400 uppercase tracking-widest">
                      Ticket #{transfer.ticket?.unique_code}
                    </p>
                  </div>
                  {isExpired(transfer.expires_at) && (
                    <span className="bg-red-600 text-white px-3 py-1 font-accent text-[8px] uppercase tracking-widest rounded">
                      EXPIRED
                    </span>
                  )}
                </div>

                {/* Transfer Details */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-yellow-600/30">
                  <div>
                    <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">Type</p>
                    <p className="font-accent text-sm text-yellow-300">{transfer.type}</p>
                  </div>
                  <div>
                    <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">
                      {transfer.transfer_price ? 'Transfer Price' : 'Status'}
                    </p>
                    <p className="font-accent text-sm text-yellow-300">
                      {transfer.transfer_price ? `$${transfer.transfer_price}` : 'Free transfer'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">Expires</p>
                    <p className="font-accent text-sm text-zinc-300">
                      {new Date(transfer.expires_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {!isExpired(transfer.expires_at) && transfer.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptTransfer(transfer)}
                      onMouseEnter={playHoverSound}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 font-accent text-xs uppercase tracking-widest rounded transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectTransfer(transfer)}
                      onMouseEnter={playHoverSound}
                      className="flex-1 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-2 font-accent text-xs uppercase tracking-widest rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Outgoing Transfers */}
      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          {myTransfers.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-zinc-700 rounded-lg">
              <span className="material-symbols-outlined text-4xl text-zinc-600 block mb-3">send</span>
              <p className="font-accent text-xs text-zinc-500 uppercase tracking-widest">
                You have not initiated any transfers
              </p>
            </div>
          ) : (
            myTransfers.map((transfer) => (
              <div
                key={transfer.transfer_id}
                className={`border-2 p-4 rounded-lg ${
                  transfer.status === 'completed'
                    ? 'border-green-600 bg-green-600/5'
                    : transfer.status === 'rejected'
                      ? 'border-red-600 bg-red-600/5'
                      : 'border-primary bg-black/60'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-display text-lg text-white mb-1">
                      Transfer to {transfer.toUser?.username || 'Unknown User'}
                    </h4>
                    <p className="font-accent text-[8px] text-zinc-400 uppercase tracking-widest">
                      Ticket #{transfer.ticket?.unique_code}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 font-accent text-[8px] uppercase tracking-widest rounded ${
                      transfer.status === 'completed'
                        ? 'bg-green-600 text-white'
                        : transfer.status === 'rejected'
                          ? 'bg-red-600 text-white'
                          : transfer.status === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {transfer.status}
                  </span>
                </div>

                {/* Transfer Details */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/10">
                  <div>
                    <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">Type</p>
                    <p className="font-accent text-sm text-zinc-300">{transfer.type}</p>
                  </div>
                  <div>
                    <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">
                      {transfer.transfer_price ? 'Price' : ''}
                    </p>
                    <p className="font-accent text-sm text-zinc-300">
                      {transfer.transfer_price ? `$${transfer.transfer_price}` : '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-accent text-[7px] text-zinc-500 uppercase tracking-widest mb-1">
                      {transfer.status === 'pending' ? 'Expires' : 'Created'}
                    </p>
                    <p className="font-accent text-sm text-zinc-300">
                      {new Date(
                        transfer.status === 'pending' ? transfer.expires_at : transfer.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
