import { useState } from 'react'
import { useAudio } from '../lib/audio'

interface Zone {
  id: string
  label: string
  tier: string
  price: string
  capacity: string
  status: string
  color: string
  hoverColor: string
  path: string
}

const ZONES: Zone[] = [
  {
    id: 'elite',
    label: 'ELITE_ZONE',
    tier: 'ELITE ACCESS',
    price: '249 USD',
    capacity: '50 / 50 SLOTS',
    status: 'AVAILABLE',
    color: '#7C3AED',
    hoverColor: '#8B5CF6',
    path: 'M 200 60 L 360 60 L 380 100 L 180 100 Z',
  },
  {
    id: 'vip-left',
    label: 'VIP_WEST',
    tier: 'VIP ACCESS',
    price: '149 USD',
    capacity: '80 / 100 SLOTS',
    status: 'SELLING FAST',
    color: '#CBFF00',
    hoverColor: '#D4FF33',
    path: 'M 60 120 L 170 120 L 170 280 L 60 280 Z',
  },
  {
    id: 'vip-right',
    label: 'VIP_EAST',
    tier: 'VIP ACCESS',
    price: '149 USD',
    capacity: '65 / 100 SLOTS',
    status: 'SELLING FAST',
    color: '#CBFF00',
    hoverColor: '#D4FF33',
    path: 'M 390 120 L 500 120 L 500 280 L 390 280 Z',
  },
  {
    id: 'general-left',
    label: 'GEN_ALPHA',
    tier: 'GENERAL ACCESS',
    price: '69 USD',
    capacity: '200 / 300 SLOTS',
    status: 'AVAILABLE',
    color: '#3B82F6',
    hoverColor: '#60A5FA',
    path: 'M 60 300 L 240 300 L 240 400 L 60 400 Z',
  },
  {
    id: 'general-right',
    label: 'GEN_BETA',
    tier: 'GENERAL ACCESS',
    price: '69 USD',
    capacity: '180 / 300 SLOTS',
    status: 'AVAILABLE',
    color: '#3B82F6',
    hoverColor: '#60A5FA',
    path: 'M 320 300 L 500 300 L 500 400 L 320 400 Z',
  },
]

export function VenueMap() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const { playHoverSound, playClickSound } = useAudio()

  const activeZone = ZONES.find(z => z.id === (selectedZone || hoveredZone))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">map</span>
        <h2 className="font-display text-4xl text-white">VENUE_MAP</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* SVG Map */}
        <div className="border border-zinc-800 bg-black/60 p-4 relative">
          <svg
            viewBox="0 0 560 460"
            className="w-full h-auto"
            style={{ filter: 'drop-shadow(0 0 2px rgba(203,255,0,0.1))' }}
          >
            {/* Grid lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 40} x2="560" y2={i * 40} stroke="#1a1a1a" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="460" stroke="#1a1a1a" strokeWidth="0.5" />
            ))}

            {/* Stage */}
            <rect x="180" y="10" width="200" height="40" rx="2" fill="#FF4D4D" opacity="0.8" />
            <text x="280" y="35" textAnchor="middle" fill="black" fontFamily="monospace" fontSize="12" fontWeight="bold">
              ◈ MAIN STAGE ◈
            </text>

            {/* Zones */}
            {ZONES.map(zone => {
              const isActive = hoveredZone === zone.id || selectedZone === zone.id
              return (
                <g key={zone.id}>
                  <path
                    d={zone.path}
                    fill={isActive ? zone.hoverColor : zone.color}
                    opacity={isActive ? 0.5 : 0.15}
                    stroke={isActive ? zone.hoverColor : zone.color}
                    strokeWidth={isActive ? 2 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => { setHoveredZone(zone.id); playHoverSound() }}
                    onMouseLeave={() => setHoveredZone(null)}
                    onClick={() => { setSelectedZone(selectedZone === zone.id ? null : zone.id); playClickSound() }}
                    style={isActive ? { filter: `drop-shadow(0 0 8px ${zone.color}80)` } : {}}
                  />
                  <text
                    x={zone.path.includes('60 120') ? 115 : zone.path.includes('390') ? 445 : zone.path.includes('60 300') ? 150 : zone.path.includes('320 300') ? 410 : 280}
                    y={zone.path.includes('60') && zone.path.includes('100') ? 85 : zone.path.includes('120') ? 205 : 355}
                    textAnchor="middle"
                    fill={isActive ? 'white' : zone.color}
                    fontFamily="monospace"
                    fontSize="9"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                    opacity={isActive ? 1 : 0.7}
                  >
                    {zone.label}
                  </text>
                </g>
              )
            })}

            {/* Sound booth */}
            <rect x="240" y="180" width="80" height="50" rx="4" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4" />
            <text x="280" y="210" textAnchor="middle" fill="#555" fontFamily="monospace" fontSize="8">SOUND CTL</text>

            {/* Bar areas */}
            <rect x="60" y="425" width="120" height="25" rx="2" fill="#333" opacity="0.4" stroke="#555" strokeWidth="0.5" />
            <text x="120" y="442" textAnchor="middle" fill="#666" fontFamily="monospace" fontSize="8">BAR_A</text>
            <rect x="380" y="425" width="120" height="25" rx="2" fill="#333" opacity="0.4" stroke="#555" strokeWidth="0.5" />
            <text x="440" y="442" textAnchor="middle" fill="#666" fontFamily="monospace" fontSize="8">BAR_B</text>

            {/* Entrance */}
            <rect x="250" y="430" width="60" height="20" rx="2" fill="none" stroke="#CBFF00" strokeWidth="1" />
            <text x="280" y="444" textAnchor="middle" fill="#CBFF00" fontFamily="monospace" fontSize="7" fontWeight="bold">ENTRY</text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-zinc-800">
            {[
              { color: '#7C3AED', label: 'ELITE' },
              { color: '#CBFF00', label: 'VIP' },
              { color: '#3B82F6', label: 'GENERAL' },
              { color: '#FF4D4D', label: 'STAGE' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: l.color, opacity: 0.6 }} />
                <span className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Info Panel */}
        <div className="border border-zinc-800 bg-black/60 p-6 flex flex-col">
          {activeZone ? (
            <div className="animate-in fade-in duration-200 space-y-4">
              <div>
                <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest mb-1">ZONE_ID</p>
                <h3 className="font-display text-3xl" style={{ color: activeZone.color }}>{activeZone.label}</h3>
              </div>
              <div className="space-y-3 font-accent text-[10px] uppercase tracking-widest">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">TIER</span>
                  <span className="text-white">{activeZone.tier}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">PRICE</span>
                  <span className="text-white font-mono">{activeZone.price}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">CAPACITY</span>
                  <span className="text-white">{activeZone.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">STATUS</span>
                  <span className={activeZone.status === 'SELLING FAST' ? 'text-hot-coral animate-pulse font-bold' : 'text-primary font-bold'}>
                    {activeZone.status}
                  </span>
                </div>
              </div>
              {/* Capacity bar */}
              <div>
                <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest mb-2">FILL_RATE</p>
                <div className="w-full h-1.5 bg-zinc-900 border border-zinc-800">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      backgroundColor: activeZone.color,
                      width: `${parseInt(activeZone.capacity) / parseInt(activeZone.capacity.split('/')[1]) * 100}%`,
                      boxShadow: `0 0 8px ${activeZone.color}80`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-zinc-700 mb-3">touch_app</span>
              <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest">
                HOVER OR TAP A ZONE TO VIEW DETAILS
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
