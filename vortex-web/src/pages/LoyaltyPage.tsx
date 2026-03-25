import { useState } from 'react'
import { useStore } from '../lib/store'

const TIERS = [
  {
    id: 'PHANTOM',
    name: 'Phantom',
    min: 0,
    max: 999,
    color: 'border-zinc-500 shadow-[0_0_15px_rgba(161,161,170,0.3)]',
    bg: 'bg-zinc-900',
    text: 'text-zinc-400',
    icon: '👤',
    tagline: 'Bayangan yang baru melangkah masuk ke kerajaan',
    benefits: [
      'Akses event dasar',
      'CS reguler',
      'Newsletter mingguan'
    ]
  },
  {
    id: 'SQUIRE',
    name: 'Squire',
    min: 1000,
    max: 4999,
    color: 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    bg: 'bg-blue-950',
    text: 'text-blue-400',
    icon: '🛡️',
    tagline: 'Kesatria muda yang tengah membuktikan diri',
    benefits: [
      'Diskon tiket 5%',
      'CS prioritas level 1',
      'Early bird akses',
      'Sticker eksklusif'
    ]
  },
  {
    id: 'KNIGHT',
    name: 'Knight',
    min: 5000,
    max: 14999,
    color: 'border-[#CBFF00] shadow-[0_0_20px_rgba(203,255,0,0.4)]',
    bg: 'bg-[#CBFF00]/10',
    text: 'text-[#CBFF00]',
    icon: '⚔️',
    tagline: 'Pelindung kerajaan yang telah menunjukkan loyalitas',
    benefits: [
      'Diskon tiket 15%',
      'CS prioritas level 2',
      'Merchandise eksklusif',
      'Akses pre-sale',
      'Badge profil khusus'
    ]
  },
  {
    id: 'LORD',
    name: 'Lord',
    min: 15000,
    max: 49999,
    color: 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    bg: 'bg-amber-950',
    text: 'text-amber-400',
    icon: '👑',
    tagline: 'Bangsawan berpengaruh di jajaran kerajaan',
    benefits: [
      'Diskon tiket 25%',
      'CS prioritas level 3',
      'Merchandise premium',
      'Kursi VIP event',
      'Undangan event eksklusif',
      'Nama di Hall of Fame'
    ]
  },
  {
    id: 'SOVEREIGN',
    name: 'Sovereign',
    min: 50000,
    max: null,
    color: 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]',
    bg: 'bg-purple-950',
    text: 'text-purple-400',
    icon: '🔱',
    tagline: 'Raja sejati — penguasa tertinggi kerajaan',
    benefits: [
      'Diskon tiket 40%',
      'CS prioritas langsung (dedicated)',
      'Merchandise limited edition',
      'Akses backstage',
      'Co-branding / spotlight',
      'Konsultasi pribadi tim',
      'Early access semua fitur baru'
    ]
  }
]

