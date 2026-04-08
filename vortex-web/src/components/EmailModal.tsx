import { useState, useEffect, useRef } from 'react'

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  ticketInfo?: {
    eventName: string
    ticketId: string
    tier: string
  }
  autoSendEmail?: string
}

type SendStatus = 'idle' | 'sending' | 'success' | 'error'

export function EmailModal({ isOpen, onClose, ticketInfo, autoSendEmail }: EmailModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SendStatus>('idle')
  const [progress, setProgress] = useState(0)
  const autoSendTriggered = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setStatus('idle')
      setProgress(0)
      autoSendTriggered.current = false
    }
  }, [isOpen])

  // Auto-send when autoSendEmail is provided and modal opens
  useEffect(() => {
    if (isOpen && autoSendEmail && !autoSendTriggered.current && status === 'idle') {
      autoSendTriggered.current = true
      setEmail(autoSendEmail)
      setStatus('sending')
      setProgress(0)
    }
  }, [isOpen, autoSendEmail, status])

  useEffect(() => {
    if (status === 'sending') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setStatus('success')
            return 100
          }
          return prev + Math.random() * 15 + 5
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [status])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    setStatus('sending')
    setProgress(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-black/80 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] relative overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'zoomIn 0.3s ease-out' }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
        
        {status === 'success' ? (
          <div className="flex flex-col items-center py-6 gap-4">
            {/* Success Animation */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center"
                style={{ animation: 'pulse 1.5s infinite' }}
              >
                <span className="material-symbols-outlined text-4xl text-emerald-400"
                  style={{ animation: 'bounceIn 0.5s ease-out' }}
                >check_circle</span>
              </div>
              {/* Particle effects */}
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400"
                  style={{
                    top: '50%', left: '50%',
                    animation: `particle ${0.8 + Math.random() * 0.4}s ease-out forwards`,
                    transform: `rotate(${i * 45}deg) translateX(0px)`,
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0, 
                  }}
                />
              ))}
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight">Ticket Sent!</h3>
            <p className="text-sm text-white/50 text-center">
              E-ticket dan QR code telah dikirim ke<br />
              <span className="text-indigo-300 font-mono font-medium">{email}</span>
            </p>
            {ticketInfo && (
              <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-1.5">
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Ticket Details</p>
                <p className="text-sm text-white/80 font-medium">{ticketInfo.eventName}</p>
                <p className="text-xs text-white/40 font-mono">{ticketInfo.ticketId} • {ticketInfo.tier}</p>
              </div>
            )}
            <button 
              onClick={onClose}
              className="mt-2 px-8 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-300">mail</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Send to Email</h3>
                <p className="text-xs text-white/40">Kirim e-ticket dan QR code ke email</p>
              </div>
            </div>

            {ticketInfo && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 mb-5 space-y-1">
                <p className="text-sm font-medium text-white/80">{ticketInfo.eventName}</p>
                <p className="text-xs text-white/40 font-mono">{ticketInfo.ticketId} • {ticketInfo.tier}</p>
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@email.com"
                  disabled={status === 'sending'}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20 shadow-inner disabled:opacity-50"
                />
              </div>

              {status === 'sending' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 font-medium">Sending...</span>
                    <span className="text-indigo-300 font-mono">{Math.min(100, Math.round(progress))}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-200 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={onClose}
                  disabled={status === 'sending'}
                  className="flex-1 px-4 py-3.5 rounded-2xl border border-white/[0.1] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] transition-all duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={status === 'sending'}
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Send Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes particle {
          0% { opacity: 1; transform: rotate(inherit) translateX(0px); }
          100% { opacity: 0; transform: rotate(inherit) translateX(40px); }
        }
      `}</style>
    </div>
  )
}
