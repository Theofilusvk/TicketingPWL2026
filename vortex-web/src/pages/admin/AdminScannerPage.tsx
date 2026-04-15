import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuth } from '../../lib/auth'
import { useStore, type Ticket } from '../../lib/store'
import { useAudio } from '../../lib/audio'

interface OrganizerEvent {
  event_organizer_id: number
  event_id: number
  event_title: string
  event_start_time: string
  event_end_time: string
  organizer_access_until: string | null
  access_deadline: string
  referral_code: string
  notes?: string
  hasAccess: boolean
  eventEnded: boolean
  minutesUntilEnd: number
}

export function AdminScannerPage() {
  const { user } = useAuth()
  const { ownedTickets } = useStore()
  const { playHoverSound, playClickSound } = useAudio()
  
  const [ticketInput, setTicketInput] = useState('')
  const [scanResult, setScanResult] = useState<{ status: 'IDLE' | 'SUCCESS' | 'ERROR' | 'WARNING'; message: string; ticket?: Ticket }>({ status: 'IDLE', message: '' })
  const [isScanning, setIsScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [organizerEvents, setOrganizerEvents] = useState<OrganizerEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [referralCode, setReferralCode] = useState('')
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const qrcodeRegionId = "html5qr-code-full-region"
  const processingRef = useRef(false) // Prevent duplicate processing

  // Fetch organizer events if user is organizer
  useEffect(() => {
    if (user?.role === 'organizer') {
      fetchOrganizerEvents()
    }
  }, [user])

  const fetchOrganizerEvents = async () => {
    try {
      const token = localStorage.getItem('vortex.auth.token')
      const response = await fetch('/api/organizer/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setOrganizerEvents(data || [])
      if (data.length > 0) {
        setSelectedEventId(data[0].event_id.toString())
        setReferralCode(data[0].referral_code)
      }
    } catch (err) {
      console.error('Failed to fetch organizer events:', err)
    }
  }

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId)
    const event = organizerEvents.find(e => e.event_id.toString() === eventId)
    if (event) {
      setReferralCode(event.referral_code)
      // Clear previous scan result when switching events
      setScanResult({ status: 'IDLE', message: '' })
    }
  }

  // Get currently selected event
  const selectedEvent = organizerEvents.find(e => e.event_id.toString() === selectedEventId)
  const canAccessScanner = selectedEvent?.hasAccess && !selectedEvent?.eventEnded

  const processTicket = async (code: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    setIsScanning(true)
    setScanResult({ status: 'IDLE', message: '' })
    playClickSound() // Beep
    
    try {
      // For organizers, use event-specific endpoint with access validation middleware
      // For admins, use the generic endpoint
      const endpoint = user?.role === 'organizer' && selectedEventId
        ? `/api/events/${selectedEventId}/tickets/validate`
        : '/api/tickets/validate'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vortex.auth.token') || ''}`
        },
        body: JSON.stringify({ unique_code: code })
      });
      
      const result = await response.json();
      
      if (!response.ok || result.status === 'error') {
        const message = result.message || 'INVALID TICKET ID DETECTED';
        
        // Special handling for access denied (expired event)
        if (result.accessDenied === true) {
           setScanResult({
             status: 'ERROR',
             message: 'ACCESS EXPIRED - Event scanning window has closed',
           });
        } else if (message.includes('SUDAH TERPAKAI') || message.includes('already been used')) {
           setScanResult({
             status: 'WARNING',
             message: message,
             ticket: { assignedName: 'Unknown', ticketId: code, eventName: 'Unknown', tier: 'Unknown', id: '', eventId: '', venue: '', date: '', gate: '', orderId: '', purchaseDate: '', status: 'SCANNED' }
           });
        } else {
           setScanResult({
             status: 'ERROR',
             message: message,
           });
        }
      } else if (result.data) {
         // Valid and unused!
         setScanResult({
           status: 'SUCCESS',
           message: 'ACCESS GRANTED',
           ticket: { 
             assignedName: result.data.user?.username || 'Verified User', 
             ticketId: result.data.unique_code, 
             eventName: result.data.event?.title || 'Verified Event', 
             tier: result.data.ticket_name || 'GENERAL', 
             id: result.data.ticket_id, 
             eventId: '...', venue: '...', date: '...', gate: '...', orderId: result.data.order_id, purchaseDate: '...', status: 'VALID' 
           }
         });
      }
    } catch (err) {
      console.error(err);
      setScanResult({
        status: 'ERROR',
        message: 'CONNECTION FAILED',
      });
    } finally {
      setIsScanning(false)
      // Reset cooldown for the next scan
      setTimeout(() => {
        processingRef.current = false;
      }, 3000); // 3 seconds cooldown before accepting another code
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketInput.trim()) return
    processTicket(ticketInput.trim().toUpperCase())
    setTicketInput('')
  }

  useEffect(() => {
    // Cleanup function when component unmounts
    return () => {
      if (html5QrCodeRef.current && cameraActive) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [cameraActive])

  const toggleCamera = async () => {
    if (cameraActive) {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop().catch(console.error)
        html5QrCodeRef.current.clear()
        setCameraActive(false)
      }
    } else {
      setCameraActive(true)
      // Small delay to ensure the div is rendered
      setTimeout(() => {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId)
        }
        
        const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
          if (!processingRef.current) {
            processTicket(decodedText);
          }
        };

        // If we don't provide qrbox, it will scan the whole video frame
        // This is better for custom UIs so the user just points the camera
        const config = { 
          fps: 15,
          aspectRatio: 1.0
        };
        
        // If facingMode not supported by device, it falls back to whatever is available
        html5QrCodeRef.current.start(
          { facingMode: "environment" }, 
          config, 
          qrCodeSuccessCallback,
          (errorMessage) => { /* Only log errors if needed, usually just means no QR found in frame */ }
        ).catch(err => {
          console.error("Error starting camera: ", err);
          alert("Failed to start camera. Please check permissions or try another browser.");
          setCameraActive(false);
        });
      }, 300)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Validation Core</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Event admission and QR ticket scanning interface</p>
        </div>
      </div>

      {/* Organizer Event Selector */}
      {user?.role === 'organizer' && organizerEvents.length > 0 && (
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-6 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] space-y-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">Your Assigned Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizerEvents.map((event) => (
              <button
                key={event.event_organizer_id}
                onClick={() => handleEventSelect(event.event_id.toString())}
                disabled={event.eventEnded}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  event.eventEnded
                    ? 'border-rose-500/30 bg-rose-500/5 cursor-not-allowed opacity-60'
                    : selectedEventId === event.event_id.toString()
                    ? 'border-primary bg-primary/10'
                    : 'border-white/[0.1] bg-white/[0.02] hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{event.event_title}</h3>
                      {event.eventEnded ? (
                        <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded-full font-semibold">
                          ENDED
                        </span>
                      ) : event.minutesUntilEnd < 60 ? (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full font-semibold animate-pulse">
                          {event.minutesUntilEnd}m LEFT
                        </span>
                      ) : (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mb-2">Referral Code:</p>
                    <code className="text-sm font-mono text-primary bg-black/30 px-2 py-1 rounded">{event.referral_code}</code>
                    {event.eventEnded && (
                      <p className="text-xs text-rose-400 mt-2 font-semibold">Event has ended - No access</p>
                    )}
                  </div>
                  {event.notes && (
                    <p className="text-xs text-white/50 mt-2 italic">{event.notes}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Access Denied Message */}
      {user?.role === 'organizer' && selectedEvent && !canAccessScanner && (
        <div className="bg-rose-900/20 backdrop-blur-[40px] border border-rose-500/30 p-6 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] animate-pulse">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-3xl text-rose-400 mt-1">lock_clock</span>
            <div>
              <h3 className="text-lg font-semibold text-rose-400 mb-1">ACCESS EXPIRED</h3>
              <p className="text-sm text-rose-300/80">
                {selectedEvent.eventEnded 
                  ? `This event's organizer scanning access ended at ${new Date(selectedEvent.access_deadline).toLocaleString()}. You no longer have permission to scan tickets for this event.`
                  : 'Your access window for this event has closed.'}
              </p>
              {selectedEvent.organizer_access_until && (
                <p className="text-xs text-rose-300/60 mt-2">
                  Access was set to expire: {new Date(selectedEvent.organizer_access_until).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 items-start">
        
        {/* Left Side: Viewfinder */}
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="relative w-72 h-72 mb-8 mt-4 group rounded-3xl overflow-hidden bg-black/20">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/30 rounded-tl-xl transition-all duration-300 group-hover:border-primary/60 group-hover:scale-110 origin-top-left z-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/30 rounded-tr-xl transition-all duration-300 group-hover:border-primary/60 group-hover:scale-110 origin-top-right z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/30 rounded-bl-xl transition-all duration-300 group-hover:border-primary/60 group-hover:scale-110 origin-bottom-left z-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/30 rounded-br-xl transition-all duration-300 group-hover:border-primary/60 group-hover:scale-110 origin-bottom-right z-20 pointer-events-none" />
            
            {/* Real Camera Container */}
            <div 
              id={qrcodeRegionId} 
              className={`absolute inset-0 rounded-3xl overflow-hidden bg-transparent transition-opacity duration-500 flex items-center justify-center ${cameraActive ? 'opacity-100' : 'opacity-0'} [&>video]:!w-full [&>video]:!h-full [&>video]:!object-cover [&>video]:rounded-3xl [&>canvas]:hidden`}
            ></div>
            
            {/* Crosshair (Only when camera is not fully initializing or when scanning overlay) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center">
                 <div className="w-1 h-1 bg-white/50 rounded-full" />
              </div>
            </div>

            {/* Scanning Laser */}
            {(isScanning || cameraActive) && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_20px_rgba(203,255,0,0.8)] animate-[scan_2s_ease-in-out_infinite_alternate] z-20 pointer-events-none" />
            )}
            
            {/* Fake Camera Feed Bg (When Camera is OFF) */}
            {!cameraActive && (
              <div className="absolute inset-4 bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/[0.05] flex flex-col items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-4xl text-white/20 mb-2">qr_code_2</span>
                <span className="text-xs text-white/30 font-semibold uppercase tracking-widest">CAMERA OFFLINE</span>
              </div>
            )}
          </div>

          <button 
            onClick={toggleCamera}
            disabled={isScanning || !canAccessScanner}
            onMouseEnter={playHoverSound}
            className={`w-full max-w-[288px] ${
              !canAccessScanner
                ? 'bg-zinc-600 text-zinc-400 border-zinc-600 cursor-not-allowed'
                : cameraActive 
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/30' 
                : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30'
            } border backdrop-blur-md font-semibold tracking-wide text-sm px-6 py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
              {!canAccessScanner ? 'lock' : cameraActive ? 'videocam_off' : 'document_scanner'}
            </span>
            {!canAccessScanner 
              ? 'ACCESS EXPIRED' 
              : isScanning 
              ? 'PROCESSING...' 
              : cameraActive 
              ? 'STOP CAMERA' 
              : 'START CAMERA SCANNER'}
          </button>
          
          <div className="mt-8 w-full max-w-[288px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">OR MANUAL ENTRY</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>
            <form onSubmit={handleManualSubmit} className="relative">
              <input 
                type="text"
                value={ticketInput}
                onChange={e => setTicketInput(e.target.value)}
                disabled={!canAccessScanner}
                placeholder={canAccessScanner ? "ENTER TICKET ID..." : "ACCESS EXPIRED - NO ENTRY"}
                className={`w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all font-mono placeholder:font-sans placeholder:text-white/20 shadow-inner ${
                  !canAccessScanner ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <button 
                type="submit" 
                disabled={!canAccessScanner}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white ${
                  !canAccessScanner
                    ? 'bg-zinc-800 cursor-not-allowed opacity-50'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Result Status */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden min-h-[200px] flex flex-col justify-center items-center text-center">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {scanResult.status === 'IDLE' && !isScanning && (
               <div className="text-white/30 flex flex-col items-center gap-3">
                 <span className="material-symbols-outlined text-5xl">center_focus_weak</span>
                 <p className="text-sm font-semibold uppercase tracking-widest">AWAITING SCAN INPUT</p>
               </div>
            )}

            {isScanning && (
               <div className="text-primary flex flex-col items-center gap-3 animate-pulse">
                 <span className="material-symbols-outlined text-5xl animate-spin-slow">hourglass_empty</span>
                 <p className="text-sm font-bold uppercase tracking-widest text-primary drop-shadow-[0_0_10px_rgba(203,255,0,0.5)]">VERIFYING SIGNATURE...</p>
               </div>
            )}

            {scanResult.status === 'SUCCESS' && (
               <div className="text-emerald-400 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-500">
                 <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                   <span className="material-symbols-outlined text-4xl">check_circle</span>
                 </div>
                 <p className="text-lg font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">{scanResult.message}</p>
               </div>
            )}

            {scanResult.status === 'WARNING' && (
               <div className="text-amber-400 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-500">
                 <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                   <span className="material-symbols-outlined text-4xl">warning</span>
                 </div>
                 <p className="text-lg font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{scanResult.message}</p>
               </div>
            )}

            {scanResult.status === 'ERROR' && (
               <div className="text-rose-400 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-500">
                 <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30 shadow-[0_0_30px_rgba(251,113,133,0.3)]">
                   <span className="material-symbols-outlined text-4xl">cancel</span>
                 </div>
                 <p className="text-lg font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]">{scanResult.message}</p>
               </div>
            )}
          </div>

          {/* Ticket Details Panel */}
          <div className={`bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500 ${scanResult.ticket ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 blur-[2px] pointer-events-none'}`}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="text-base font-semibold text-white/90 mb-6 tracking-wide">Identity Profiler</h2>
            
            {scanResult.ticket ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Account Name</span>
                  <span className="text-sm font-semibold text-white tracking-wide">{scanResult.ticket.assignedName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Ticket ID</span>
                  <span className="text-sm font-mono font-medium text-white/80">{scanResult.ticket.ticketId}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Event</span>
                  <span className="text-sm font-semibold text-primary">{scanResult.ticket.eventName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Tier</span>
                  <span className="text-sm font-bold tracking-widest text-amber-400">{scanResult.ticket.tier}</span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
