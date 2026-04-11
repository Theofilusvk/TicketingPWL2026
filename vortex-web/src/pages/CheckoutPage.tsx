import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore, type Ticket } from '../lib/store'
import { useAuth } from '../lib/auth'
import { LiveQueue } from '../components/LiveQueue'
import { useNotification } from '../lib/useNotification'

type PaymentMethod = 'QRIS' | 'CARD' | 'E-WALLET' | 'CRYPTO'

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
  
  const selectedIds = location.state?.selectedItems || []
  const checkoutItems = cart.filter(item => selectedIds.includes(item.id))
  
  // Determine item types
  const isTicketCheckout = checkoutItems.every(item => item.ticketId && item.eventId)
  const isMerchandiseCheckout = checkoutItems.every(item => item.image && !item.ticketId)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!isProcessing && !isSuccess && checkoutItems.length === 0) {
      navigate('/cart')
    }
  }, [checkoutItems.length, navigate, isProcessing, isSuccess])
  
  useEffect(() => {
    // Request permission when entering checkout so we can notify them later
    if (permission === 'default') {
      requestPermission()
    }
  }, [permission, requestPermission])

  // For merchandise, skip queue immediately
  useEffect(() => {
    if (isMerchandiseCheckout) {
      setQueuePassed(true)
    }
  }, [isMerchandiseCheckout])

  const subtotal = checkoutItems.reduce((acc, item) => acc + item.price, 0)
  const serviceFee = checkoutItems.length > 0 ? (isTicketCheckout ? 12.5 : 5.0) : 0
  const tax = subtotal * 0.08
  const total = subtotal + serviceFee + tax

  const handleExecutePayment = async () => {
    setIsProcessing(true);

    try {
      // Get token from localStorage with proper validation
      const token = localStorage.getItem('vortex.auth.token');
      if (!token) {
        throw new Error('You must be logged in to checkout. Redirecting to login...');
      }
      
      // Verify user is still authenticated
      if (!isAuthenticated || !user) {
        throw new Error('Session expired. Please log in again.');
      }
      
      console.log('Checkout initiated with token length:', token.length, 'User:', user?.displayName);
      
      if (isTicketCheckout) {
        // Handle ticket checkout with queue
        const itemsGrouped: Record<string, { eventId: number, phase: string, price: number, qty: number }> = {};
        checkoutItems.forEach(item => {
          if(item.ticketId && item.eventId) {
            const key = `${item.eventId}_${item.phase || 'N/A'}_${item.price}`;
            if (!itemsGrouped[key]) {
              itemsGrouped[key] = { eventId: parseInt(item.eventId), phase: item.phase || '', price: item.price, qty: 0 };
            }
            itemsGrouped[key].qty++;
          }
        });

        const apiItems = Object.values(itemsGrouped).map(g => ({
          event_id: g.eventId,
          phase: g.phase,
          price: g.price,
          quantity: g.qty
        }));

        const response = await fetch('/api/payment/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            items: apiItems,
            payment_method: activeMethod,
            is_merch: false
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || `Checkout failed (${response.status})`);
        }

        if (result.invoice_url) {
           sessionStorage.setItem('vortex_checkout_pending_items', JSON.stringify(checkoutItems.map(i => i.id)));
           window.location.href = result.invoice_url;
           return;
        }

        // Fallback for mock environment
        // Generate virtual tickets for frontend visualization
        const tickets: Ticket[] = checkoutItems
          .filter(item => item.ticketId)
          .map((item, idx) => {
            const event = events.find(e => e.id === item.eventId)
            return {
              id: result.data?.tickets?.[idx] || `ticket_${Math.random().toString(16).slice(2)}`,
              eventId: item.eventId || 'unknown',
              eventName: event?.name || item.title,
              venue: event?.venue || 'UNDISCLOSED WAREHOUSE',
              date: event?.date || '2025-02-14',
              tier: item.phase || 'GENERAL',
              gate: 'NORTH_02',
              orderId: `ORD-${result.data?.order_id || 'XXX'}`,
              purchaseDate: new Date().toISOString(),
              assignedName: item.assignedName || 'UNASSIGNED',
              ticketId: item.ticketId!,
            }
          })
        
        const earnedCredits = result.data?.earned_credits || 0;
        
        setIsSuccess(true);
        checkout([], earnedCredits, checkoutItems.map(i => i.id))
        
        // Schedule a push notification
        scheduleNotification('🎟️ EVENT SECURED', 2000, {
          body: `Your ticket for ${tickets[0]?.eventName || 'VORTEX EVENT'} is confirmed. Access your QR code in My Tickets.`,
          icon: '/vortex-logo.png'
        })

        navigate('/success', { state: { 
           orderId: result.data?.order_id,
           tickets: tickets,
           total: total
        } })
      } else if (isMerchandiseCheckout) {
        // Handle merchandise checkout (instant, no queue)
        console.log('Processing merchandise checkout for', checkoutItems.length, 'items');
        
        // Send items with title for backend lookup
        const apiItems = checkoutItems.map(item => ({
          title: item.title,
          quantity: 1 // Each cart item is 1 unit
        }));

        console.log('Sending merchandise request with items:', apiItems);

        const response = await fetch('/api/merchandise/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            items: apiItems,
            payment_method: activeMethod,
            shipping_address: location.state?.shippingAddress || ''
          })
        });

        console.log('Merchandise response status:', response.status);
        
        const result = await response.json();
        console.log('Merchandise response:', result);
        
        if (!response.ok) {
          throw new Error(result.message || `Merchandise checkout failed (${response.status})`);
        }

        const earnedCredits = result.data.earned_credits || 0;
        
        setIsSuccess(true);
        checkout([], earnedCredits, checkoutItems.map(i => i.id))
        
        // Schedule notification for merchandise
        scheduleNotification('📦 MERCHANDISE SECURED', 2000, {
          body: `Your merchandise order has been confirmed! Track your shipment in My Orders.`,
          icon: '/vortex-logo.png'
        })

        console.log('Redirecting to success page with order ID:', result.data.order_id);
        
        navigate('/success', { state: { 
           orderId: result.data.order_id,
           isMerchandise: true,
           items: checkoutItems,
           total: total
        } })
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err.message.includes('logged in')) {
        setTimeout(() => navigate('/login'), 1500);
      }
      alert("Error processing checkout: " + err.message);
    } finally {
      setIsProcessing(false);
    }
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
    {isTicketCheckout && !queuePassed && (
      <LiveQueue
        eventName={checkoutItems[0]?.title || 'VORTEX_EVENT'}
        onComplete={() => setQueuePassed(true)}
      />
    )}
    <main className={`max-w-[1440px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 ${!queuePassed ? 'opacity-0 pointer-events-none' : 'animate-in fade-in duration-500'}`}>
      <section className="reveal flex flex-col gap-6">
        <div>
          <h1 className="font-display text-5xl md:text-7xl leading-none text-primary">
            {isTicketCheckout ? 'ORDER_SUMMARY' : 'MERCHANDISE_ORDER'}
          </h1>
          <p className="font-accent text-[8px] uppercase tracking-widest text-primary mt-4 flex items-center gap-2">
            <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#CBFF00]" />
            PROTOCOL_STATUS: {isMerchandiseCheckout ? 'INSTANT_CHECKOUT // ENCRYPTED' : 'VERIFIED // ENCRYPTION: AES-256-GCM'}
          </p>
        </div>

        <div className="relative border-4 border-primary p-6 md:p-10 bg-black/40 mt-4 shadow-[0_0_20px_rgba(203,255,0,0.1)]">
          <div className="absolute top-4 right-4 font-accent text-[8px] text-zinc-500 text-right tracking-widest uppercase">
            REF_ID: VR-992-XC
            <br />
            TIMESTAMP: 2025.04.12_04:00
          </div>

          {isTicketCheckout ? (
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
          ) : (
            <div className="mb-12 border-b border-dashed border-zinc-600 pb-12">
              <p className="font-accent text-[8px] text-primary uppercase tracking-widest mb-4">MERCHANDISE_SHIPMENT</p>
              <p className="font-display text-3xl md:text-4xl text-white leading-none">{checkoutItems.length} ITEM(S) ACQUIRED</p>
            </div>
          )}

          <div className="font-accent text-[10px] mb-8 space-y-4 tracking-widest uppercase border-b border-dashed border-zinc-600 pb-8">
            {checkoutItems.length > 0 ? checkoutItems.map((item: any, idx: number) => (
              <div key={item.id} className="flex flex-col gap-2 border border-zinc-800 p-4 bg-black/60 relative">
                <div className="absolute top-0 right-0 bg-primary text-black font-bold px-2 py-0.5 text-[8px]">
                  {isTicketCheckout ? `TICKET ${String(idx + 1).padStart(2, '0')}` : `ITEM ${String(idx + 1).padStart(2, '0')}`}
                </div>
                {isTicketCheckout ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="flex justify-between pt-2">
                      <span className="text-zinc-500">PRODUCT_NAME</span>
                      <span className="text-white">{item.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">SKU</span>
                      <span className="text-white">{item.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">UNIT_PRICE</span>
                      <span className="text-white">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">QUANTITY</span>
                      <span className="text-primary font-bold">1x</span>
                    </div>
                  </>
                )}
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