export function LoyaltyPage() {
  const { credits, tier } = useStore()
  
  // Find current tier objective logic
  const currentTierIndex = TIERS.findIndex(t => t.id === tier)
  const isMaxTier = currentTierIndex === TIERS.length - 1
  const currentTierData = TIERS[currentTierIndex] || TIERS[0]
  const nextTierData = isMaxTier ? currentTierData : TIERS[currentTierIndex + 1]
  
  const creditsNeeded = isMaxTier ? 0 : nextTierData.min - credits
  const progressPercent = isMaxTier ? 100 : Math.min(100, Math.max(0, (credits / nextTierData.min) * 100))

  const [activeViewTier, setActiveViewTier] = useState<string>(tier)

  const viewData = TIERS.find(t => t.id === activeViewTier) || TIERS[0]

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 md:py-16 mb-20 flex flex-col gap-12">
      
      {/* HEADER SECTION */}
      <section className="reveal text-center max-w-2xl mx-auto">
        <h1 className="distort-title font-display text-6xl md:text-8xl text-white mb-4 leading-none">
          VORTEX_LOYALTY
        </h1>
        <p className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">
          Sistem tier dirancang untuk web event kerajaan. Setiap tier mencerminkan tingkatan status dalam hierarki — dari bayangan tak dikenal hingga penguasa tertinggi.
        </p>
      </section>

      {/* PROGRESS TRACKER */}
      <section className="reveal glass-card p-6 md:p-10 border-2 border-white/10 max-w-4xl mx-auto w-full relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
           <div>
             <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">CURRENT_STATUS</span>
             <div className="flex items-baseline gap-4">
               <h2 className={`font-display text-5xl leading-none ${currentTierData.text}`}>{currentTierData.name}</h2>
               <span className="font-mono text-white text-xl">{credits.toLocaleString()} CRD</span>
             </div>
           </div>
           
           {!isMaxTier && (
             <div className="text-left md:text-right">
               <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">NEXT_RANK: {nextTierData.name}</span>
               <p className="font-mono text-primary text-sm font-bold">{creditsNeeded.toLocaleString()} CRD REQUIRED</p>
             </div>
           )}
           {isMaxTier && (
             <div className="text-left md:text-right">
               <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">MAXIMUM_RANK_ACHIEVED</span>
               <p className="font-mono text-purple-400 text-sm font-bold">SOVEREIGN PROTOCOL ACTIVE</p>
             </div>
           )}
         </div>

         <div className="w-full h-4 bg-zinc-900 border border-zinc-700 relative overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-1000 ease-out`}
              style={{ width: `${progressPercent}%` }} 
            />
            {/* Markers */}
            <div className="absolute inset-0 flex justify-between px-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-[1px] h-full bg-black/20" />
              ))}
            </div>
         </div>
         <div className="flex justify-between mt-2 font-accent text-[8px] tracking-widest text-zinc-500">
           <span>{currentTierData.min.toLocaleString()} CRD</span>
           <span>{!isMaxTier ? nextTierData.min.toLocaleString() + ' CRD' : 'MAX'}</span>
         </div>
      </section>

      {/* HORIZONTAL CAROUSEL OF TIER CARDS */}
      <section className="reveal">
        <div className="flex items-center justify-between mb-6 border-b border-primary/20 pb-2">
          <h2 className="font-display text-4xl text-white">TIER_ARCHIVE</h2>
          <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">SELECT TO VIEW BENEFITS</span>
        </div>
        
        {/* Scrollable Container */}
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar">
           {TIERS.map((t) => (
             <div 
               key={t.id}
               onClick={() => setActiveViewTier(t.id)}
               className={`snap-center shrink-0 w-[280px] h-[160px] md:w-[340px] md:h-[200px] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-6 ${t.color} ${t.id === activeViewTier ? 'scale-105 z-10' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}
               style={{ backgroundColor: t.id === activeViewTier ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }}
             >
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                
                <div className="flex justify-between items-start z-10 relative">
                  <span className="text-3xl">{t.icon}</span>
                  {tier === t.id && (
                    <span className="bg-white text-black font-accent text-[8px] font-bold px-2 py-1 uppercase tracking-widest rounded-full">
                      CURRENT
                    </span>
                  )}
                </div>
                
                <div className="z-10 relative">
                  <p className="font-accent text-[8px] text-zinc-400 uppercase tracking-widest mb-1">VORTEX_ID // {t.id}</p>
                  <h3 className={`font-display text-3xl md:text-4xl leading-none ${t.text}`}>{t.name}</h3>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* DYNAMIC BENEFITS VIEWER */}
      <section className="reveal grid grid-cols-1 lg:grid-cols-12 gap-12 bg-black/40 border border-white/10 p-6 md:p-10">
         <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
            <span className="text-6xl mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{viewData.icon}</span>
            <h2 className={`font-display text-6xl md:text-7xl mb-4 ${viewData.text}`}>{viewData.name}</h2>
            <p className="font-accent text-xs tracking-widest uppercase text-white leading-relaxed italic border-l-4 border-white/20 pl-4 mb-6">
              "{viewData.tagline}"
            </p>
            <div className="bg-black border border-white/10 p-4 font-mono text-sm text-zinc-500">
               MIN_CREDITS_REQUIRED: <span className="text-white">{viewData.min.toLocaleString()}</span>
            </div>
         </div>
         
         <div className="lg:col-span-7 flex flex-col justify-center">
            <h3 className="font-display text-3xl text-white mb-8 border-b border-primary/20 pb-2 inline-block">
              GRANTED_PRIVILEGES
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {viewData.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 p-4 hover:border-white/30 transition-colors">
                  <span className={`material-symbols-outlined text-sm mt-0.5 ${viewData.text}`}>check_circle</span>
                  <span className="font-accent text-[10px] text-zinc-300 uppercase tracking-widest leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
         </div>
      </section>

    </main>
  )
}
