import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../lib/store'
import { useAudio } from '../lib/audio'

export function DropsPage() {
  const { credits, tier, addToCart, drops } = useStore()
  const { playHoverSound, playSuccessSound } = useAudio()

  const [tilt, setTilt] = useState<Record<string, { x: number; y: number }>>({});

  const handleTilt = useCallback((e: React.MouseEvent<HTMLDivElement>, name: string) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20
    setTilt(prev => ({ ...prev, [name]: { x, y } }))
  }, [])

  const resetTilt = useCallback((name: string) => {
    setTilt(prev => ({ ...prev, [name]: { x: 0, y: 0 } }))
  }, [])

  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 45,
    seconds: 12
  })

  // Basic countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev
        if (seconds > 0) {
          seconds--
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes--
          } else {
            minutes = 59
            if (hours > 0) {
              hours--
            } else {
              hours = 23
              if (days > 0) {
                days--
              }
            }
          }
        }
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 mb-20 flex flex-col xl:flex-row gap-12">
      
      {/* LEFT SIDE INFO */}
      <aside className="w-full xl:w-[350px] shrink-0 font-accent text-[10px] tracking-widest uppercase hidden xl:flex xl:flex-col gap-8 border-r border-primary/20 pr-8">
        <div className="flex flex-col gap-2">
           <span className="text-zinc-500">SYSTEM_STATUS</span>
           <span className="text-primary font-bold">ACTIVE_v4.0.2</span>
        </div>
        <div className="flex flex-col gap-2">
           <span className="text-zinc-500">GLOBAL_TICKETS</span>
           <span className="text-hot-coral font-bold animate-pulse">LIVE & SELLING FAST</span>
        </div>
        <div className="flex flex-col gap-2">
           <span className="text-zinc-500">YOUR_CREDIT_POOL</span>
           <span className="text-white font-mono text-sm">{credits.toLocaleString()} CRD</span>
        </div>
        <div className="flex flex-col gap-2">
           <span className="text-zinc-500">CURRENT_TIER</span>
           <span className="text-white">{tier}</span>
        </div>
        
        <div className="mt-8 border border-primary/20 bg-black/40 p-4 leading-relaxed text-zinc-400">
           Exclusive merchandise and digital protocols available only to registered phantoms. Use credits or standard currency to unlock.
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-16">
        
        {/* HERO HEADER */}
        <section className="reveal">
          <h1 className="distort-title font-display text-7xl md:text-9xl mb-4 leading-none">
            DROPS_SYSTEM
          </h1>
          <p className="font-accent text-[10px] uppercase tracking-widest text-zinc-500 max-w-lg mb-10">
            HIGH-FREQUENCY EXCLUSIVE RELEASES. AUTHENTICATED VIA VORTEX PROTOCOL. USE ACCUMULATED CREDITS FOR PREMIUM ACCESS.
          </p>

          {/* COUNTDOWN BLOCK */}
          <div className="border-[3px] border-primary p-6 md:p-10 bg-black/40 relative">
             <div className="absolute -top-4 -right-2 bg-primary text-black font-accent text-[8px] font-bold px-3 py-1 uppercase tracking-widest z-10">
               INCOMING TRANSMISSION
             </div>
             
             <h2 className="font-display text-5xl md:text-6xl text-white mb-8 italic">NEXT_DROP</h2>
             
             <div className="flex flex-wrap gap-6 md:gap-12 mb-10 font-display text-6xl md:text-8xl text-primary drop-shadow-[0_0_15px_rgba(203,255,0,0.5)]">
               <div className="flex flex-col items-center">
                 <span>{String(timeLeft.days).padStart(2, '0')}</span>
                 <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest mt-2">DAYS</span>
               </div>
               <span className="animate-pulse hidden sm:block">:</span>
               <div className="flex flex-col items-center">
                 <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                 <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest mt-2">HRS</span>
               </div>
               <span className="animate-pulse hidden sm:block">:</span>
               <div className="flex flex-col items-center">
                 <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                 <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest mt-2">MIN</span>
               </div>
               <span className="animate-pulse hidden sm:block">:</span>
               <div className="flex flex-col items-center text-hot-coral drop-shadow-[0_0_15px_rgba(255,77,77,0.5)]">
                 <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                 <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest mt-2">SEC</span>
               </div>
             </div>

             <button className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-black transition-colors font-accent font-bold text-xs uppercase tracking-widest flex items-center gap-3 w-full sm:w-auto justify-center">
               <span className="material-symbols-outlined text-sm">notifications_active</span>
               REMIND_ME
             </button>
          </div>
        </section>

        {/* MERCH SECTION */}
        <section className="reveal">
          <div className="flex items-center justify-between border-b-2 border-primary pb-2 mb-8">
            <h2 className="font-display text-4xl text-white">EXCLUSIVE_MERCH</h2>
            <span className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_8px_#CBFF00]">shopping_cart</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drops.map((item) => (
              <div
                key={item.id}
                className="glass-card hover-lift p-1 border-2 border-transparent hover:border-primary/50 transition-colors flex flex-col group cursor-pointer bg-black/40"
                style={{
                  transform: `perspective(600px) rotateX(${tilt[item.id]?.y ?? 0}deg) rotateY(${tilt[item.id]?.x ?? 0}deg)`,
                  transition: tilt[item.id] ? 'none' : 'transform 0.4s ease-out',
                }}
                onMouseMove={(e) => handleTilt(e, item.id)}
                onMouseLeave={() => resetTilt(item.id)}
                onMouseEnter={playHoverSound}
              >
                <div className="aspect-square border-b border-white/5 overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay" />
                  <div className={`absolute top-2 right-2 text-white font-accent text-[8px] font-bold px-2 py-1 uppercase tracking-widest z-20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse ${
                    item.rarity === 'LEGENDARY' ? 'bg-amber-500' :
                    item.rarity === 'EPIC' ? 'bg-fuchsia-500' :
                    item.rarity === 'RARE' ? 'bg-blue-500' :
                    'bg-zinc-500'
                  }`}>
                    {item.rarity}
                  </div>
                  <img className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0" src={item.image} alt={item.title} />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div className="mb-4">
                    <p className="font-display text-3xl text-white mb-1 group-hover:text-primary transition-colors">{item.title}</p>
                    <div className="flex flex-col gap-1 font-accent text-[10px] text-zinc-500 uppercase tracking-widest mt-2">
                      <span className="text-white font-mono">{Math.floor(item.price / 100)} USD</span>
                      <span>OR {item.price.toLocaleString()} CRD</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      playSuccessSound()
                      addToCart([{
                        id: `drop_${Math.random().toString(16).slice(2)}`,
                        title: item.title,
                        price: Math.floor(item.price / 100),
                        assignedName: 'MERCH_ITEM',
                        image: item.image
                      }])
                    }}
                    className="w-full py-3 border border-zinc-700 text-zinc-400 font-accent font-bold text-[10px] uppercase hover:bg-primary hover:text-black hover:border-primary transition-all tracking-widest"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DIGITAL COLLECTIBLES */}
        <section className="reveal">
          <div className="flex items-center justify-between border-b-2 border-hot-coral pb-2 mb-8">
            <h2 className="font-display text-4xl text-white">DIGITAL_COLLECTIBLES</h2>
            <span className="material-symbols-outlined text-hot-coral text-2xl drop-shadow-[0_0_8px_#FF4D4D]">token</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="border border-white/10 p-6 flex flex-col bg-black flex-1 items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-4xl text-zinc-600 mb-4">lock</span>
               <h3 className="font-display text-2xl text-zinc-400 mb-2">MYSTERY CACHE A</h3>
               <p className="font-accent text-[8px] tracking-widest uppercase text-zinc-500">Unlocks post-event</p>
             </div>
             <div className="border border-white/10 p-6 flex flex-col bg-black flex-1 items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-4xl text-zinc-600 mb-4">lock</span>
               <h3 className="font-display text-2xl text-zinc-400 mb-2">MYSTERY CACHE B</h3>
               <p className="font-accent text-[8px] tracking-widest uppercase text-zinc-500">Unlocks post-event</p>
             </div>
             <div className="border border-white/10 p-6 flex flex-col bg-black flex-1 items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-4xl text-zinc-600 mb-4">lock</span>
               <h3 className="font-display text-2xl text-zinc-400 mb-2">MYSTERY CACHE C</h3>
               <p className="font-accent text-[8px] tracking-widest uppercase text-zinc-500">Unlocks post-event</p>
             </div>
          </div>
        </section>

        {/* PAST DROPS LOG */}
        <section className="reveal border-t border-dashed border-zinc-700 pt-16">
          <h2 className="font-display text-4xl text-white mb-8">PAST_DROPS_LOG</h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-black/40 border border-zinc-800 p-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
               <div className="flex flex-col">
                 <span className="font-accent text-[8px] text-zinc-500 tracking-widest mb-1">08.12.24</span>
                 <span className="font-display text-2xl text-white transition-colors">VOID_BOMBER_JACKET</span>
               </div>
               <span className="font-accent text-[10px] text-hot-coral uppercase tracking-widest font-bold">SOLD_OUT</span>
            </div>
            <div className="flex justify-between items-center bg-black/40 border border-zinc-800 p-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
               <div className="flex flex-col">
                 <span className="font-accent text-[8px] text-zinc-500 tracking-widest mb-1">05.05.24</span>
                 <span className="font-display text-2xl text-white transition-colors">VORTEX_STUBS_V1</span>
               </div>
               <span className="font-accent text-[10px] text-hot-coral uppercase tracking-widest font-bold">SOLD_OUT</span>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
