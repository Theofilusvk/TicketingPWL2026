import React, { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'

type OrganizerEvent = {
  event_organizer_id: number
  event_id: number
  event_title: string
  event_start_time: string
  event_end_time: string
  organizer_access_until: string
  referral_code: string
  notes: string | null
  hasAccess: boolean
  eventEnded: boolean
  minutesUntilEnd: number
}

type GlobalEventData = {
  id: string
  name: string
  date: string
  venue: string
  image: string
}

export function OrganizerEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [allEvents, setAllEvents] = useState<GlobalEventData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('vortex.auth.token')
      const res = await fetch('/api/organizer/events', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const json = await res.json()
        setEvents(json)
      }
    } catch (err) {
      console.error('Failed to fetch organizer events', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setAllEvents(json.data.map((e: any) => ({
            id: String(e.event_id),
            name: e.title,
            date: e.start_time.split(' ')[0],
            venue: e.location,
            image: e.banner_url || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80'
          })))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchAllEvents()
  }, [])

  const handleEnroll = async (eventId: string) => {
    if (isEnrolling) return
    setIsEnrolling(true)
    try {
      const token = localStorage.getItem('vortex.auth.token')
      const res = await fetch('/api/organizer/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ event_id: eventId })
      })
      
      const payload = await res.json()
      if (res.ok) {
        await fetchEvents()
        setShowEnrollModal(false)
      } else {
        alert(payload.message || 'Failed to enroll to event.')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setIsEnrolling(false)
    }
  }

  // Filter out events the organizer is already enrolled in
  const availableEvents = allEvents.filter(
    ae => !events.some(oe => String(oe.event_id) === ae.id)
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">My Assigned Events</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5 flex items-center gap-2">
            View and manage events you have been granted access to.
            {isLoading && <span className="text-indigo-400 animate-pulse">(Connecting to live data...)</span>}
          </p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:text-white hover:border-indigo-500/40 font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] active:scale-95 flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500">how_to_reg</span>
          Enroll Event
        </button>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative min-h-[400px]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <span className="material-symbols-outlined text-4xl text-white/20 animate-spin mb-3 duration-1000">hourglass_top</span>
            <p className="text-white/40 text-sm">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-white/10 mb-4 block">event_busy</span>
            <h3 className="text-xl font-medium text-white/70 mb-2">No Events Assigned</h3>
            <p className="text-sm text-white/40 max-w-md">
              You haven't been assigned to manage any events yet. Click "Enroll Event" to assign yourself to an ongoing event.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Event Name</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Event Schedule</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Access Until</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Scanner Access</th>
                  <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap text-right">Referral Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {events.map((evt) => (
                  <tr key={evt.event_organizer_id} className="hover:bg-white/[0.03] transition-colors duration-300">
                    <td className="p-5">
                      <p className="font-semibold text-sm text-white/90">{evt.event_title}</p>
                      {evt.notes && <p className="text-xs text-white/40 mt-1 max-w-xs truncate">{evt.notes}</p>}
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-medium text-white/70 font-mono">
                        {evt.event_start_time.split(' ')[0]} 
                      </p>
                      <p className="text-xs text-white/30 font-mono">
                        {evt.event_start_time.split(' ')[1]} - {evt.event_end_time.split(' ')[1]}
                      </p>
                    </td>
                    <td className="p-5 text-sm font-medium text-white/60 font-mono">
                      {evt.organizer_access_until || 'Not Specified'}
                    </td>
                    <td className="p-5">
                      {evt.hasAccess ? (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm bg-rose-500/10 text-rose-300 border-rose-500/20">
                          EXPIRED
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right flex flex-col items-end">
                      <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex items-center justify-center gap-2">
                         <span className="font-mono text-sm tracking-widest text-indigo-300 font-bold">{evt.referral_code}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 md:p-8 pb-4 border-b border-white/[0.05] flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Available Events</h2>
                <p className="text-sm text-white/40 mt-1">Select an event below to enroll as an organizer.</p>
              </div>
              <button onClick={() => setShowEnrollModal(false)} className="text-white/40 hover:text-white p-2 transition-colors rounded-full hover:bg-white/5">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Event List */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-3">
              {availableEvents.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-4xl text-white/10 mb-3">event_available</span>
                  <p className="text-white/40">There are no more active events to enroll into.</p>
                </div>
              ) : (
                availableEvents.map(evt => (
                  <div key={evt.id} className="bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-300 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center group">
                    <img src={evt.image} alt={evt.name} className="w-16 h-16 rounded-xl object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-white font-semibold">{evt.name}</h4>
                      <p className="text-xs text-white/40 font-mono mt-1">{evt.date.replace(/_/g, '-')} &bull; {evt.venue}</p>
                    </div>
                    <button
                      onClick={() => handleEnroll(evt.id)}
                      disabled={isEnrolling}
                      className="whitespace-nowrap px-5 py-2.5 bg-white text-black hover:bg-indigo-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
