import { useState } from 'react'

export function NewsPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'URGENCY'>('NEWEST')

  const filters = [
    { icon: 'album', label: 'LINEUP' },
    { icon: 'security', label: 'SECURITY' },
    { icon: 'shopping_cart', label: 'DROPS' },
    { icon: 'terminal', label: 'SYSTEM' },
  ] as const

  const dummyNews = [
    {
      date: '2026-03-17 | 22:45:01',
      tag: 'SECURITY',
      title: 'SECURITY PROTOCOL UPDATE',
      desc: 'Biometric verification required for all upcoming events. Ensure your digital identity is linked to your Vortex account before arrival. No exceptions at the gate.',
      urgency: 'HIGH'
    },
    {
      date: '2026-03-16 | 18:30:22',
      tag: 'LINEUP',
      title: 'NEON CHAOS HEADLINERS REVEALED',
      desc: 'The underground whisper is true. Special B2B set featuring @VOID_ZERO and @X_REBEL confirmed for the central warehouse stage. Prepare your auditory sensors.',
      urgency: 'NORMAL'
    },
    {
      date: '2026-03-15 | 12:00:00',
      tag: 'DROPS',
      title: 'MERCH DROP WINDOW',
      desc: 'Limited stock of Chrome Rave physical artifacts detected. The store unlocks in T-minus 2 hours. Have your credits ready, this will sell out.',
      urgency: 'HIGH'
    },
    {
      date: '2026-03-14 | 04:12:44',
      tag: 'SYSTEM',
      title: 'SIGNAL INTERFERENCE DETECTED',
      desc: 'Archive nodes are currently resyncing due to an unexpected frequency surge. Expect minor latency when accessing ticket QR codes. Standby for resolution protocol.',
      urgency: 'NORMAL'
    },
    {
      date: '2026-03-12 | 20:00:00',
      tag: 'LINEUP',
      title: 'STAGE 2 ADDITIONS',
      desc: 'Audio/Visual synthesis engineered by @GLITCH_MOMENT joining the Chrome Rave roster. Expect heavy strobe lighting and volumetric lasers.',
      urgency: 'NORMAL'
    },
    {
      date: '2026-03-10 | 09:15:33',
      tag: 'SYSTEM',
      title: 'PROTOCOL V2 DEPLOYED',
      desc: 'User interface augmented. Navigation systems upgraded. The collective is stronger. Report any anomalies to the system administrator.',
      urgency: 'NORMAL'
    }
  ]

  const toggleFilter = (label: string) => {
    setActiveFilters(prev => 
      prev.includes(label) 
        ? prev.filter(f => f !== label)
        : [...prev, label]
    )
  }

  const filteredNews = (activeFilters.length === 0 
    ? dummyNews 
    : dummyNews.filter(news => activeFilters.includes(news.tag))
  ).filter(news => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return news.title.toLowerCase().includes(q) || news.desc.toLowerCase().includes(q)
  }).sort((a, b) => {
    if (sortBy === 'URGENCY') return a.urgency === 'HIGH' ? -1 : b.urgency === 'HIGH' ? 1 : 0
    if (sortBy === 'OLDEST') return a.date.localeCompare(b.date)
    return b.date.localeCompare(a.date)
  })

  return (
    <main className="max-w-[1400px] mx-auto w-full">
      <div className="reveal mb-12 border-l-4 border-secondary pl-6">
        <h1 className="font-display text-7xl md:text-9xl leading-none italic">
          NEWS_ARCHIVE
        </h1>
        <p className="font-accent text-[10px] text-secondary tracking-widest uppercase mt-4">
          / SYSTEM_STATUS: <span className="bg-secondary text-black px-2 py-0.5 rounded font-bold">OPERATIONAL</span>
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="reveal flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH_ARCHIVE..."
            className="w-full bg-black/60 border border-zinc-800 pl-10 pr-4 py-3 font-accent text-xs text-white uppercase tracking-widest focus:border-primary focus:ring-0 outline-none transition-colors placeholder:text-zinc-600"
          />
        </div>
        <div className="flex gap-2">
          {(['NEWEST', 'OLDEST', 'URGENCY'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-4 py-3 font-accent text-[10px] uppercase tracking-widest transition-all ${
                sortBy === s
                  ? 'bg-primary text-black font-bold'
                  : 'border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-3 space-y-10">
          <div>
            <h2 className="font-display text-4xl text-primary mb-6 border-b border-primary/30 inline-block pb-1">
              CATEGORY_FILTER
            </h2>
            <div className="flex flex-col gap-3 font-accent text-xs tracking-widest uppercase">
              {filters.map((f) => {
                const isActive = activeFilters.includes(f.label)
                return (
                  <button
                    key={f.label}
                    onClick={() => toggleFilter(f.label)}
                    className={[
                      'flex items-center gap-4 p-4 transition-all rounded-full',
                      isActive
                        ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(203,255,0,0.3)] hover:-translate-y-1'
                        : 'border border-primary text-primary hover:bg-primary/10',
                    ].join(' ')}
                  >
                    <span className="material-symbols-outlined text-sm">{f.icon}</span>
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="glass-card p-6 border-t-2 border-secondary shadow-[0_0_20px_rgba(255,77,77,0.15)]">
            <h3 className="font-display text-4xl text-secondary mb-4 italic">STAY_ALERT</h3>
            <p className="font-accent text-[10px] text-zinc-400 mb-6 leading-relaxed uppercase tracking-widest">
              RECEIVE DIRECT NEURAL PINGS FOR EMERGENCY PROTOCOLS AND EXCLUSIVE DROPS.
            </p>
            <input
              className="w-full bg-transparent border-b border-secondary/50 p-3 text-secondary font-accent text-xs mb-6 focus:border-secondary focus:ring-0 outline-none placeholder:text-secondary/30 transition-colors"
              placeholder="USER@VORTEX.SYS"
              type="email"
            />
            <button className="w-full bg-secondary text-dark-base rounded-full font-accent font-bold text-xs py-3 hover:scale-105 active:scale-95 transition-transform duration-200 shadow-[0_0_15px_rgba(255,77,77,0.3)] tracking-widest uppercase">
              SUBSCRIBE
            </button>
          </div>
        </aside>

        <section className="reveal lg:col-span-6 space-y-10">
          {filteredNews.length > 0 ? (
            filteredNews.map((news, idx) => (
              <article
                key={idx}
                className="group relative glass-card p-6 hover-lift transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="font-accent text-[10px] text-zinc-500 tracking-widest">/ {news.date}</span>
                  <div className="flex gap-2">
                    <span
                      className={[
                        'font-accent font-bold px-3 py-1 text-[8px] tracking-widest rounded-full uppercase',
                        news.urgency === 'HIGH' ? 'bg-secondary text-black drop-shadow-[0_0_5px_#FF4D4D]' : 'bg-primary text-black drop-shadow-[0_0_5px_#CBFF00]',
                      ].join(' ')}
                    >
                      {news.urgency === 'HIGH' ? 'URGENT' : 'UPDATE'}
                    </span>
                    <span className="font-accent font-bold px-3 py-1 text-[8px] tracking-widest rounded-full uppercase border border-zinc-500 text-zinc-500">
                      {news.tag}
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-5xl text-white tracking-tight group-hover:text-primary transition-colors">
                  {news.title}
                </h3>
                <p className="mt-3 font-accent text-[10px] text-zinc-400 leading-relaxed uppercase tracking-widest">{news.desc}</p>
              </article>
            ))
          ) : (
            <div className="glass-card p-12 text-center border border-zinc-800">
               <span className="material-symbols-outlined text-4xl text-zinc-600 mb-4 block">search_off</span>
               <h3 className="font-display text-3xl text-zinc-500 mb-2">NO RECORDS_FOUND</h3>
               <p className="font-accent text-[10px] text-zinc-600 tracking-widest uppercase">
                 Try adjusting your category filters.
               </p>
            </div>
          )}
        </section>

        <aside className="reveal lg:col-span-3 space-y-8">
          <div className="glass-card p-6 border-b-2 border-primary">
            <h2 className="font-display text-4xl mb-6 text-white px-2 py-1 bg-primary/20 inline-block">
              NEWS_FEED
            </h2>
            <div className="space-y-6">
              {[
                ['Jan 15, 2025', 'URGENT', 'SECURITY PROTOCOL UPDATE'],
                ['Jan 12, 2025', 'NEW_DROP', 'NEON CHAOS LINEUP LEAKED'],
                ['Jan 08, 2025', 'UPDATE', 'STATION 4 RENOVATION'],
              ].map(([date, badge, headline]) => (
                <div key={headline}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">/ {date}</span>
                    <span
                      className={[
                        'font-accent text-[8px] px-2 py-0.5 font-bold tracking-widest rounded-full',
                        badge === 'URGENT' ? 'border border-secondary text-secondary' : 'border border-primary text-primary',
                      ].join(' ')}
                    >
                      {badge}
                    </span>
                  </div>
                  <h4 className="font-display text-3xl leading-tight mb-1 hover:text-primary transition-colors">
                    {headline}
                  </h4>
                  <p className="font-accent text-[8px] tracking-widest uppercase text-zinc-500 leading-relaxed mt-2">
                    Protocol note injected into the archive stream.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

