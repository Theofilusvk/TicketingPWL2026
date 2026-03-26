import { useState } from 'react'
import { useStore } from '../../lib/store'
import { useAudio } from '../../lib/audio'

type Zone = {
  id: string
  name: string
  capacity: number
  path: string
  tiers: string[]
}

const ZONES: Zone[] = [
  { 
    id: 'main', 
    name: 'MAIN FLOOR', 
    capacity: 200, 
    path: 'M 10 10 L 90 10 L 90 60 L 50 80 L 10 60 Z', // Polygon points (viewBox 0 0 100 100)
    tiers: ['PHANTOM', 'SQUIRE']
  },
  { 
    id: 'mezzanine', 
    name: 'MEZZANINE', 
    capacity: 50, 
    path: 'M 10 65 L 50 85 L 90 65 L 90 90 L 10 90 Z',
    tiers: ['KNIGHT', 'LORD']
  },
  { 
    id: 'vip', 
    name: 'VIP OVERLOOK', 
    capacity: 50, 
    path: 'M 25 15 L 75 15 L 75 40 L 50 50 L 25 40 Z',
    tiers: ['SOVEREIGN']
  }
]

export function AdminVenuesPage() {
  const { ownedTickets, events } = useStore()
  const { playHoverSound } = useAudio()
  
  const [activeZone, setActiveZone] = useState<Zone | null>(null)
  
  // Choose "static-pulse" which uses VOID STATION 4
  const targetEvent = events.find(e => e.id === 'static-pulse')
  const validTickets = ownedTickets.filter(t => t.eventId === targetEvent?.id)

  const getZoneStats = (zone: Zone) => {
    const sold = validTickets.filter(t => zone.tiers.includes(t.tier)).length
    const isFull = sold >= zone.capacity
    const fillPercentage = Math.min((sold / zone.capacity) * 100, 100)
    
    return { sold, isFull, fillPercentage }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Venue Matrix</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Interactive capacity mapping for {targetEvent?.venue || 'The Hub'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 items-start">
        
        {/* Left Side: SVG Map Area */}
        <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden min-h-[500px] flex items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          
          <svg viewBox="0 0 100 100" className="w-full max-w-[500px] drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10 overflow-visible">
            <defs>
              <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
              </pattern>
            </defs>
            
            {/* Background Wireframe Grid */}
            <rect width="100" height="100" fill="url(#grid)" />
            
            {ZONES.map(zone => {
              const { isFull, fillPercentage } = getZoneStats(zone)
              const isActive = activeZone?.id === zone.id
              
              const baseColor = isFull ? 'rgba(251, 113, 133, 1)' : 'rgba(203, 255, 0, 1)'
              const fillColor = isFull ? `rgba(251, 113, 133, ${isActive ? 0.3 : 0.1})` : `rgba(203, 255, 0, ${isActive ? 0.3 : 0.1})`
              
              return (
                <g 
                  key={zone.id}
                  onMouseEnter={() => { setActiveZone(zone); playHoverSound() }}
                  onMouseLeave={() => setActiveZone(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ transformOrigin: '50% 50%', transform: isActive ? 'scale(1.02)' : 'scale(1)' }}
                >
                  <path 
                    d={zone.path} 
                    fill={fillColor}
                    stroke={baseColor}
                    strokeWidth={isActive ? "1" : "0.5"}
                    strokeDasharray={isActive ? "none" : "2,1"}
                    className="transition-all duration-500"
                    style={{ filter: isActive ? `drop-shadow(0 0 15px ${baseColor})` : 'none' }}
                  />
                  {/* Fake nodes at vertices for tech aesthetic */}
                  {isActive && (
                     <path d={zone.path} fill="none" stroke="white" strokeWidth="0.2" strokeDasharray="2,3" className="animate-pulse" />
                  )}
                  {/* Capacity text inside zone */}
                  {isActive && (
                    <text x="50" y="25" textAnchor="middle" fill="white" fontSize="4" className="font-mono font-bold tracking-widest pointer-events-none" style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.8))' }}>
                      {fillPercentage.toFixed(0)}%
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Right Side: Zone Intel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide drop-shadow-md">Sector Diagnostics</h2>
            
            {activeZone ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-2">
                  <h3 className="text-2xl font-display text-white tracking-widest">{activeZone.name}</h3>
                  <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mt-1">Authorized for: {activeZone.tiers.join(', ')}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between font-accent text-[10px] uppercase tracking-widest">
                    <span className="text-zinc-400">Capacity Load</span>
                    <span className="text-white font-mono">{getZoneStats(activeZone).sold} / {activeZone.capacity}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${getZoneStats(activeZone).isFull ? 'bg-rose-500 shadow-[0_0_10px_rgba(251,113,133,0.8)]' : 'bg-primary shadow-[0_0_10px_rgba(203,255,0,0.5)]'}`}
                      style={{ width: `${getZoneStats(activeZone).fillPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/30 border border-white/[0.05] p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${getZoneStats(activeZone).isFull ? 'bg-rose-500 shadow-[0_0_10px_rgba(251,113,133,0.8)]' : 'bg-primary shadow-[0_0_10px_rgba(203,255,0,0.8)]'}`} />
                    <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest">Status</span>
                  </div>
                  <span className={`font-mono font-bold text-sm tracking-widest ${getZoneStats(activeZone).isFull ? 'text-rose-500' : 'text-primary'}`}>
                    {getZoneStats(activeZone).isFull ? 'OVERLOAD' : 'NOMINAL'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center gap-4 text-center opacity-50">
                <span className="material-symbols-outlined text-4xl text-white/40">touch_app</span>
                <p className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">Hover over a sector<br/>to initialize diagnostics</p>
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="text-base font-semibold text-white/90 mb-4 tracking-wide drop-shadow-md">Global Event Status</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
                 <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Event</span>
                 <span className="font-mono text-xs font-bold text-white">{targetEvent?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/[0.05]">
                 <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Total Issued</span>
                 <span className="font-mono text-xs font-bold text-primary">{validTickets.length} TKT</span>
              </div>
              <div className="flex justify-between items-center py-2">
                 <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">System</span>
                 <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
