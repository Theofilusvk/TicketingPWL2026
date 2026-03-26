import { useParams, Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { AnimatedTicket } from '../components/AnimatedTicket'

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const { ownedTickets } = useStore()
  
  const ticket = ownedTickets.find(t => t.ticketId === ticketId)

  if (!ticket) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16 text-center">
        <h1 className="font-display text-6xl text-zinc-500 mb-4">TICKET_NOT_FOUND</h1>
        <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest mb-8">
          No ticket matching this ID exists in your wallet.
        </p>
        <Link to="/tickets" className="font-accent text-xs text-primary uppercase tracking-widest hover:underline">
          ← BACK TO TICKETS
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-[900px] mx-auto px-4 lg:px-8 py-8 mb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-8 reveal">
        <Link to="/tickets" className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest hover:text-primary transition-colors">
          ← MY TICKETS
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest">{ticket.ticketId}</span>
      </div>

      {/* NFT Animated Ticket */}
      <div className="reveal">
        <AnimatedTicket ticket={ticket} />
      </div>

      {/* Info banner */}
      <div className="reveal mt-6 p-4 border border-zinc-800 bg-black/40 flex items-center gap-3">
        <span className="material-symbols-outlined text-lg text-primary">info</span>
        <p className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest">
          Hover over the ticket for holographic effects. Use SAVE to download as image or SHARE to send to others.
        </p>
      </div>
    </main>
  )
}
