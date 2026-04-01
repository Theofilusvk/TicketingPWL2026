import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { NewsFeed } from '../components/NewsFeed'
import { useStore } from '../lib/store'
import { AudioPreview } from '../components/AudioPreview'

export function EventsPage() {
  const { tier, ownedTickets, events } = useStore()
  const [activeCategory, setActiveCategory] = useState('SEMUA')

  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 12,
    minutes: 45,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Derive available categories from events
  const usedCategories = useMemo(() => {
    const cats = [...new Set(events.map(e => e.category).filter(Boolean))]
    return cats
  }, [events])

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'SEMUA') return events
    return events.filter(e => e.category === activeCategory)
  }, [events, activeCategory])

  return (
    <div className="pt-24 pb-32">
      <div className="container mx-auto px-4">
        {tier !== 'PHANTOM' && (
          <div className="mb-12 bg-primary/10 border border-primary p-4 flex items-center justify-between text-primary font-accent text-[10px] uppercase tracking-widest reveal shadow-[0_0_15px_rgba(203,255,0,0.15)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">verified_user</span>
              <span>{tier} CLEARANCE RECOGNIZED</span>
            </div>
            <span>{ownedTickets.length} TICKETS SECURED</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Events Area */}
          <div className="flex-1">
            <div className="flex justify-between items-end border-b border-primary/30 pb-4 mb-8">
              <div>
                <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
                  SYSTEM_EVENTS
                </h1>
                <p className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest mt-2">
                  / NEXT TRANSMISSION IN:
                </p>
              </div>
              
              <div className="hidden md:flex gap-4 font-mono text-xl text-primary font-bold">
                <div className="text-center"><span className="shadow-[0_0_10px_rgba(203,255,0,0.3)]">{String(timeLeft.days).padStart(2, '0')}</span><span className="block text-[8px] font-accent text-zinc-500 mt-1">D</span></div>
                <span className="animate-pulse-slow">:</span>
                <div className="text-center"><span className="shadow-[0_0_10px_rgba(203,255,0,0.3)]">{String(timeLeft.hours).padStart(2, '0')}</span><span className="block text-[8px] font-accent text-zinc-500 mt-1">H</span></div>
                <span className="animate-pulse-slow">:</span>
                <div className="text-center"><span className="shadow-[0_0_10px_rgba(203,255,0,0.3)]">{String(timeLeft.minutes).padStart(2, '0')}</span><span className="block text-[8px] font-accent text-zinc-500 mt-1">M</span></div>
                <span className="animate-pulse-slow">:</span>
                <div className="text-center"><span className="text-white shadow-[0_0_10px_rgba(255,255,255,0.3)]">{String(timeLeft.seconds).padStart(2, '0')}</span><span className="block text-[8px] font-accent text-zinc-500 mt-1">S</span></div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">/ FILTER:</span>
              <button
                onClick={() => setActiveCategory('SEMUA')}
                className={`px-4 py-1.5 font-accent text-[10px] uppercase tracking-widest transition-all border ${
                  activeCategory === 'SEMUA'
                    ? 'bg-primary text-black border-primary font-bold'
                    : 'border-zinc-700 text-zinc-400 hover:border-white hover:text-white'
                }`}
              >
                Semua
              </button>
              {usedCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 font-accent text-[10px] uppercase tracking-widest transition-all border ${
                    activeCategory === cat
                      ? 'bg-primary text-black border-primary font-bold'
                      : 'border-zinc-700 text-zinc-400 hover:border-white hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-20 border-2 border-dashed border-zinc-800 text-center">
                <span className="material-symbols-outlined text-5xl text-zinc-700 mb-4 block">search_off</span>
                <p className="font-display text-2xl text-zinc-500 mb-2">NO_EVENTS_FOUND</p>
                <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest">
                  Tidak ada event untuk kategori "{activeCategory}".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredEvents.map((e, index) => {
                  const isLocked = e.status === 'LOCKED'
                  const isSoldOut = e.ticketsLeft === 0
                  return (
                  <div
                    key={e.id}
                    className={`group flex flex-col border-[3px] p-6 transition-all hover:-translate-y-1 bg-black/40 ${e.colorClasses || 'border-zinc-800'}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Header: date + status badge */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">
                        {e.date} // {e.venue}
                      </span>
                      {isLocked ? (
                        <div className="bg-zinc-800 text-zinc-400 font-accent text-[8px] uppercase tracking-widest px-3 py-1 ml-4 whitespace-nowrap shrink-0">
                          {isSoldOut ? 'SOLD OUT' : e.status}
                        </div>
                      ) : (
                        <div className="bg-primary text-black font-accent text-[8px] uppercase tracking-widest px-3 py-1 font-bold ml-4 whitespace-nowrap shrink-0">
                          {e.status}
                        </div>
                      )}
                    </div>

                    {/* Title — fixed height area */}
                    <div className="min-h-[120px] flex items-start mb-3">
                      <Link to={`/events/${e.id}`} className="hover:text-primary transition-colors">
                        <h2 className="font-display text-4xl md:text-5xl leading-none text-white tracking-wide">
                          {e.name}
                        </h2>
                      </Link>
                    </div>

                    {/* Category Badge + Stock */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 h-6">
                      {e.category && (
                        <span className="bg-white/5 text-zinc-300 border border-zinc-700 px-2 py-0.5 font-accent text-[8px] uppercase tracking-widest">
                          {e.category}
                        </span>
                      )}
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 font-accent text-[8px] uppercase tracking-widest border ${
                        e.ticketsLeft > 50 ? 'border-primary/20 text-primary' :
                        e.ticketsLeft > 0 ? 'border-amber-500/20 text-amber-400' :
                        'border-hot-coral/20 text-hot-coral'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          e.ticketsLeft > 50 ? 'bg-primary' :
                          e.ticketsLeft > 0 ? 'bg-amber-400' :
                          'bg-hot-coral'
                        }`} />
                        {e.ticketsLeft > 0 ? `${e.ticketsLeft}/${e.capacity}` : 'HABIS'}
                      </span>
                    </div>

                    {/* Poster Block — fixed aspect ratio */}
                    <div className={`aspect-[4/3] w-full mb-4 relative overflow-hidden ${isLocked ? 'bg-[#3a2022]' : 'bg-[#2a3014]'}`}>
                      <img src={e.image} alt={e.name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                    </div>

                    {/* Audio Preview — fixed height slot */}
                    <div className="h-[76px] mb-4">
                      {e.audioSrc ? (
                        <AudioPreview 
                          src={e.audioSrc} 
                          title={e.audioName || 'UNKNOWN TRACK'} 
                          artist={e.audioArtist || 'UNKNOWN ARTIST'} 
                          color={e.id === 'neon-chaos-2025' ? '#CBFF00' : e.id === 'static-pulse' ? '#FF4D4D' : '#00F0FF'}
                        />
                      ) : (
                        <div className="w-full h-full border border-zinc-800/50 flex items-center justify-center bg-black/20 rounded-lg">
                          <span className="font-accent text-[8px] text-zinc-700 uppercase tracking-widest">NO AUDIO PREVIEW</span>
                        </div>
                      )}
                    </div>

                    {/* CTA — pushed to bottom */}
                    <div className="mt-auto">
                      {isLocked || isSoldOut ? (
                        <button
                          className="w-full border border-zinc-700 text-zinc-500 px-8 py-4 font-accent font-bold text-xs uppercase cursor-not-allowed tracking-widest text-center"
                          disabled
                        >
                          {isSoldOut ? 'SOLD OUT' : 'LOCKED'}
                        </button>
                      ) : (
                        <Link
                          className={`block w-full ${e.btnColor || 'bg-white text-black'} px-8 py-4 font-accent font-bold text-xs uppercase transition-colors tracking-widest text-center border border-primary hover:bg-transparent hover:text-primary`}
                          to={`/reserve/${e.id}`}
                        >
                          GET ACCESS
                        </Link>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>

          <aside className="lg:w-80 shrink-0">
            <NewsFeed />
          </aside>
        </div>
      </div>
    </div>
  )
}