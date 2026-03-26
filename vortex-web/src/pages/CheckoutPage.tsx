import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore, type Ticket } from '../lib/store'
import { LiveQueue } from '../components/LiveQueue'
import { useNotification } from '../lib/useNotification'

type PaymentMethod = 'QRIS' | 'CARD' | 'E-WALLET' | 'CRYPTO'

export function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart, checkout } = useStore()
  const { requestPermission, scheduleNotification, permission } = useNotification()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('CARD')
  const [queuePassed, setQueuePassed] = useState(false)
  
  const selectedIds = location.state?.selectedItems || []
  const checkoutItems = cart.filter(item => selectedIds.includes(item.id))

  useEffect(() => {
    if (!isProcessing && checkoutItems.length === 0) {
      navigate('/cart')
    }
  }, [checkoutItems.length, navigate, isProcessing])
  
  useEffect(() => {
    // Request permission when entering checkout so we can notify them later
    if (permission === 'default') {
      requestPermission()
    }
  }, [permission, requestPermission])

  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price, 0)
  const serviceFee = checkoutItems.length > 0 ? (checkoutItems.some(i => i.ticketId) ? 12.5 : 5.0) : 0
  const tax = subtotal * 0.08
  const total = subtotal + serviceFee + tax

  const handleExecutePayment = () => {
    // Generate tickets from all checkout items that have ticketId
    const tickets: Ticket[] = checkoutItems
      .filter(item => item.ticketId)
      .map(item => ({
        id: `ticket_${Math.random().toString(16).slice(2)}`,
        eventId: 'neon-chaos-2025',
        eventName: 'NEON CHAOS 2025',
        venue: 'UNDISCLOSED WAREHOUSE',
        date: '2025-02-14',
        tier: item.phase || 'GENERAL',
        gate: 'NORTH_02',
        orderId: `ORD-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
        purchaseDate: new Date().toISOString(),
        assignedName: item.assignedName || 'UNASSIGNED',
        ticketId: item.ticketId!,
      }))
    
    // Simple mock credit logic: 100 credits per unit of currency spent
    const earnedCredits = Math.floor(total * 100)
    
    setIsProcessing(true)
    checkout(tickets, earnedCredits, checkoutItems.map(i => i.id))
    
    // Schedule a push notification as a delayed event reminder/confirmation
    scheduleNotification('🎟️ EVENT SECURED', 2000, {
      body: `Your ticket for ${tickets[0]?.eventName || 'VORTEX EVENT'} is confirmed. Access your QR code in My Tickets.`,
      icon: '/vortex-logo.png'
    })

    navigate('/success')
  }

  const getButtonClass = (method: PaymentMethod) => {
    const base = "flex flex-col items-center justify-center p-4 font-accent text-[8px] transition-all "
    if (activeMethod === method) {
      return base + "bg-primary text-black font-bold shadow-[0_0_15px_rgba(203,255,0,0.2)] scale-105 z-10"
    }
    return base + "border border-zinc-800 text-zinc-400 hover:border-white hover:text-white bg-black/40"
  }

  return (
    <>
    {!queuePassed && (
      <LiveQueue
        eventName={checkoutItems[0]?.title || 'VORTEX_EVENT'}
        onComplete={() => setQueuePassed(true)}
      />
    )}
    <main className={`max-w-[1440px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 ${!queuePassed ? 'opacity-0 pointer-events-none' : 'animate-in fade-in duration-500'}`}>
      <section className="reveal flex flex-col gap-6">
        <div>
          <h1 className="font-display text-5xl md:text-7xl leading-none text-primary">ORDER_SUMMARY</h1>
          <p className="font-accent text-[8px] uppercase tracking-widest text-primary mt-4 flex items-center gap-2">
            <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#CBFF00]" />
            PROTOCOL_STATUS: VERIFIED // ENCRYPTION: AES-256-GCM
          </p>
        </div>

        <div className="relative border-4 border-primary p-6 md:p-10 bg-black/40 mt-4 shadow-[0_0_20px_rgba(203,255,0,0.1)]">
          <div className="absolute top-4 right-4 font-accent text-[8px] text-zinc-500 text-right tracking-widest uppercase">
            REF_ID: VR-992-XC
            <br />
            TIMESTAMP: 2025.04.12_04:00
          </div>

          <div className="flex gap-6 items-start mt-6 mb-12 border-b border-dashed border-zinc-600 pb-12">
            <div className="w-[120px] h-[160px] border border-primary shrink-0 relative overflow-hidden bg-zinc-900 group">
              <img
                alt="Neon Chaos Event Poster"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5mp-WOImDCtb73Ca1NFmIt1welAuuSQXwMCZ_dey2ftzBzn_Ql_y_Oi7kwhGIox5c2aPxepI50EZ92Cq6EtVhi-JRdEFB-_jlOeVIRMa0XhkcEcFGdW6h-fblPg_SRktbcTRJapXyULn3NKrD__6w88TNPyYGJveVEVjSQzIZF0sofs7KTy1KP8N401cBNYuumlVlM12MKGguLXmi-rqI-d5AQU6pYPk72mSHR-hbLG2iEls2y_VkxqVT4RRer1ZJCGykkrgL3y8"
              />
            </div>
            <div className="flex flex-col mt-2">
              <h2 className="font-display text-3xl md:text-4xl text-white leading-none">NEON CHAOS <span className="text-zinc-400">2025</span></h2>
              <p className="font-accent text-[8px] text-hot-coral uppercase tracking-widest mt-2 mb-1">SYSTEM_LOCATION: UNDISCLOSED_WAREHOUSE</p>
              <p className="font-accent text-[8px] text-zinc-400 tracking-widest uppercase">ADMISSION: DIGITAL_TICKET_STUB</p>
            </div>
          </div>

          <div className="font-accent text-[10px] mb-8 space-y-4 tracking-widest uppercase border-b border-dashed border-zinc-600 pb-8">
            {checkoutItems.length > 0 ? checkoutItems.map((item: any, idx: number) => (
              <div key={item.id} className="flex flex-col gap-2 border border-zinc-800 p-4 bg-black/60 relative">
                <div className="absolute top-0 right-0 bg-primary text-black font-bold px-2 py-0.5 text-[8px]">
                  TICKET {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-zinc-500">TICKET_ID</span>
                  <span className="text-white">{item.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ITEM_DESC</span>
                  <span className="text-white">{item.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">TIER_PHASE</span>
                  <span className="text-white">{item.phase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ASSIGNED_TO</span>
                  <span className="text-primary font-bold">{item.assignedName || "UNASSIGNED"}</span>
                </div>
              </div>
            )) : (
               <div className="p-4 border border-zinc-800 text-zinc-500 text-center">NO_ITEMS_FOUND</div>
            )}
          </div>

          <div className="font-accent text-[10px] space-y-4 tracking-widest uppercase">
            <div className="flex justify-between border-b border-zinc-800 pb-3">
              <span className="text-zinc-500">SUBTOTAL</span>
              <span className="text-white">{subtotal.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-3">
              <span className="text-zinc-500">TAX_AND_SERVICE</span>
              <span className="text-white">{(tax + serviceFee).toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between pt-4">
              <span className="font-bold text-sm text-primary">TOTAL_PAYABLE</span>
              <span className="font-bold text-sm text-primary">{total.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="mt-12 border-t-2 border-white/20 pt-6">
            <div className="h-12 w-full flex gap-1">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="h-full bg-white" style={{ width: Math.random() * 4 + 1 + 'px' }} />
              ))}
            </div>
            <p className="text-center font-mono text-[8px] text-zinc-500 mt-2 tracking-widest">
              0 0 1 0 1 1 0 1 0 0 1 0 1 1 0
            </p>
          </div>
        </div>
      </section>

      <section className="reveal flex flex-col gap-8">
        <h2 className="font-display text-3xl text-white border-b-2 border-primary pb-2 uppercase tracking-wide">
          SELECT_PROTOCOL
        </h2>

        <div className="grid grid-cols-4 gap-4">
          <button onClick={() => setActiveMethod('QRIS')} className={getButtonClass('QRIS')}>
            <span className="material-symbols-outlined mb-2 text-xl">qr_code_2</span>
            QRIS
          </button>
          <button onClick={() => setActiveMethod('CARD')} className={getButtonClass('CARD')}>
            <span className="material-symbols-outlined mb-2 text-xl">credit_card</span>
            CARD
          </button>
          <button onClick={() => setActiveMethod('E-WALLET')} className={getButtonClass('E-WALLET')}>
            <span className="material-symbols-outlined mb-2 text-xl">account_balance_wallet</span>
            E-WALLET
          </button>
          <button onClick={() => setActiveMethod('CRYPTO')} className={getButtonClass('CRYPTO')}>
            <span className="material-symbols-outlined mb-2 text-xl">currency_bitcoin</span>
            CRYPTO
          </button>
        </div>
        
        {activeMethod === 'QRIS' && (
          <div className="p-8 border border-zinc-800 mt-4 bg-black/50 flex flex-col items-center gap-6 min-h-[300px] justify-center reveal">
            <div className="relative p-2 bg-white flex items-center justify-center w-56 h-56">
              <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full p-2 border-2 border-black">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className={i % 5 === 0 ? 'bg-black' : 'bg-black/20'} />
                ))}
              </div>
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-primary" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-primary" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-primary" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-primary" />
            </div>
            <div className="text-center font-accent space-y-2 mt-4">
              <p className="text-[8px] tracking-widest text-zinc-500 uppercase">SCAN TO EXECUTE TRANSACTION</p>
              <p className="text-[10px] font-bold text-hot-coral tracking-widest uppercase">EXPIRES IN: 14:59</p>
            </div>
          </div>
        )}

        {activeMethod === 'CARD' && (
          <div className="space-y-4 mt-4 reveal">
            <div className="font-accent text-[8px] uppercase tracking-widest text-zinc-500">
              CARD_DATA // SEQUENCE_01
              <input 
                type="text" 
                placeholder="XXXX XXXX XXXX XXXX" 
                className="w-full mt-2 bg-black/50 border border-zinc-800 p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-colors" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="font-accent text-[8px] uppercase tracking-widest text-zinc-500">
                  EXPIRY_LINK
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="w-full mt-2 bg-black/50 border border-zinc-800 p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-colors" 
                  />
               </div>
               <div className="font-accent text-[8px] uppercase tracking-widest text-zinc-500">
                  CVV_CODE
                  <input 
                    type="password" 
                    placeholder="***" 
                    className="w-full mt-2 bg-black/50 border border-zinc-800 p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-colors" 
                  />
               </div>
            </div>
          </div>
        )}

        {activeMethod === 'E-WALLET' && (
          <div className="space-y-4 mt-4 reveal">
            <div className="grid grid-cols-3 gap-4 mb-6">
               {['GoPay', 'OVO', 'DANA'].map(wallet => (
                 <button key={wallet} className="border border-zinc-800 bg-black/40 p-4 text-zinc-400 hover:text-white hover:border-white font-accent text-xs transition-colors">
                   {wallet}
                 </button>
               ))}
            </div>
            <div className="font-accent text-[8px] uppercase tracking-widest text-zinc-500">
              LINKED_PHONE_NUMBER
              <input 
                type="tel" 
                placeholder="+62 8XX XXXX XXXX" 
                className="w-full mt-2 bg-black/50 border border-zinc-800 p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-colors" 
              />
            </div>
          </div>
        )}

        {activeMethod === 'CRYPTO' && (
          <div className="space-y-4 mt-4 reveal">
            <div className="font-accent text-[8px] uppercase tracking-widest text-zinc-500 mb-4">
              SUPPORTED_NETWORKS: ETHEREUM, POLYGON, SOLANA
            </div>
            <button className="w-full border border-primary text-primary font-accent font-bold text-[10px] tracking-widest uppercase py-6 hover:bg-primary hover:text-black transition-colors flex justify-center items-center gap-2 mt-4 shadow-[0_0_15px_rgba(203,255,0,0.1)]">
              <span className="material-symbols-outlined text-sm">link</span> CONNECT_WEB3_WALLET
            </button>
            <p className="text-center font-accent text-[8px] text-zinc-500 uppercase tracking-widest mt-4">
              ENSURE YOU HAVE SUFFICIENT GAS FOR THE TRANSACTION
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2 relative">
          <button
            onClick={handleExecutePayment}
            disabled={cart.length === 0}
            className={`group relative w-full py-5 text-black border-r-8 transition-all flex justify-between items-center px-8 ${
              cart.length > 0 
                ? 'bg-primary border-r-hot-coral shadow-[0_0_20px_rgba(203,255,0,0.15)] hover:shadow-[0_0_30px_rgba(203,255,0,0.3)] cursor-pointer' 
                : 'bg-zinc-700 border-r-zinc-800 cursor-not-allowed text-zinc-500'
            }`}
          >
            <span className="font-display text-4xl leading-none uppercase tracking-wide">EXECUTE_PAYMENT</span>
            <span className="material-symbols-outlined text-3xl font-bold group-hover:translate-x-2 transition-transform">
              keyboard_arrow_right
            </span>
          </button>
          <p className="font-accent text-[6px] tracking-widest text-zinc-500 uppercase text-center mt-2 leading-relaxed max-w-sm mx-auto">
             BY CLICKING EXECUTE, YOU AUTHORIZE THE VORTEX PROTOCOL TO PROCESS THE TRANSACTION. NO REFUNDS IN THE UNDERGROUND.
          </p>
        </div>
      </section>
    </main>
    </>
  )
}
