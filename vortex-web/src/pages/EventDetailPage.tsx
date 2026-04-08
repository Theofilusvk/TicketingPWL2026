import { useParams, Link } from 'react-router-dom'
import { ShareButton } from '../components/ShareButton'
import { VenueMap } from '../components/VenueMap'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useStore } from '../lib/store'
import { AudioPreview } from '../components/AudioPreview'
import { ReviewSection } from '../components/ReviewSection'

const EVENTS_DATA: Record<string, {
  id: string; title: string; date: string; venue: string; location: string
  description: string; status: string; gradient: string
  lineup: { name: string; role: string; time: string; audioSrc?: string }[]
  schedule: { time: string; activity: string }[]
  faq: { q: string; a: string }[]
  gallery: { src: string; caption: string; aspect: 'tall' | 'wide' | 'square' }[]
}> = {
  'neon-chaos-2025': {
    id: 'neon-chaos-2025',
    title: 'NEON CHAOS',
    date: '2025-02-14',
    venue: 'THE FOUNDRY',
    location: 'Undisclosed Warehouse, Sector 7, Berlin',
    description: 'The most visceral underground audio-visual experience engineered for the digital native. 12 hours of non-stop techno, industrial bass, and immersive laser mapping across 3 stages.',
    status: 'TICKETS LIVE',
    gradient: 'from-[#CBFF00]/20 to-transparent',
    lineup: [
      { name: 'VOID_ZERO', role: 'HEADLINER // TECHNO', time: '02:00 - 04:00', audioSrc: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3' },
      { name: 'CYBER_WITCH', role: 'SUPPORT // ACID', time: '00:00 - 02:00', audioSrc: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Jahzzar/Tumbling_Dishes_Like_Old-Man_Wishes/Jahzzar_-_01_-_Siesta.mp3' },
      { name: 'GLITCH_KID', role: 'OPENER // BREAKS', time: '22:00 - 00:00' },
      { name: 'CYBER_KID', role: 'WARM UP // AMBIENT', time: '20:00 - 22:00' },
      { name: 'SIGNAL_DRIFT', role: 'CLOSING SET', time: '04:00 - 06:00' },
    ],
    schedule: [
      { time: '19:00', activity: 'GATES OPEN — BIOMETRIC SCAN' },
      { time: '20:00', activity: 'STAGE 1 — AMBIENT WARM UP' },
      { time: '22:00', activity: 'MAIN STAGE — AV PERFORMANCE' },
      { time: '00:00', activity: 'MAIN STAGE — INDUSTRIAL LIVE SET' },
      { time: '02:00', activity: 'MAIN STAGE — HEADLINER' },
      { time: '04:00', activity: 'CLOSING CEREMONY' },
      { time: '06:00', activity: 'EXTRACTION PROTOCOL' },
    ],
    faq: [
      { q: 'What should I bring?', a: 'Valid digital ID linked to your Vortex account. No physical IDs accepted. Bring earplugs — we hit 130dB.' },
      { q: 'Is there a dress code?', a: 'Dark aesthetics preferred. All-black, cyberwear, techwear. No sportswear or bright colors.' },
      { q: 'Can I leave and re-enter?', a: 'Single-entry protocol. Once you leave the perimeter, your access key expires.' },
      { q: 'Are refunds available?', a: 'No refunds in the underground. All transactions are final upon execution.' },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', caption: 'MAIN STAGE — LASER ARRAY ACTIVE', aspect: 'wide' },
      { src: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600', caption: 'CROWD SURGE — SECTOR A', aspect: 'tall' },
      { src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600', caption: 'NEON CORRIDOR — ENTRY GATE', aspect: 'square' },
      { src: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800', caption: 'DJ BOOTH — VOID_ZERO SET', aspect: 'wide' },
      { src: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600', caption: 'LIGHT MATRIX — STAGE 2', aspect: 'tall' },
      { src: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600', caption: 'UNDERGROUND PASSAGE', aspect: 'square' },
      { src: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', caption: 'AERIAL VIEW — FULL CAPACITY', aspect: 'wide' },
      { src: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=600', caption: 'SMOKE + STROBE', aspect: 'square' },
    ]
  },
  'static-pulse': {
    id: 'static-pulse',
    title: 'STATIC PULSE',
    date: '2025-03-01',
    venue: 'VOID STATION 4',
    location: 'Underground Complex, Tokyo District 9',
    description: 'A sensory deprivation experience fused with high-frequency audio manipulation. Limited to 200 attendees for maximum immersion. Prepare for the most intense 8-hour sonic journey ever engineered.',
    status: 'TICKETS LIVE',
    gradient: 'from-[#FF4D4D]/20 to-transparent',
    lineup: [
      { name: 'NEURAL_SYNC', role: 'HEADLINER // DARK TECHNO', time: '01:00 - 03:00', audioSrc: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3' },
      { name: 'PULSE_WAVE', role: 'LIVE SET // ACID', time: '23:00 - 01:00', audioSrc: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Monplaisir/Turbo_A/Monplaisir_-_01_-_Turbo_A.mp3' },
      { name: 'ECHO_CHAMBER', role: 'AV PERFORMANCE // DRONE', time: '21:00 - 23:00' },
      { name: 'ZERO_STATE', role: 'WARM UP // MINIMAL', time: '19:00 - 21:00' },
      { name: 'FREQ_DECAY', role: 'CLOSING // AMBIENT', time: '03:00 - 05:00' },
    ],
    schedule: [
      { time: '18:00', activity: 'GATES OPEN — NEURAL CALIBRATION' },
      { time: '19:00', activity: 'STAGE 1 — MINIMAL WARM UP' },
      { time: '21:00', activity: 'MAIN STAGE — DRONE AV PERFORMANCE' },
      { time: '23:00', activity: 'MAIN STAGE — ACID LIVE SET' },
      { time: '01:00', activity: 'MAIN STAGE — DARK TECHNO HEADLINER' },
      { time: '03:00', activity: 'CLOSING CEREMONY — AMBIENT DESCENT' },
      { time: '05:00', activity: 'EXTRACTION PROTOCOL' },
    ],
    faq: [
      { q: 'Why are tickets limited?', a: 'STATIC PULSE is a sensory deprivation experience. 200 is the maximum for full immersion. No exceptions.' },
      { q: 'What is the venue like?', a: 'An abandoned underground complex converted into an acoustic chamber. Complete darkness zones, isolation pods, and a 360° sound system.' },
      { q: 'Can I record?', a: 'All recording devices will be sealed at entry. This experience exists only in memory.' },
      { q: 'Is there a minimum age?', a: 'You must be 18+ with a valid neural-linked ID. No exceptions.' },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800', caption: 'VOID CHAMBER — SOUNDCHECK', aspect: 'wide' as const },
      { src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600', caption: 'LASER GRID — SECTOR B', aspect: 'tall' as const },
      { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600', caption: 'CROWD — NEURAL_SYNC SET', aspect: 'square' as const },
      { src: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800', caption: 'STROBE ARRAY — MAIN HALL', aspect: 'wide' as const },
      { src: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600', caption: 'ISOLATION PODS — ZONE C', aspect: 'tall' as const },
      { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600', caption: 'ENTRY TUNNEL — RED SECTOR', aspect: 'square' as const },
      { src: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800', caption: 'PULSE_WAVE — ACID LIVE', aspect: 'wide' as const },
      { src: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600', caption: 'SMOKE + BASS', aspect: 'square' as const },
    ]
  }
}

/* ─── Lightbox ─── */
function GalleryLightbox({ images, initialIndex, onClose }: {
  images: { src: string; caption: string }[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)

  const next = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length])
  const prev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, next, prev])

  const img = images[index]

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-5xl w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute -top-12 right-0 text-zinc-500 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>

        {/* Image */}
        <img src={img.src} alt={img.caption} className="w-full max-h-[75vh] object-contain" />

        {/* Caption */}
        <div className="mt-4 flex justify-between items-center">
          <p className="font-accent text-[9px] text-zinc-400 uppercase tracking-widest">{img.caption}</p>
          <p className="font-mono text-[10px] text-zinc-600">{index + 1} / {images.length}</p>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 flex items-center justify-center border border-zinc-700 bg-black/80 text-zinc-400 hover:text-primary hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 flex items-center justify-center border border-zinc-700 bg-black/80 text-zinc-400 hover:text-primary hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function EventDetailPage() {
  const { eventId } = useParams()
  const { events } = useStore()
  
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const event = useMemo(() => {
    const staticData = eventId ? EVENTS_DATA[eventId] : null
    const storeEvent = events.find(e => e.id === eventId)

    if (!storeEvent && !staticData) return null

    let lineup = staticData?.lineup || []
    if (storeEvent && storeEvent.lineup) {
      lineup = storeEvent.lineup.split(',').map(item => ({ name: item.trim(), role: 'SUPPORT', time: 'TBA' }))
    }

    let schedule = staticData?.schedule || []
    if (storeEvent && storeEvent.schedule) {
      schedule = storeEvent.schedule.split('\n').filter(Boolean).map(line => {
        const parts = line.split('-')
        return { time: parts[0]?.trim() || 'TBA', activity: parts[1]?.trim() || line.trim() }
      })
    }

    let faq = staticData?.faq || []
    if (storeEvent && storeEvent.faq) {
      const faqLines = storeEvent.faq.split('\n').filter(l => l.trim())
      const parsedFaqs = []
      for(let i = 0; i < faqLines.length; i+=2) {
        if (faqLines[i].startsWith('Q:')) {
          parsedFaqs.push({
            q: faqLines[i].replace('Q:', '').trim(),
            a: faqLines[i+1] ? faqLines[i+1].replace('A:', '').trim() : ''
          })
        }
      }
      if (parsedFaqs.length > 0) faq = parsedFaqs
    }

    return {
      id: (storeEvent?.id || staticData?.id) as string,
      title: (storeEvent?.name || staticData?.title) as string,
      date: (storeEvent?.date || staticData?.date) as string,
      venue: (storeEvent?.venue || staticData?.venue) as string,
      location: storeEvent?.location || staticData?.location || 'Undisclosed Location',
      description: storeEvent?.description || staticData?.description || 'No description available for this event.',
      status: storeEvent?.status === 'ACTIVE' ? (storeEvent.ticketsLeft > 0 ? 'TICKETS LIVE' : 'SOLD OUT') : (storeEvent?.status || staticData?.status),
      gradient: storeEvent?.colorClasses ? storeEvent.colorClasses.replace('border', 'from').replace('hover:from-white', '') + ' to-transparent' : staticData?.gradient || 'from-primary/20 to-transparent',
      lineup,
      schedule,
      faq,
      gallery: staticData?.gallery || [],
      ticketsLeft: storeEvent?.ticketsLeft,
      audioSrc: storeEvent?.audioSrc // preserve
    }
  }, [eventId, events])

  if (!event) {
    return (
      <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16 text-center">
        <h1 className="font-display text-6xl text-zinc-500 mb-4">EVENT_NOT_FOUND</h1>
        <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest mb-8">
          The specified event ID does not exist in our registry.
        </p>
        <Link to="/events" className="font-accent text-xs text-primary uppercase tracking-widest hover:underline">
          ← BACK TO EVENTS
        </Link>
      </main>
    )
  }

  const isLocked = event.status !== 'TICKETS LIVE'

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 mb-20 space-y-12">
      {/* Hero */}
      <section className="reveal relative border border-white/10 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} pointer-events-none`} />
        <div className="relative p-8 md:p-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <Link to="/events" className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest hover:text-primary transition-colors">
                  ← EVENTS
                </Link>
                <span className="text-zinc-700">/</span>
                <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest">{event.id}</span>
              </div>
              <h1 className="font-display text-7xl md:text-9xl leading-none text-white mb-4">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-6">
                <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest border border-zinc-800 px-3 py-1">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">calendar_month</span>
                  {event.date}
                </span>
                <span className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest border border-zinc-800 px-3 py-1">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">location_on</span>
                  {event.venue}
                </span>
                <span className={`font-accent text-[10px] uppercase tracking-widest px-3 py-1 font-bold ${
                  isLocked ? 'bg-zinc-800 text-zinc-400' : 'bg-primary text-black'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
          </div>
          <p className="font-accent text-xs text-zinc-400 uppercase tracking-widest leading-relaxed max-w-2xl mt-8 mb-8">
            {event.description}
          </p>
          <ShareButton title={event.title} />
          <div className="mt-8 flex flex-wrap gap-4">
            {!isLocked ? (
              <Link
                to={`/reserve/${event.id}`}
                className="inline-flex items-center gap-2 bg-primary text-black px-10 py-4 font-accent font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(203,255,0,0.2)]"
              >
                <span className="material-symbols-outlined text-sm">confirmation_number</span>
                GET ACCESS
              </Link>
            ) : (
              <button disabled className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-500 px-10 py-4 font-accent font-bold text-xs uppercase tracking-widest cursor-not-allowed">
                <span className="material-symbols-outlined text-sm">lock</span>
                LOCKED
              </button>
            )}
            
            {/* LIVE CHAT LINK */}
            <Link
              to={`/chat/${event.id}`}
              className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary hover:text-black px-8 py-4 font-accent font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(203,255,0,0.1)] hover:shadow-[0_0_25px_rgba(203,255,0,0.3)]"
            >
              <span className="material-symbols-outlined text-sm animate-pulse">chat</span>
              ENTER LIVE CHAT
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Lineup */}
        <section className="reveal space-y-6">
          <h2 className="font-display text-4xl text-primary border-b border-primary/30 pb-2 inline-block">LINEUP</h2>
          <div className="space-y-4">
            {event.lineup.map((artist, idx) => (
              <div key={idx} className="flex flex-col gap-3 p-4 border border-zinc-800 bg-black/40 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <span className="font-display text-3xl text-zinc-700 group-hover:text-primary transition-colors w-12">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl text-white group-hover:text-primary transition-colors">{artist.name}</h3>
                    <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">{artist.role}</p>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">{artist.time}</span>
                </div>
                {artist.audioSrc && (
                  <div className="pl-16">
                    <AudioPreview 
                      src={artist.audioSrc} 
                      title={`${artist.name} Preview`} 
                      artist={artist.role.split('//')[1]?.trim() || 'MIX'} 
                      color={event.id === 'static-pulse' ? '#FF4D4D' : '#CBFF00'}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section className="reveal space-y-6">
          <h2 className="font-display text-4xl text-hot-coral border-b border-hot-coral/30 pb-2 inline-block">SCHEDULE</h2>
          <div className="relative pl-6 border-l-2 border-zinc-800 space-y-6">
            {event.schedule.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 border-2 border-zinc-700 bg-zinc-900 rounded-full" />
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm text-hot-coral font-bold min-w-[50px]">{item.time}</span>
                  <span className="font-accent text-xs text-zinc-300 uppercase tracking-widest">{item.activity}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Venue Map */}
      {!isLocked && (
        <section className="reveal">
          <VenueMap />
        </section>
      )}

      {/* Gallery */}
      {event.gallery.length > 0 && (
        <section className="reveal space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-4xl text-white border-b border-white/20 pb-2 inline-block">GALLERY</h2>
            <span className="font-accent text-[9px] text-zinc-600 uppercase tracking-widest">{event.gallery.length} PHOTOS</span>
          </div>
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {event.gallery.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className="group relative cursor-pointer overflow-hidden border border-zinc-800 hover:border-primary/50 transition-all break-inside-avoid"
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  className={`w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ${
                    img.aspect === 'tall' ? 'h-72' : img.aspect === 'wide' ? 'h-44' : 'h-56'
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="font-accent text-[8px] text-primary uppercase tracking-widest">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={event.gallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* FAQ */}
      <section className="reveal space-y-6">
        <h2 className="font-display text-4xl text-white border-b border-white/20 pb-2 inline-block">FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {event.faq.map((item, idx) => (
            <div key={idx} className="border border-zinc-800 bg-black/40 p-6 hover:border-primary/30 transition-colors">
              <h3 className="font-accent text-xs text-primary uppercase tracking-widest font-bold mb-3">{item.q}</h3>
              <p className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="reveal border border-zinc-800 bg-black/40 p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
          <h2 className="font-display text-3xl text-white">LOCATION</h2>
        </div>
        <p className="font-accent text-xs text-zinc-400 uppercase tracking-widest mb-2">{event.location}</p>
        <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest">
          EXACT COORDINATES WILL BE TRANSMITTED VIA ENCRYPTED CHANNEL 2 HOURS BEFORE THE EVENT.
        </p>
      </section>

      {/* Reviews */}
      {event.id && <ReviewSection eventId={event.id} />}
    </main>
  )
}
