import { useState, useRef, useEffect } from 'react'
import { useStore, type EventData, EVENT_CATEGORIES, type EventCategory } from '../../lib/store'

const PREDEFINED_VENUES = ['THE_FOUNDRY', 'SKY_GARDEN', 'VOID_STATION_4', 'NEON_DISTRICT']

export function AdminEventsPage() {
  const { events, deleteEvent, addEvent } = useStore()
  const [showModal, setShowModal] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapInputRef = useRef<HTMLInputElement>(null)
  
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isDraggingBanner, setIsDraggingBanner] = useState(false)
  
  const [isDraggingMap, setIsDraggingMap] = useState(false)
  const [isMapScanning, setIsMapScanning] = useState(false)
  const [mapScanProgress, setMapScanProgress] = useState(0)
  const [mapScanDone, setMapScanDone] = useState(false)

  const [newEvent, setNewEvent] = useState<Partial<EventData>>({
    name: '',
    date: '',
    categories: ['Musik'],
    status: 'ACTIVE',
    ticketsLeft: 500,
    capacity: 500,
    venue: PREDEFINED_VENUES[0],
    price: 1500,
    image: '',
    description: '',
    lineup: '',
    schedule: '',
    faq: ''
  })

  // ---- AI Map Parsing Simulation ----
  useEffect(() => {
    let timer: any;
    if (isMapScanning) {
      timer = setInterval(() => {
        setMapScanProgress(p => {
          if (p >= 100) {
            clearInterval(timer)
            setIsMapScanning(false)
            setMapScanDone(true)
            return 100
          }
          return p + Math.floor(Math.random() * 15 + 5)
        })
      }, 300)
    }
    return () => clearInterval(timer)
  }, [isMapScanning])

  const handleMapUpload = (file: File) => {
    setIsDraggingMap(false)
    if (!file) return
    setIsMapScanning(true)
    setMapScanProgress(0)
    setMapScanDone(false)
  }

  // ---- Banner Upload ----
  const handleBannerUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setBannerPreview(result)
      setNewEvent(prev => ({ ...prev, image: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEvent.name || !newEvent.date) return
    
    addEvent({
      ...newEvent as EventData,
      id: newEvent.name!.toLowerCase().replace(/[\s_]+/g, '-'),
    })
    
    setShowModal(false)
    setBannerPreview(null)
    setMapScanDone(false)
    setMapScanProgress(0)
    setNewEvent({
      name: '', date: '', categories: ['Musik'], status: 'ACTIVE',
      ticketsLeft: 500, capacity: 500, venue: PREDEFINED_VENUES[0], price: 1500,
      image: '', description: '', lineup: '', schedule: '', faq: ''
    })
  }

  const toggleCategory = (cat: EventCategory) => {
    setNewEvent(prev => {
      const cats = prev.categories || []
      const isSelected = cats.includes(cat)
      if (isSelected && cats.length === 1) return prev // Must have at least 1
      return {
        ...prev,
        categories: isSelected ? cats.filter(c => c !== cat) : [...cats, cat]
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Event Management</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Add, edit, and monitor global events (Detailed Version)</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
          New Event
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">ID / Name</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Kategori</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Venue & Date</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Capacity</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-white/[0.03] transition-colors duration-300 group">
                <td className="p-5">
                   <div className="font-semibold text-sm text-white/90">{event.name}</div>
                   <div className="font-mono text-[10px] text-white/40 tracking-wider">#{event.id.split('-')[0].toUpperCase()}</div>
                </td>
                <td className="p-5">
                  <div className="flex flex-wrap gap-1">
                    {event.categories && event.categories.length > 0 ? event.categories.map((cat, i) => (
                       <span key={i} className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md bg-white/5 text-white/60 border-white/10">{cat}</span>
                    )) : <span className="text-zinc-500 font-mono text-xs">N/A</span>}
                  </div>
                </td>
                <td className="p-5">
                   <div className="text-sm font-medium text-white/80">{event.venue}</div>
                   <div className="text-xs text-white/50">{event.date}</div>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-3 max-w-[150px]">
                    <div className="flex-1 h-1.5 bg-white/10 border border-white/5 rounded-full relative overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${event.ticketsLeft > 0 ? 'bg-indigo-400' : 'bg-rose-500'}`}
                        style={{ width: `${Math.max(5, Math.min(100, (event.ticketsLeft / event.capacity) * 100))}%` }} 
                      />
                    </div>
                    <span className="font-mono text-xs font-medium text-white/60">{event.ticketsLeft}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm ${
                    event.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]' :
                    event.status === 'DRAFT' ? 'bg-white/5 text-white/50 border-white/10' :
                    'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(251,113,133,0.1)]'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-zinc-500 hover:text-white p-1.5 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => deleteEvent(event.id)} className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-500">
          <div className="bg-[#050505] border border-white/[0.15] rounded-[32px] w-full max-w-4xl p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 ease-out relative overflow-hidden max-h-[90vh] overflow-y-auto flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-white tracking-tight drop-shadow-sm flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">dynamic_form</span>
               Initialize Event Detail
            </h2>

            <form onSubmit={handleAdd} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-5">
                   <h3 className="font-accent text-[10px] text-primary uppercase tracking-widest border-b border-primary/20 pb-2 mb-4">Core Settings</h3>
                   
                   <div className="space-y-2">
                     <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Event Name</label>
                     <input type="text" required value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-all duration-300" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Date</label>
                       <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white [color-scheme:dark] focus:outline-none focus:border-white/30" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Base Price (CRD)</label>
                        <input type="number" required value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: Number(e.target.value)})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Categories (Multiple)</label>
                     <div className="flex flex-wrap gap-2">
                        {EVENT_CATEGORIES.map(cat => {
                           const isSelected = newEvent.categories?.includes(cat);
                           return (
                             <div 
                               key={cat} onClick={() => toggleCategory(cat)}
                               className={`px-3 py-1 cursor-pointer rounded-full text-xs font-semibold border transition-all ${isSelected ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                             >
                               {cat}
                             </div>
                           )
                        })}
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Description</label>
                     <textarea rows={3} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="Extensive event lore or description..."></textarea>
                   </div>
                </div>

                {/* Right Column: Venue & Map */}
                <div className="space-y-5">
                   <h3 className="font-accent text-[10px] text-primary uppercase tracking-widest border-b border-primary/20 pb-2 mb-4">Venue & Capacity</h3>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Venue Location</label>
                       <select value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 [color-scheme:dark] appearance-none cursor-pointer">
                         {PREDEFINED_VENUES.map(v => <option key={v} value={v} className="bg-zinc-900 text-white">{v}</option>)}
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Max Capacity</label>
                       <input type="number" min="1" value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: Number(e.target.value), ticketsLeft: Number(e.target.value)})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1 flex justify-between">
                        <span>AI Venue Map Scanner</span>
                        {mapScanDone && <span className="text-emerald-400 font-bold">READY</span>}
                     </label>
                     <div
                        onDrop={(e) => { e.preventDefault(); handleMapUpload(e.dataTransfer.files[0]) }}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingMap(true) }}
                        onDragLeave={() => setIsDraggingMap(false)}
                        onClick={() => mapInputRef.current?.click()}
                        className={`relative w-full h-32 rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center cursor-pointer ${
                          isMapScanning ? 'border-primary/50 shadow-[0_0_20px_rgba(203,255,0,0.2)]' :
                          isDraggingMap ? 'border-primary bg-primary/10' :
                          mapScanDone ? 'border-emerald-500 bg-emerald-500/10' :
                          'border-dashed border-white/[0.15] bg-white/[0.03] hover:border-white/30'
                        }`}
                     >
                        <input ref={mapInputRef} type="file" accept="image/*,.pdf,.xls" className="hidden" onChange={e => { if(e.target.files) handleMapUpload(e.target.files[0]) }} />
                        
                        {isMapScanning ? (
                           <div className="w-full px-8 text-center">
                              <span className="material-symbols-outlined text-primary text-3xl animate-spin mb-2">radar</span>
                              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-2">
                                 <div className="h-full bg-primary transition-all duration-300" style={{ width: `${mapScanProgress}%` }} />
                              </div>
                              <p className="text-[10px] text-primary mt-2 font-mono tracking-widest">ANALYZING BLUEPRINT... {mapScanProgress}%</p>
                           </div>
                        ) : mapScanDone ? (
                           <div className="text-center">
                              <span className="material-symbols-outlined text-emerald-400 text-3xl mb-1">map</span>
                              <p className="text-xs text-emerald-400 font-bold">MAP SYNTHESIZED</p>
                              <p className="text-[9px] text-emerald-400/60 font-mono tracking-widest">Zones Extracted & Linked</p>
                           </div>
                        ) : (
                           <div className="text-center opacity-50 flex flex-col items-center">
                              <span className="material-symbols-outlined text-2xl mb-1">find_in_page</span>
                              <p className="text-[10px] uppercase font-bold tracking-widest">Drop PDF/Excel Blueprint</p>
                           </div>
                        )}
                     </div>
                   </div>

                   {/* Banner Upload */}
                   <div className="space-y-2">
                     <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Promotional Banner</label>
                     <div
                        onDrop={(e) => { e.preventDefault(); handleBannerUpload(e.dataTransfer.files[0]) }}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingBanner(true) }}
                        onDragLeave={() => setIsDraggingBanner(false)}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full h-24 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden ${
                          isDraggingBanner ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/[0.15] bg-white/[0.03] hover:border-white/30'
                        }`}
                     >
                       <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if(e.target.files?.[0]) handleBannerUpload(e.target.files[0]) }} />
                       {bannerPreview ? (
                         <div className="absolute inset-0">
                           <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                             <span className="text-xs font-semibold">Change Art</span>
                           </div>
                         </div>
                       ) : (
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="material-symbols-outlined text-xl text-white/30">add_photo_alternate</span>
                           <span className="text-[10px] text-white/40 font-semibold uppercase mt-1">Select Image</span>
                         </div>
                       )}
                     </div>
                   </div>

                </div>
              </div>

              {/* Expansion Details (Optional) */}
              <div className="pt-4 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Schedule (Text)</label>
                       <textarea rows={2} value={newEvent.schedule} onChange={e => setNewEvent({...newEvent, schedule: e.target.value})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="19:00 - Doors Open..."></textarea>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Lineup (Comma list)</label>
                       <input type="text" value={newEvent.lineup} onChange={e => setNewEvent({...newEvent, lineup: e.target.value})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="DJ Void, Neon Proxy, Cyphr" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">FAQ (Optional)</label>
                       <textarea rows={2} value={newEvent.faq} onChange={e => setNewEvent({...newEvent, faq: e.target.value})} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" placeholder="Q: Security? A: Biometric scanners installed."></textarea>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setShowModal(false); setBannerPreview(null) }} className="w-1/3 px-4 py-3.5 rounded-2xl border border-white/[0.1] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] transition-all duration-300">Abort</button>
                <button type="submit" className="w-2/3 px-4 py-3.5 rounded-2xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 shadow-[0_0_20px_rgba(203,255,0,0.4)] transition-all duration-300 active:scale-95">Complete Deployment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
