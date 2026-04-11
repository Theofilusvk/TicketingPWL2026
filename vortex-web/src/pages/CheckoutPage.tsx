import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore, type Ticket } from '../lib/store'
import { useAuth } from '../lib/auth'
import { LiveQueue } from '../components/LiveQueue'
import { useNotification } from '../lib/useNotification'

type PaymentMethod = 'QRIS' | 'CARD' | 'E-WALLET' | 'BANK'

type BuyerInfo = {
  name: string
  email: string
  phone: string
}

type PassengerInfo = {
  name: string
  email: string
  phone: string
  usesBuyerInfo: boolean
}

type FormErrors = Record<string, string>

const BUYER_STORAGE_KEY = 'vortex.checkout.buyer'

function loadSavedBuyer(): BuyerInfo | null {
  try {
    const saved = localStorage.getItem(BUYER_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function saveBuyer(info: BuyerInfo) {
  localStorage.setItem(BUYER_STORAGE_KEY, JSON.stringify(info))
}

export function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart, checkout, events } = useStore()
  const { user, isAuthenticated } = useAuth()
  const { requestPermission, scheduleNotification, permission } = useNotification()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('CARD')
  const [queuePassed, setQueuePassed] = useState(false)
  const [step, setStep] = useState<'info' | 'payment'>('info')
  const [errors, setErrors] = useState<FormErrors>({})
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'processing' | 'success' | 'failed'>('idle')
  
  // Buyer info — pre-fill from profile/localStorage
  const savedBuyer = loadSavedBuyer()
  const [buyer, setBuyer] = useState<BuyerInfo>({
    name: savedBuyer?.name || user?.displayName || '',
    email: savedBuyer?.email || user?.email || '',
    phone: savedBuyer?.phone || '',
  })

  const selectedIds = location.state?.selectedItems || []
  const checkoutItems = cart.filter(item => selectedIds.includes(item.id))
  
  // Determine item types
  const isTicketCheckout = checkoutItems.every(item => item.ticketId && item.eventId)
  const isMerchandiseCheckout = checkoutItems.every(item => item.image && !item.ticketId)

  // Passenger info for each ticket
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    checkoutItems.map(() => ({ name: '', email: '', phone: '', usesBuyerInfo: true }))
  )

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!isProcessing && !isSuccess && checkoutItems.length === 0) navigate('/cart')
  }, [checkoutItems.length, navigate, isProcessing, isSuccess])
  
  useEffect(() => {
    if (permission === 'default') requestPermission()
  }, [permission, requestPermission])

  useEffect(() => {
    if (isMerchandiseCheckout) setQueuePassed(true)
  }, [isMerchandiseCheckout])

  // Auto-fill buyer from user profile when user data arrives
  useEffect(() => {
    if (user && !savedBuyer) {
      setBuyer(prev => ({
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || '',
      }))
    }
  }, [user])

  const updatePassenger = useCallback((idx: number, updates: Partial<PassengerInfo>) => {
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, ...updates } : p))
  }, [])

  const validateBuyerInfo = (): boolean => {
    const newErrors: FormErrors = {}
    if (!buyer.name.trim()) newErrors.buyerName = 'Nama buyer harus diisi'
    if (!buyer.email.trim()) newErrors.buyerEmail = 'Email harus diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) newErrors.buyerEmail = 'Format email tidak valid'
    if (!buyer.phone.trim()) newErrors.buyerPhone = 'Nomor telepon harus diisi'
    else if (buyer.phone.replace(/\D/g, '').length < 10) newErrors.buyerPhone = 'Nomor telepon minimal 10 digit'

    // Validate passengers that don't use buyer info
    passengers.forEach((p, i) => {
      if (!p.usesBuyerInfo) {
        if (!p.name.trim()) newErrors[`pass${i}Name`] = 'Nama penumpang harus diisi'
        if (!p.email.trim()) newErrors[`pass${i}Email`] = 'Email harus diisi'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) newErrors[`pass${i}Email`] = 'Format email tidak valid'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinueToPayment = () => {
    if (validateBuyerInfo()) {
      saveBuyer(buyer)
      setStep('payment')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price, 0)
  const serviceFee = checkoutItems.length > 0 ? (isTicketCheckout ? 12.5 : 5.0) : 0
  const tax = subtotal * 0.08
  const total = subtotal + serviceFee + tax

  const handleExecutePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus('pending')

    // Simulate Midtrans Snap payment flow
    await new Promise(r => setTimeout(r, 800))
    setPaymentStatus('processing')

    try {
      const token = localStorage.getItem('vortex.auth.token')
      if (!token) throw new Error('You must be logged in to checkout.')
      if (!isAuthenticated || !user) throw new Error('Session expired. Please log in again.')
      
      if (isTicketCheckout) {
        const itemsGrouped: Record<string, number> = {}
        checkoutItems.forEach(item => {
          if(item.ticketId && item.eventId) {
            const key = item.eventId.toString()
            itemsGrouped[key] = (itemsGrouped[key] || 0) + 1
          }
        })

        const apiItems = Object.keys(itemsGrouped).map(eventId => ({
          event_id: parseInt(eventId),
          quantity: itemsGrouped[eventId]
        }))

        const response = await fetch('/api/checkout/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
          credentials: 'include',
          body: JSON.stringify({
            items: apiItems,
            payment_method: activeMethod,
            buyer_info: buyer,
            passengers: passengers.map((p, i) => p.usesBuyerInfo ? buyer : { name: p.name, email: p.email, phone: p.phone }),
            is_merch: false
          })
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.message || `Checkout failed (${response.status})`)

        const tickets: Ticket[] = checkoutItems
          .filter(item => item.ticketId)
          .map((item, idx) => {
            const event = events.find(e => e.id === item.eventId)
            const pass = passengers[idx]
            const assignee = pass?.usesBuyerInfo ? buyer : pass
            return {
              id: result.data?.tickets?.[idx] || `ticket_${Math.random().toString(16).slice(2)}`,
              eventId: item.eventId || 'unknown',
              eventName: event?.name || item.title,
              venue: event?.venue || 'UNDISCLOSED WAREHOUSE',
              date: event?.date || '2025-02-14',
              tier: item.phase || 'GENERAL',
              gate: 'NORTH_02',
              orderId: `ORD-${result.data?.order_id || Math.random().toString(16).slice(2, 8).toUpperCase()}`,
              purchaseDate: new Date().toISOString(),
              assignedName: assignee?.name || buyer.name || 'UNASSIGNED',
              ticketId: item.ticketId!,
            }
          })
        
        const earnedCredits = result.data?.earned_credits || Math.round(total * 0.1)
        
        setPaymentStatus('success')
        await new Promise(r => setTimeout(r, 1200))
        setIsSuccess(true)
        checkout(tickets, earnedCredits, checkoutItems.map(i => i.id))
        
        scheduleNotification('🎟️ EVENT SECURED', 2000, {
          body: `Your ticket for ${tickets[0]?.eventName || 'VORTEX EVENT'} is confirmed.`,
          icon: '/vortex-logo.png'
        })

        navigate('/success', { state: { orderId: result.data?.order_id, tickets, total } })
      } else if (isMerchandiseCheckout) {
        const apiItems = checkoutItems.map(item => ({ title: item.title, quantity: 1 }))

        const response = await fetch('/api/merchandise/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
          credentials: 'include',
          body: JSON.stringify({ items: apiItems, payment_method: activeMethod, shipping_address: location.state?.shippingAddress || '' })
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.message || `Checkout failed (${response.status})`)

        const earnedCredits = result.data?.earned_credits || Math.round(total * 0.1)
        
        setPaymentStatus('success')
        await new Promise(r => setTimeout(r, 1200))
        setIsSuccess(true)
        checkout([], earnedCredits, checkoutItems.map(i => i.id))
        
        scheduleNotification('📦 MERCHANDISE SECURED', 2000, {
          body: `Your merchandise order has been confirmed!`,
          icon: '/vortex-logo.png'
        })

        navigate('/success', { state: { orderId: result.data?.order_id, isMerchandise: true, items: checkoutItems, total } })
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setPaymentStatus('failed')
      setTimeout(() => setPaymentStatus('idle'), 3000)
      if (err.message.includes('logged in')) setTimeout(() => navigate('/login'), 1500)
    } finally {
      setIsProcessing(false)
    }
  }

  const InputField = ({ label, value, onChange, error, type = 'text', placeholder, disabled = false }: {
    label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; placeholder?: string; disabled?: boolean
  }) => (
    <div className="space-y-1.5">
      <label className="font-accent text-[8px] uppercase tracking-widest text-zinc-400 flex justify-between">
        <span>/ {label}</span>
        {error && <span className="text-hot-coral normal-case tracking-normal">{error}</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className={`w-full bg-black/50 border p-3 text-white text-sm font-accent placeholder:text-zinc-700 focus:outline-none transition-all duration-300 ${
          error ? 'border-hot-coral focus:border-hot-coral shadow-[0_0_8px_rgba(255,75,75,0.2)]' :
          disabled ? 'border-zinc-800 text-zinc-500 cursor-not-allowed' :
          'border-zinc-800 focus:border-primary'
        }`}
      />
    </div>
  )

  const getMethodClass = (method: PaymentMethod) => {
    const base = "flex flex-col items-center justify-center p-4 font-accent text-[8px] transition-all "
    if (activeMethod === method) return base + "bg-primary text-black font-bold shadow-[0_0_15px_rgba(203,255,0,0.2)] scale-105 z-10"
    return base + "border border-zinc-800 text-zinc-400 hover:border-white hover:text-white bg-black/40"
  }

  return (
    <>
    {isTicketCheckout && !queuePassed && (
      <LiveQueue
        eventName={checkoutItems[0]?.title || 'VORTEX_EVENT'}
        onComplete={() => setQueuePassed(true)}
      />
    )}
    <main className={`max-w-[1440px] mx-auto px-4 lg:px-8 py-8 mb-20 ${!queuePassed ? 'opacity-0 pointer-events-none' : 'animate-in fade-in duration-500'}`}>
      
      {/* Step Progress */}
      <div className="flex items-center gap-4 mb-10 font-accent text-[10px] tracking-widest uppercase">
        <div className={`flex items-center gap-2 ${step === 'info' ? 'text-primary' : 'text-zinc-500'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${step === 'info' ? 'border-primary bg-primary/20' : 'border-zinc-700 bg-zinc-800'}`}>1</span>
          BUYER INFO
        </div>
        <div className="flex-1 h-px bg-zinc-800 relative">
          <div className={`absolute inset-y-0 left-0 bg-primary transition-all duration-500 ${step === 'payment' ? 'w-full' : 'w-0'}`} />
        </div>
        <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-zinc-500'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${step === 'payment' ? 'border-primary bg-primary/20' : 'border-zinc-700 bg-zinc-800'}`}>2</span>
          PAYMENT
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* LEFT COLUMN */}
        <section className="reveal flex flex-col gap-6">
          <div>
            <h1 className="font-display text-5xl md:text-6xl leading-none text-primary">
              {step === 'info' ? 'BUYER_INFO' : 'ORDER_SUMMARY'}
            </h1>
            <p className="font-accent text-[8px] uppercase tracking-widest text-primary mt-4 flex items-center gap-2">
              <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#CBFF00]" />
              PROTOCOL_STATUS: {step === 'info' ? 'DATA_COLLECTION' : 'VERIFIED // ENCRYPTION: AES-256-GCM'}
            </p>
          </div>

          {step === 'info' ? (
            /* STEP 1: Buyer Info Form */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Buyer Details */}
              <div className="relative border-4 border-primary p-6 md:p-8 bg-black/40 shadow-[0_0_20px_rgba(203,255,0,0.1)]">
                <div className="absolute top-3 right-3 font-accent text-[8px] text-zinc-600 tracking-widest uppercase">BUYER_DATA</div>
                <h3 className="font-display text-2xl text-white mb-6">PRIMARY_BUYER</h3>
                
                <div className="space-y-4">
                  <InputField label="FULL_NAME" value={buyer.name} onChange={v => setBuyer(p => ({...p, name: v}))} error={errors.buyerName} placeholder="Enter your full name" />
                  <InputField label="EMAIL" value={buyer.email} onChange={v => setBuyer(p => ({...p, email: v}))} error={errors.buyerEmail} type="email" placeholder="your@email.com" />
                  <InputField label="PHONE_NUMBER" value={buyer.phone} onChange={v => setBuyer(p => ({...p, phone: v}))} error={errors.buyerPhone} type="tel" placeholder="+62 8XX XXXX XXXX" />
                </div>

                {savedBuyer && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-400 font-accent text-[8px] tracking-widest uppercase">
                    <span className="material-symbols-outlined text-xs">cached</span>
                    AUTO-FILLED FROM PREVIOUS SESSION
                  </div>
                )}
              </div>

              {/* Passenger Assignment (for tickets) */}
              {isTicketCheckout && checkoutItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-display text-xl text-white flex items-center gap-2">
                    TICKET_ASSIGNMENTS
                    <span className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mt-1">({checkoutItems.length} ticket{checkoutItems.length > 1 ? 's' : ''})</span>
                  </h3>
                  
                  {checkoutItems.map((item, idx) => {
                    const event = events.find(e => e.id === item.eventId)
                    const pass = passengers[idx]
                    return (
                      <div key={item.id} className="border border-zinc-800 bg-black/60 p-5 relative">
                        <div className="absolute top-0 right-0 bg-primary text-black font-bold px-2.5 py-0.5 text-[8px] font-accent">
                          TICKET {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="flex items-center gap-3 mb-4 pr-16">
                          <span className="material-symbols-outlined text-primary text-lg">confirmation_number</span>
                          <div>
                            <p className="font-accent text-xs text-white tracking-wide">{event?.name || item.title}</p>
                            <p className="font-accent text-[8px] text-zinc-500">{item.phase || 'GENERAL'} • {item.ticketId}</p>
                          </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group mb-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            pass?.usesBuyerInfo ? 'bg-primary border-primary' : 'border-zinc-600 hover:border-zinc-400'
                          }`} onClick={() => updatePassenger(idx, { usesBuyerInfo: !pass?.usesBuyerInfo })}>
                            {pass?.usesBuyerInfo && <span className="material-symbols-outlined text-black text-sm">check</span>}
                          </div>
                          <span className="font-accent text-[10px] text-zinc-300 tracking-widest uppercase group-hover:text-white transition-colors">
                            ASSIGN_TO_BUYER ({buyer.name || 'ME'})
                          </span>
                        </label>

                        {!pass?.usesBuyerInfo && (
                          <div className="space-y-3 ml-8 border-l-2 border-zinc-800 pl-4 animate-in slide-in-from-top-2 duration-300">
                            <InputField label="PASSENGER_NAME" value={pass?.name || ''} onChange={v => updatePassenger(idx, { name: v })} error={errors[`pass${idx}Name`]} placeholder="Name on ticket" />
                            <InputField label="PASSENGER_EMAIL" value={pass?.email || ''} onChange={v => updatePassenger(idx, { email: v })} error={errors[`pass${idx}Email`]} type="email" placeholder="passenger@email.com" />
                            <InputField label="PASSENGER_PHONE" value={pass?.phone || ''} onChange={v => updatePassenger(idx, { phone: v })} type="tel" placeholder="+62 8XX XXXX XXXX" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                onClick={handleContinueToPayment}
                className="group relative w-full py-5 bg-primary text-black border-r-8 border-r-hot-coral shadow-[0_0_20px_rgba(203,255,0,0.15)] hover:shadow-[0_0_30px_rgba(203,255,0,0.3)] transition-all flex justify-between items-center px-8"
              >
                <span className="font-display text-3xl leading-none uppercase tracking-wide">CONTINUE_TO_PAYMENT</span>
                <span className="material-symbols-outlined text-3xl font-bold group-hover:translate-x-2 transition-transform">
                  keyboard_arrow_right
                </span>
              </button>
            </div>
          ) : (
            /* STEP 2: Order Summary */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative border-4 border-primary p-6 md:p-8 bg-black/40 shadow-[0_0_20px_rgba(203,255,0,0.1)]">
                <div className="absolute top-4 right-4 font-accent text-[8px] text-zinc-500 text-right tracking-widest uppercase">
                  REF_ID: VR-{Math.random().toString(16).slice(2, 6).toUpperCase()}
                </div>

                {/* Buyer Summary */}
                <div className="mb-6 border-b border-dashed border-zinc-600 pb-6">
                  <p className="font-accent text-[8px] text-primary uppercase tracking-widest mb-3">BUYER_DETAILS</p>
                  <div className="font-accent text-[10px] tracking-widest uppercase space-y-2">
                    <div className="flex justify-between"><span className="text-zinc-500">NAME</span><span className="text-white">{buyer.name}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">EMAIL</span><span className="text-white">{buyer.email}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">PHONE</span><span className="text-white">{buyer.phone}</span></div>
                  </div>
                  <button onClick={() => setStep('info')} className="mt-3 font-accent text-[8px] text-primary/60 hover:text-primary transition-colors tracking-widest uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">edit</span> EDIT_INFO
                  </button>
                </div>

                {/* Items List */}
                <div className="font-accent text-[10px] mb-6 space-y-4 tracking-widest uppercase border-b border-dashed border-zinc-600 pb-6">
                  {checkoutItems.map((item, idx) => {
                    const pass = passengers[idx]
                    const assignee = pass?.usesBuyerInfo ? buyer : pass
                    return (
                      <div key={item.id} className="flex flex-col gap-2 border border-zinc-800 p-4 bg-black/60 relative">
                        <div className="absolute top-0 right-0 bg-primary text-black font-bold px-2 py-0.5 text-[8px]">
                          {isTicketCheckout ? `TICKET ${String(idx + 1).padStart(2, '0')}` : `ITEM ${String(idx + 1).padStart(2, '0')}`}
                        </div>
                        <div className="flex justify-between pt-2"><span className="text-zinc-500">ITEM_DESC</span><span className="text-white">{item.title}</span></div>
                        {isTicketCheckout && (
                          <>
                            <div className="flex justify-between"><span className="text-zinc-500">TIER</span><span className="text-white">{item.phase}</span></div>
                            <div className="flex justify-between"><span className="text-zinc-500">ASSIGNED_TO</span><span className="text-primary font-bold">{assignee?.name || 'UNASSIGNED'}</span></div>
                          </>
                        )}
                        <div className="flex justify-between"><span className="text-zinc-500">PRICE</span><span className="text-white">{item.price.toFixed(2)} USD</span></div>
                      </div>
                    )
                  })}
                </div>

                {/* Totals */}
                <div className="font-accent text-[10px] space-y-3 tracking-widest uppercase">
                  <div className="flex justify-between border-b border-zinc-800 pb-3">
                    <span className="text-zinc-500">SUBTOTAL</span><span className="text-white">{subtotal.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-3">
                    <span className="text-zinc-500">TAX_AND_SERVICE</span><span className="text-white">{(tax + serviceFee).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-bold text-sm text-primary">TOTAL_PAYABLE</span>
                    <span className="font-bold text-sm text-primary">{total.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN — Payment */}
        <section className={`reveal flex flex-col gap-8 ${step === 'info' ? 'opacity-40 pointer-events-none' : ''} transition-opacity duration-500`}>
          <h2 className="font-display text-3xl text-white border-b-2 border-primary pb-2 uppercase tracking-wide">
            SELECT_PROTOCOL
          </h2>

          <div className="grid grid-cols-4 gap-4">
            <button onClick={() => setActiveMethod('QRIS')} className={getMethodClass('QRIS')}>
              <span className="material-symbols-outlined mb-2 text-xl">qr_code_2</span>QRIS
            </button>
            <button onClick={() => setActiveMethod('CARD')} className={getMethodClass('CARD')}>
              <span className="material-symbols-outlined mb-2 text-xl">credit_card</span>CARD
            </button>
            <button onClick={() => setActiveMethod('E-WALLET')} className={getMethodClass('E-WALLET')}>
              <span className="material-symbols-outlined mb-2 text-xl">account_balance_wallet</span>E-WALLET
            </button>
            <button onClick={() => setActiveMethod('BANK')} className={getMethodClass('BANK')}>
              <span className="material-symbols-outlined mb-2 text-xl">account_balance</span>BANK
            </button>
          </div>
          
          {activeMethod === 'QRIS' && (
            <div className="p-8 border border-zinc-800 mt-4 bg-black/50 flex flex-col items-center gap-6 min-h-[300px] justify-center reveal">
              <div className="relative p-2 bg-white flex items-center justify-center w-52 h-52">
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
              <div className="text-center font-accent space-y-2 mt-2">
                <p className="text-[8px] tracking-widest text-zinc-500 uppercase">SCAN TO EXECUTE TRANSACTION</p>
                <p className="text-[10px] font-bold text-hot-coral tracking-widest uppercase">EXPIRES IN: 14:59</p>
              </div>
            </div>
          )}

          {activeMethod === 'CARD' && (
            <div className="space-y-4 mt-4 reveal">
              <div className="font-accent text-[8px] uppercase tracking-widest text-zinc-500">
                CARD_NUMBER
                <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full mt-2 bg-black/50 border border-zinc-800 p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="font-accent text-[8px] uppercase tracking-widest text-zinc-500">
                  EXPIRY_DATE
                  <input type="text" placeholder="MM/YY" className="w-full mt-2 bg-black/50 border border-zinc-800 p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="font-accent text-[8px] uppercase tracking-widest text-zinc-500">
                  CVV_CODE
                  <input type="password" placeholder="***" className="w-full mt-2 bg-black/50 border border-zinc-800 p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-colors" />
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
                <input type="tel" placeholder="+62 8XX XXXX XXXX" className="w-full mt-2 bg-black/50 border border-zinc-800 p-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          )}

          {activeMethod === 'BANK' && (
            <div className="space-y-4 mt-4 reveal">
              <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-4">SELECT_BANK_TRANSFER</p>
              <div className="grid grid-cols-2 gap-3">
                {['BCA', 'BNI', 'BRI', 'Mandiri'].map(bank => (
                  <button key={bank} className="border border-zinc-800 bg-black/40 p-4 text-zinc-400 hover:text-white hover:border-primary font-accent text-sm transition-colors tracking-wider">
                    {bank}
                  </button>
                ))}
              </div>
              <div className="border border-zinc-800 bg-black/50 p-5 mt-4 text-center">
                <p className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase mb-2">VIRTUAL_ACCOUNT_NUMBER</p>
                <p className="font-mono text-xl text-white tracking-[0.3em]">8800 1234 5678 9012</p>
                <p className="font-accent text-[8px] text-hot-coral tracking-widest uppercase mt-3">EXPIRES IN: 23:59:59</p>
              </div>
            </div>
          )}

          {/* Payment Status Indicator */}
          {paymentStatus !== 'idle' && (
            <div className={`border p-5 text-center font-accent text-[10px] tracking-widest uppercase animate-in fade-in duration-300 ${
              paymentStatus === 'pending' ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' :
              paymentStatus === 'processing' ? 'border-sky-500/30 bg-sky-500/5 text-sky-400' :
              paymentStatus === 'success' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' :
              'border-hot-coral/30 bg-hot-coral/5 text-hot-coral'
            }`}>
              <div className="flex items-center justify-center gap-3">
                {(paymentStatus === 'pending' || paymentStatus === 'processing') && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {paymentStatus === 'success' && <span className="material-symbols-outlined text-lg">check_circle</span>}
                {paymentStatus === 'failed' && <span className="material-symbols-outlined text-lg">error</span>}
                <span>
                  {paymentStatus === 'pending' && 'INITIATING_PAYMENT...'}
                  {paymentStatus === 'processing' && 'PROCESSING_TRANSACTION...'}
                  {paymentStatus === 'success' && 'PAYMENT_CONFIRMED'}
                  {paymentStatus === 'failed' && 'PAYMENT_FAILED — RETRY'}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 relative">
            <button
              onClick={handleExecutePayment}
              disabled={step !== 'payment' || isProcessing || paymentStatus === 'success'}
              className={`group relative w-full py-5 text-black border-r-8 transition-all flex justify-between items-center px-8 ${
                step === 'payment' && !isProcessing
                  ? 'bg-primary border-r-hot-coral shadow-[0_0_20px_rgba(203,255,0,0.15)] hover:shadow-[0_0_30px_rgba(203,255,0,0.3)] cursor-pointer' 
                  : 'bg-zinc-700 border-r-zinc-800 cursor-not-allowed text-zinc-500'
              }`}
            >
              <span className="font-display text-3xl leading-none uppercase tracking-wide">
                {isProcessing ? 'PROCESSING...' : 'EXECUTE_PAYMENT'}
              </span>
              <span className="material-symbols-outlined text-3xl font-bold group-hover:translate-x-2 transition-transform">
                {isProcessing ? 'hourglass_top' : 'keyboard_arrow_right'}
              </span>
            </button>
            <p className="font-accent text-[6px] tracking-widest text-zinc-500 uppercase text-center mt-2 leading-relaxed max-w-sm mx-auto">
               BY CLICKING EXECUTE, YOU AUTHORIZE THE VORTEX PROTOCOL TO PROCESS THE TRANSACTION. POWERED BY MIDTRANS SECURE GATEWAY.
            </p>
          </div>
        </section>

      </div>
    </main>
    </>
  )
}
