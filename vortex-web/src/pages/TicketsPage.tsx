import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'

export function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PAST' | 'TRANSFER'>('ACTIVE')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  
  const { ownedTickets, deleteTicket } = useStore()
  
  const selectedTicket = ownedTickets.find(t => t.ticketId === selectedTicketId)

  return (
    <main className="flex flex-col xl:flex-row gap-8 min-h-[70vh] px-4 md:px-8 max-w-[1440px] mx-auto py-8 mb-20">
      <section className={`reveal flex-1 transition-all duration-300 ${selectedTicket ? 'xl:pr-8 xl:border-r border-primary/20' : ''}`}>
        <div className="mb-10">
          <h1 className="distort-title font-display text-7xl md:text-9xl mb-2 text-white">
            MY_TICKETS
          </h1>
          <div className="flex gap-4 font-accent text-[10px] tracking-widest mt-4">
            <span className="bg-primary text-black px-2 py-1 font-bold uppercase">
              / PROTOCOL_ACTIVE
            </span>
            <span className="border border-primary text-primary px-2 py-1 uppercase">
              / RECOVER_ARCHIVE
            </span>
          </div>
        </div>

        <div className="mb-12 flex gap-6 font-accent text-xs border-b border-primary/20 pb-4">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`tracking-widest uppercase transition-colors ${activeTab === 'ACTIVE' ? 'text-primary font-bold' : 'text-primary/50 hover:text-primary'}`}
          >
            / ACTIVE
          </button>
          <button 
            onClick={() => setActiveTab('PAST')}
            className={`tracking-widest uppercase transition-colors ${activeTab === 'PAST' ? 'text-primary font-bold' : 'text-primary/50 hover:text-primary'}`}
          >
            / PAST
          </button>
          <button 
            onClick={() => setActiveTab('TRANSFER')}
            className={`tracking-widest uppercase transition-colors ${activeTab === 'TRANSFER' ? 'text-primary font-bold' : 'text-primary/50 hover:text-primary'}`}
          >
            / TRANSFER
          </button>
        </div>

        {ownedTickets.length === 0 ? (
          <div className="py-20 border-2 border-dashed border-white/20 text-center flex flex-col items-center justify-center opacity-60">
             <span className="material-symbols-outlined text-6xl text-white/40 mb-4">confirmation_number</span>
             <p className="font-display text-3xl text-white mb-2">NO ACTIVE TICKETS FOUND</p>
             <p className="font-accent text-[10px] uppercase tracking-widest text-zinc-500">ACQUIRE ACCESS PROTOCOLS TO VIEW THEM HERE.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${selectedTicket ? 'lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8 transition-all`}>
            {ownedTickets.map((ticket) => {
              const isSelected = selectedTicketId === ticket.ticketId
              return (
                <div 
                  key={ticket.ticketId}
                  onClick={() => setSelectedTicketId(ticket.ticketId)}
                  className={`group relative glass-card p-1 overflow-hidden cursor-pointer transition-all border-2 ${isSelected ? 'border-primary shadow-[0_0_20px_rgba(203,255,0,0.2)]' : 'border-transparent hover:border-primary/50 bg-black/40'}`}
                >
                  <div className="absolute top-2 right-2 border border-accent text-accent font-accent text-[8px] tracking-widest px-2 py-0.5 z-10 rounded-full bg-black/50">
                    LIVE_NOW
                  </div>
                  <div className="flex flex-col h-full">
                    <div
                      className={`w-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500 ${selectedTicket ? 'h-48' : 'h-64'}`}
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCXp4XOYOJKdTfvFItHXmA3ix9gOs6TIv7TvupQq-lsZIv8ntkfpJkp_Qq7ez55DXlRTpC3I8nf17P5izD8OucY4N4cvktQBozwbyKAcoj7FPqXNZai2jherKt8nm3PgAtup9bUnozYA9XO7vvo7FfZQXXpbBZ6sSLwv2XQkG62bEHXqBLc-jqBUE3SunVzBhtUviZgigbBe7OvEU3D23sosqEcsyhFU7H8uFIFHiArmuNjGhbFFRqrhMgIpXb8YJsh4YdTv6YA0V8")',
                      }}
                    />
                    <div className="flex-1 p-5 flex flex-col justify-between bg-black/40 relative">
                      <div className="mt-2">
                        <h2 className={`font-display text-primary leading-none mb-2 ${selectedTicket ? 'text-4xl' : 'text-5xl'}`}>
                          {ticket.eventName}
                        </h2>
                        <p className="font-accent text-[8px] text-accent mb-6 tracking-widest">
                          {ticket.date}
                        </p>
                        <div className="flex flex-col gap-3 font-accent text-[10px]">
                          <div className="flex justify-between border-b border-primary/20 pb-1">
                            <span className="text-zinc-500 uppercase tracking-widest">/ Tier</span>
                            <span className="text-primary font-bold">{ticket.tier}</span>
                          </div>
                          <div className="flex justify-between border-b border-primary/20 pb-1">
                            <span className="text-zinc-500 uppercase tracking-widest">/ Gate</span>
                            <span className="text-zinc-300 font-bold">{ticket.gate}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`mt-6 pt-4 border-t border-primary/20 relative z-20`}>
                        <Link 
                          to={`/events/${ticket.eventId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-3 bg-primary/10 text-primary border border-primary font-accent font-bold text-[10px] uppercase hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">event</span>
                          VIEW_EVENT
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* DYNAMIC SIDEBAR TICKET INFO */}
      {selectedTicket && (
        <aside className="reveal w-full xl:w-[450px] shrink-0 border border-primary p-6 flex flex-col gap-8 bg-black/60 shadow-[0_0_40px_rgba(203,255,0,0.05)] animate-in slide-in-from-right-8 duration-300">
          <div>
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-display text-5xl text-primary">TICKET_INFO</h2>
              <button onClick={() => setSelectedTicketId(null)} className="text-zinc-500 hover:text-hot-coral transition-colors flex items-center justify-center p-2 rounded-full hover:bg-hot-coral/10">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <div className="space-y-6 font-accent text-sm">
              <div className="border-b border-white/10 pb-4">
                <p className="text-[10px] text-zinc-500 mb-1 tracking-widest uppercase">/ EVENT_NAME</p>
                <p className="font-display text-4xl text-white">{selectedTicket.eventName}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] text-zinc-500 mb-1 tracking-widest uppercase">/ DATE</p>
                  <p className="text-white text-xs">{selectedTicket.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 mb-1 tracking-widest uppercase">/ ASSIGNED</p>
                  <p className="font-bold text-primary text-xs truncate">{selectedTicket.assignedName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] text-zinc-500 mb-1 tracking-widest uppercase">/ TIER</p>
                  <p className="font-bold text-white text-xs">{selectedTicket.tier}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 mb-1 tracking-widest uppercase">/ ORDER_ID</p>
                  <p className="text-zinc-400 font-mono text-[10px]">{selectedTicket.orderId}</p>
                </div>
              </div>


              <div className="bg-black/40 border border-primary/30 p-4">
                 <p className="text-[8px] text-primary mb-2 tracking-widest uppercase">/ ACCESS_QR_CODE</p>
                 <div className="w-full bg-white p-4">
                   <img 
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket.ticketId}`} 
                     alt="QR Code" 
                     className="mx-auto mix-blend-multiply"
                   />
                 </div>
                 <p className="text-center font-mono text-[10px] mt-3 text-zinc-400">ID: {selectedTicket.ticketId}</p>
              </div>

              <Link
                to={`/tickets/${encodeURIComponent(selectedTicket.ticketId)}`}
                onClick={(e) => e.stopPropagation()}
                className="w-full py-3 mt-4 bg-primary/10 text-primary border border-primary font-accent font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">style</span>
                VIEW_NFT_TICKET
              </Link>

              <button 
                onClick={() => {
                  deleteTicket(selectedTicket.ticketId)
                  setSelectedTicketId(null)
                }}
                className="w-full py-3 mt-2 border border-hot-coral text-hot-coral font-bold text-xs uppercase tracking-widest hover:bg-hot-coral hover:text-black transition-all"
              >
                DELETE_TICKET (DEV)
              </button>
            </div>
          </div>
        </aside>
      )}
    </main>
  )
}
