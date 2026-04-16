import { useEffect, useState, useRef } from 'react'
import { useLocation, Link, useSearchParams } from 'react-router-dom'
import { ShareButton } from '../components/ShareButton'
import { EmailModal } from '../components/EmailModal'
import { useAudio } from '../lib/audio'
import { useStore } from '../lib/store'

// Confetti particle system
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#CBFF00', '#FF4D4D', '#FFD700', '#00FFFF', '#FF00FF', '#FFFFFF']

    interface Particle {
      x: number; y: number; w: number; h: number
      dx: number; dy: number; rot: number; dRot: number
      color: string; alpha: number; decay: number
    }

    const particles: Particle[] = []
    // Burst from center top
    for (let i = 0; i < 150; i++) {
      const angle = (Math.random() * Math.PI * 2)
      const speed = Math.random() * 8 + 2
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.3,
        w: Math.random() * 8 + 3,
        h: Math.random() * 4 + 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 3,
        rot: Math.random() * Math.PI * 2,
        dRot: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.008 + 0.003,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        if (p.alpha <= 0) continue
        alive = true
        p.x += p.dx
        p.y += p.dy
        p.dy += 0.15 
        p.rot += p.dRot
        p.alpha -= p.decay
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (alive) animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" />
}

// Animated checkmark SVG
function AnimatedCheck() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow rings */}
      <div className="absolute w-32 h-32 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-pulse" />
      
      {/* Circle + Check */}
      <div className={`relative w-20 h-20 rounded-full bg-primary flex items-center justify-center transition-all duration-700 ${show ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        style={{ boxShadow: '0 0 40px rgba(203,255,0,0.5), 0 0 80px rgba(203,255,0,0.2)' }}
      >
        <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M5 13l4 4L19 7"
            className={`transition-all duration-500 delay-300 ${show ? 'opacity-100' : 'opacity-0'}`}
            style={{
              strokeDasharray: 24,
              strokeDashoffset: show ? 0 : 24,
              transition: 'stroke-dashoffset 0.6s ease 0.5s, opacity 0.3s ease 0.3s',
            }}
          />
        </svg>
      </div>
    </div>
  )
}

export function SuccessPage() {
  const { playSuccessSound } = useAudio()
  const { removeFromCart } = useStore()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const urlOrderId = searchParams.get('orderId')
  const [fetchedOrder, setFetchedOrder] = useState<any>(null)
  const [isFetching, setIsFetching] = useState(!!urlOrderId)

  const [stage, setStage] = useState(0)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [testingXendit, setTestingXendit] = useState(false)
  const [xenditStatus, setXenditStatus] = useState<string>('')

  useEffect(() => {
      let intervalId: number;

      const fetchOrder = async () => {
          if (!urlOrderId) return;
          try {
              const token = localStorage.getItem('vortex.auth.token');
              const r = await fetch(`http://127.0.0.1:8000/api/orders/${urlOrderId}`, {
                  headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
              });
              const res = await r.json();
              if (res.status === 'success') {
                  setFetchedOrder(res.data);
                  if (res.data.status === 'paid') {
                      try {
                          const pendingItemsStr = sessionStorage.getItem('vortex_checkout_pending_items');
                          if (pendingItemsStr) {
                              const pendingIds = JSON.parse(pendingItemsStr);
                              pendingIds.forEach((id: string) => removeFromCart(id));
                              sessionStorage.removeItem('vortex_checkout_pending_items');
                          }
                      } catch (e) {
                          // Silently ignore storage errors to avoid wiping the cart
                      }
                      
                      setIsFetching(false);
                      if (intervalId) clearInterval(intervalId);
                  }
              }
          } catch(e) {
              console.error(e)
          }
      };

      if (urlOrderId) {
          fetchOrder(); // Initial fetch
          intervalId = window.setInterval(() => {
              if (isFetching) {
                  fetchOrder();
              }
          }, 3000); // Poll every 3 seconds
      } else {
          setIsFetching(false);
      }

      return () => {
          if (intervalId) clearInterval(intervalId);
      }
  }, [urlOrderId, isFetching]);

  const rawState = location.state || {};
  const orderData = fetchedOrder || {
     ...rawState,
     orderId: rawState.orderId || 'VTX-99281-XC',
     total: rawState.total || 249.00,
     tickets: rawState.tickets || (rawState.items ? rawState.items.map((i: any) => ({ ...i, eventName: i.title, date: 'N/A', tier: 'MERCHANDISE', id: i.id || 'MERCH-ITEM' })) : null) || [{
       eventName: 'NEON CHAOS 2025',
       date: '08.12.25',
       tier: 'VIP TIER'
     }]
  }

  useEffect(() => {
    if (isFetching) return;
    playSuccessSound()
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => setStage(3), 1300),
      setTimeout(() => setStage(4), 1800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isFetching])

  const staggerClass = (s: number) =>
    `transition-all duration-700 ${stage >= s ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

  // Test Xendit payment status
  const testXenditStatus = async () => {
    setTestingXendit(true)
    setXenditStatus('Testing Xendit connection...')
    try {
      const token = localStorage.getItem('vortex.auth.token')
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${urlOrderId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      })
      const data = await response.json()
      
      if (data.status === 'success') {
        const order = data.data
        const paymentStatus = order.payment_status || order.status || 'unknown'
        const xenditRef = order.xendit_invoice_id || order.xendit_reference || 'N/A'
        
        setXenditStatus(
          `✓ Xendit Connection OK\n` +
          `Payment Status: ${paymentStatus.toUpperCase()}\n` +
          `Invoice ID: ${xenditRef}\n` +
          `Timestamp: ${new Date().toLocaleTimeString()}`
        )
      } else {
        setXenditStatus(`✗ Error: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      setXenditStatus(`✗ Connection Failed: ${error instanceof Error ? error.message : 'Network error'}`)
    } finally {
      setTestingXendit(false)
    }
  }

  if (isFetching) {
      return <div className="h-screen w-full flex items-center justify-center text-primary font-mono animate-pulse">VERIFYING_TRANSACTION...</div>
  }

  return (
    <>
      <ConfettiCanvas />
      <main className="mx-auto w-full max-w-4xl relative z-10">
        {/* Animated Check */}
        <div className={`mt-16 mb-8 flex justify-center ${staggerClass(0)}`}>
          <AnimatedCheck />
        </div>

        {/* Status Badge + Title */}
        <div className={`mb-12 text-center ${staggerClass(1)}`}>
          <div className={`inline-block ${orderData.status === 'paid' ? 'bg-emerald-600' : 'bg-hot-coral'} text-black px-4 py-1 font-accent font-bold text-[10px] mb-6 uppercase tracking-widest leading-loose ${orderData.status === 'paid' ? '' : 'animate-pulse'}`}>
            PAYMENT_STATUS: {orderData.status === 'paid' ? '✓ PAID' : '⏳ PENDING'}
          </div>
          <h1 className="font-display text-6xl md:text-8xl leading-none text-primary drop-shadow-[0_0_20px_rgba(203,255,0,0.6)]">
            {orderData.status === 'paid' ? 'PAYMENT_CONFIRMED' : 'PROCESSING_PAYMENT'}
          </h1>
          <p className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest mt-4">
            {orderData.status === 'paid' ? 'TRANSACTION ENCRYPTED & STORED ON VORTEX MAINFRAME' : 'VERIFYING WITH XENDIT PAYMENT GATEWAY'}
          </p>
          
          {/* Payment Reference Info */}
          {orderData && (
            <div className="mt-6 p-4 bg-black/60 border border-zinc-800 rounded text-left max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-3 font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                <div>
                  <p className="text-zinc-600">Order ID</p>
                  <p className="text-primary font-bold">{orderData.id || orderData.orderId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-zinc-600">Payment Method</p>
                  <p className="text-indigo-400">{orderData.payment_method || 'XENDIT'}</p>
                </div>
                <div>
                  <p className="text-zinc-600">Total Amount</p>
                  <p className="text-hot-coral">${Number(orderData.total).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-zinc-600">Status</p>
                  <p className={orderData.status === 'paid' ? 'text-emerald-400' : 'text-yellow-400'}>{(orderData.status || 'pending').toUpperCase()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Test Xendit Button */}
          <button
            onClick={testXenditStatus}
            disabled={testingXendit}
            className="mt-6 px-4 py-2 bg-indigo-600/20 border border-indigo-500/50 rounded text-indigo-400 text-xs font-mono uppercase tracking-wider hover:border-indigo-400 hover:bg-indigo-600/30 transition-all disabled:opacity-50"
          >
            {testingXendit ? 'Testing...' : 'Test Xendit Status'}
          </button>
          
          {/* Xendit Test Result */}
          {xenditStatus && (
            <div className="mt-4 p-3 bg-zinc-900/60 border border-zinc-700 rounded text-left font-mono text-[8px] text-zinc-300 max-w-md mx-auto whitespace-pre-line">
              {xenditStatus}
            </div>
          )}
        </div>

        {/* Dynamic Tickets Display */}
        <div className={`w-full mb-16 flex flex-col gap-8 ${staggerClass(2)}`}>
          {orderData.tickets.map((ticket: any, index: number) => (
             <div key={ticket.id} className="w-full p-8 md:p-12 overflow-hidden bg-black/40 border border-t-primary border-r-hot-coral border-b-hot-coral border-l-primary shadow-[0_0_40px_rgba(203,255,0,0.05)] relative flex flex-col md:flex-row gap-8 items-center">
               
               <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center w-full">
                 <div className="flex flex-col gap-8">
                   <div>
                     <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                       EVENT_NAME
                     </p>
                     <h2 className="font-display text-4xl text-white tracking-wide">{ticket.eventName}</h2>
                   </div>
                   <div className="flex gap-12">
                     <div>
                       <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                         DATE
                       </p>
                       <p className="font-mono tracking-widest text-sm text-white">{ticket.date}</p>
                     </div>
                     <div>
                       <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                         ACCESS TIER
                       </p>
                       <p className="font-mono tracking-widest text-sm text-white">{ticket.tier}</p>
                     </div>
                   </div>
                 </div>
                 
                 <div className="hidden md:block w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
     
                 <div className="flex flex-col gap-8 h-full justify-between">
                   <div className="flex justify-between items-start gap-8">
                     <div>
                       <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                         ORDER / TICKET ID
                       </p>
                       <p className="font-mono tracking-widest text-sm text-hot-coral">#{ticket.id}</p>
                     </div>
                     <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                       <span className="material-symbols-outlined text-2xl text-primary">verified</span>
                     </div>
                   </div>
                   {index === 0 && (
                     <div>
                       <p className="font-accent text-primary/60 text-[10px] uppercase tracking-widest mb-1">
                         TOTAL_ORDER_PAID
                       </p>
                       <p className="font-mono tracking-widest text-white text-3xl font-bold">${Number(orderData.total).toFixed(2)}</p>
                     </div>
                   )}
                 </div>
               </div>

               {/* INSTANT QR CODE REVEAL OR MERCHANDISE TRACKING */}
               {!orderData.isMerchandise ? (
                 <div className="border border-primary/30 p-4 bg-white/5 flex flex-col items-center">
                   <p className="font-accent text-[8px] text-primary mb-3 tracking-widest uppercase">/ ACCESS_QR_CODE</p>
                   <div className="bg-white p-2">
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${ticket.id}`} 
                       alt="TICKET QR" 
                       className="mix-blend-multiply"
                     />
                   </div>
                   <p className="font-mono text-[8px] text-zinc-500 mt-2">SECURE SIGNATURE</p>
                 </div>
               ) : (
                 <div className="border border-hot-coral/30 p-4 bg-white/5 flex flex-col items-center justify-center min-w-[150px]">
                   <span className="material-symbols-outlined text-4xl text-hot-coral mb-3">local_shipping</span>
                   <p className="font-accent text-[10px] text-hot-coral font-bold tracking-widest uppercase text-center">SHIPPING<br/>PENDING</p>
                   <p className="font-mono text-[8px] text-zinc-500 mt-2 text-center">TRACKING NUMBER<br/>WILL BE EMAILED</p>
                 </div>
               )}
               
             </div>
          ))}

          <div className="pt-6 border-t border-white/5 flex justify-between items-center w-full px-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">SECURED VIA VORTEX PROTOCOL</span>
            </div>
            <div className="flex gap-1">
               <div className="w-1.5 h-6 bg-primary" />
               <div className="w-3 h-6 bg-[#3a3b2f]" />
               <div className="w-1.5 h-6 bg-hot-coral" />
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className={staggerClass(3)}>
          <div className="mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
            <h2 className="font-display text-3xl text-primary">WHAT'S_NEXT?</h2>
          </div>

          {/* Email Delivery Info */}
          {orderData.status === 'paid' && (
            <div className="mb-8 p-4 bg-emerald-500/5 border border-emerald-500/30 rounded">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-xl mt-0.5">check_circle</span>
                <div>
                  <p className="font-accent text-sm text-emerald-400 uppercase tracking-wider font-bold">Email Delivery in Progress</p>
                  <p className="font-accent text-[11px] text-emerald-300/80 mt-1">
                    Your e-tickets have been queued for automatic delivery to <span className="font-mono font-bold">{orderData.user?.email || 'your registered email'}</span>
                  </p>
                  <p className="font-accent text-[9px] text-emerald-300/60 mt-2">
                    Delivery typically completes within 5 minutes. You can also send tickets manually using the button below.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 border-b border-white/10 pb-20">
            <Link
              to="/tickets"
              className="flex items-center gap-4 p-5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group bg-black/40 hover:shadow-[0_0_20px_rgba(203,255,0,0.05)]"
            >
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">confirmation_number</span>
              <div className="text-left flex flex-col">
                <span className="font-display text-xl text-white group-hover:text-primary transition-colors tracking-wide">VIEW TICKETS</span>
                <span className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase">ACCESS_VAULT</span>
              </div>
            </Link>
            <button
              onClick={() => {
                if (!urlOrderId) return;
                const token = localStorage.getItem('vortex.auth.token');
                fetch(`http://127.0.0.1:8000/api/orders/${urlOrderId}/download-pdf`, {
                  headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/pdf' }
                })
                .then(res => res.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = (!orderData || !orderData.isMerchandise) ? `e-ticket-ORD-${urlOrderId}.pdf` : `invoice-ORD-${urlOrderId}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                })
                .catch(err => console.error('Download failed', err));
              }}
              className="flex items-center gap-4 p-5 border border-white/10 hover:border-hot-coral/50 hover:bg-hot-coral/5 transition-all group bg-black/40 hover:shadow-[0_0_20px_rgba(255,77,77,0.05)] text-left"
            >
              <span className="material-symbols-outlined text-hot-coral text-xl group-hover:scale-110 transition-transform">
                {(!orderData || !orderData.isMerchandise) ? 'qr_code_2' : 'receipt_long'}
              </span>
              <div className="text-left flex flex-col">
                <span className="font-display text-xl text-white group-hover:text-hot-coral transition-colors tracking-wide">
                  {(!orderData || !orderData.isMerchandise) ? 'DOWNLOAD QR' : 'DOWNLOAD INVOICE'}
                </span>
                <span className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase">PDF_EXPORT</span>
              </div>
            </button>
            <Link
              to="/events"
              className="flex items-center gap-4 p-5 border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all group bg-black/40 hover:shadow-[0_0_20px_rgba(203,255,0,0.05)]"
            >
              <span className="material-symbols-outlined text-primary text-xl group-hover:scale-110 transition-transform">dashboard</span>
               <div className="text-left flex flex-col">
                <span className="font-display text-xl text-white group-hover:text-primary transition-colors tracking-wide">DASHBOARD</span>
                <span className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase">EXIT_PROCESS</span>
              </div>
            </Link>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-4 p-5 border-2 border-indigo-500/80 hover:border-indigo-300 hover:bg-indigo-600/10 transition-all group bg-indigo-500/5 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] text-left"
            >
              <span className="material-symbols-outlined text-indigo-400 text-2xl group-hover:scale-110 transition-transform">mail</span>
              <div className="flex flex-col flex-1">
                <span className="font-display text-xl text-indigo-300 group-hover:text-indigo-200 transition-colors tracking-wide">SEND EMAIL</span>
                <span className="font-accent text-[8px] text-indigo-400/70 tracking-widest uppercase">
                  {orderData.status === 'paid' ? '✓ E-TICKET QUEUED FOR DELIVERY' : 'Pending payment confirmation'}
                </span>
              </div>
              <span className="material-symbols-outlined text-indigo-400 text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className={`text-center font-accent uppercase tracking-[0.3em] text-[10px] text-zinc-500 flex flex-col items-center gap-6 mb-20 ${staggerClass(4)}`}>
          <span>BROADCAST COMPLETION</span>
          <ShareButton title="Neon Chaos 2025" text="I just locked in my access to Neon Chaos 2025!" />
        </div>

      </main>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        orderId={urlOrderId || undefined}
        ticketInfo={{
          eventName: orderData.tickets?.[0]?.eventName || 'VORTEX EVENT',
          ticketId: orderData.orderId || '#N/A',
          tier: orderData.tickets?.[0]?.tier || 'GENERAL'
        }}
      />
    </>
  )
}
