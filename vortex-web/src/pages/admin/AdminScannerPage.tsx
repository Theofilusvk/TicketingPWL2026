import { useState } from 'react'
import { useStore, type Ticket } from '../../lib/store'
import { useAudio } from '../../lib/audio'

export function AdminScannerPage() {
  const { ownedTickets } = useStore()
  const { playHoverSound, playClickSound } = useAudio()
  
  const [ticketInput, setTicketInput] = useState('')
  const [scanResult, setScanResult] = useState<{ status: 'IDLE' | 'SUCCESS' | 'ERROR' | 'WARNING'; message: string; ticket?: Ticket }>({ status: 'IDLE', message: '' })
  const [isScanning, setIsScanning] = useState(false)

  const processTicket = async (code: string) => {
    setIsScanning(true)
    setScanResult({ status: 'IDLE', message: '' })
    
    try {
      // Connect to Laravel Backend /api/tickets/validate
      const response = await fetch('http://127.0.0.1:8000/api/tickets/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ unique_code: code })
      });
      
      const result = await response.json();
      
      playClickSound(); // Beep
      
      if (!response.ok || result.status === 'error') {
        const message = result.message || 'INVALID TICKET ID DETECTED';
        if (message.includes('SUDAH TERPAKAI')) {
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
        return;
      }

      // Valid and unused!
      if (result.data) {
         setScanResult({
           status: 'SUCCESS',
           message: 'ACCESS GRANTED',
           ticket: { 
             assignedName: 'Verified User', 
             ticketId: result.data.unique_code, 
             eventName: result.data.order_item_id ? 'Event Ticket' : 'Verified Event', 
             tier: 'GENERAL', 
             id: result.data.ticket_id, 
             eventId: '...', venue: '...', date: '...', gate: '...', orderId: '...', purchaseDate: '...', status: 'VALID' 
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
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketInput.trim()) return
    processTicket(ticketInput.trim().toUpperCase())
    setTicketInput('')
  }

  const simulateCameraScan = () => {
    // Generate a simulated valid code that might not exist locally but we can try just to see the API response loading state.
    // Or if local mock tickets exist, pass one of them.
    const validTickets = ownedTickets.filter(t => t.status !== 'SCANNED')
    if (validTickets.length > 0) {
      const target = validTickets[Math.floor(Math.random() * validTickets.length)]
      processTicket(target.ticketId)
    } else {
      processTicket('TKT-MOCK-123')
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 items-start">
        
        {/* Left Side: Viewfinder */}
        <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] p-8 rounded-[32px] shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="relative w-72 h-72 mb-8 mt-4 group">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/30 rounded-tl-xl transition-all duration-300 group-hover:border-primary/60 group-hover:scale-110 origin-top-left" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/30 rounded-tr-xl transition-all duration-300 group-hover:border-primary/60 group-hover:scale-110 origin-top-right" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/30 rounded-bl-xl transition-all duration-300 group-hover:border-primary/60 group-hover:scale-110 origin-bottom-left" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/30 rounded-br-xl transition-all duration-300 group-hover:border-primary/60 group-hover:scale-110 origin-bottom-right" />
            
            {/* Center Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center">
                 <div className="w-1 h-1 bg-white/30 rounded-full" />
              </div>
            </div>

            {/* Scanning Laser */}
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_20px_rgba(203,255,0,0.8)] animate-[scan_1s_ease-in-out_infinite_alternate]" />
            )}
            
            {/* Fake Camera Feed Bg */}
            <div className="absolute inset-4 bg-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/[0.05] flex items-center justify-center overflow-hidden">
               {isScanning ? (
                 <span className="material-symbols-outlined text-4xl text-primary animate-pulse">qr_code_scanner</span>
               ) : (
                 <span className="material-symbols-outlined text-4xl text-white/20">qr_code_2</span>
               )}
            </div>
          </div>

          <button 
            onClick={() => simulateCameraScan()}
            disabled={isScanning}
            onMouseEnter={playHoverSound}
            className="w-full max-w-[288px] bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">document_scanner</span>
            {isScanning ? 'PROCESSING...' : 'SIMULATE SCAN'}
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
                placeholder="ENTER TICKET ID..."
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all font-mono placeholder:font-sans placeholder:text-white/20 shadow-inner"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
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
