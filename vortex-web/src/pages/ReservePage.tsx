import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore, type CartItem } from '../lib/store'


export function ReservePage() {
  const { eventId } = useParams()
  const title = useMemo(() => (eventId ?? 'EVENT').replaceAll('-', ' ').toUpperCase(), [eventId])

  const [quantities, setQuantities] = useState<Record<string, number>>({
    general: 0,
    vip: 0,
    elite: 0,
  })

  const { cart, addToCart } = useStore()

  const [pendingSelection, setPendingSelection] = useState<{
    tierId: string;
    title: string;
    phase: string;
    price: number;
    qty: number;
  } | null>(null)
  
  const [assignmentData, setAssignmentData] = useState<{name: string, phone: string}[]>([])

  const handleUpdateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta),
    }))
  }

  const handleAddToCartClick = (tierId: string, itemTitle: string, phase: string, price: number) => {
    const qty = quantities[tierId]
    if (qty <= 0) return

    setPendingSelection({ tierId, title: itemTitle, phase, price, qty })
    setAssignmentData(Array(qty).fill({ name: '', phone: '' }))
  }

  const handleAssignmentChange = (index: number, field: 'name' | 'phone', value: string) => {
    setAssignmentData(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const confirmAddToCart = () => {
    if (!pendingSelection) return
    
    // Validate all fields are somewhat filled
    if (assignmentData.some(d => !d.name.trim() || !d.phone.trim())) {
      alert("Please fill out all assignment fields to proceed.")
      return
    }

    const newItems: CartItem[] = assignmentData.map((data) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: pendingSelection.title,
      phase: pendingSelection.phase,
      price: pendingSelection.price,
      assignedName: data.name,
      assignedPhone: data.phone,
      ticketId: `#VX-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`
    }))

    addToCart(newItems)
    setQuantities(prev => ({ ...prev, [pendingSelection.tierId]: 0 }))
    setPendingSelection(null)
    setAssignmentData([])
  }

  const cancelAddToCart = () => {
    setPendingSelection(null)
    setAssignmentData([])
  }

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0)
  const serviceFee = cart.length > 0 ? 12.5 : 0
  const tax = subtotal * 0.08
  const total = subtotal + serviceFee + tax

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
      <section className="reveal lg:col-span-8">
        <h1 className="font-display mb-8 flex items-center gap-4 text-5xl md:text-7xl">
          <span className="text-accent">/</span> {title} <span className="text-primary">TIERS</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col glass-card border-none hover-lift p-6">
            <div className="h-40 bg-gradient-to-b from-accent/20 to-transparent mb-6 relative overflow-hidden">
              <span className="absolute bottom-2 left-2 font-display text-4xl opacity-20">
                PHASE 01
              </span>
            </div>
            <h2 className="font-display text-3xl mb-1 text-white">GENERAL ENTRY</h2>
            <p className="font-accent text-[10px] text-zinc-500 mb-6 tracking-widest uppercase">BASE ACCESS + COMMEMORATIVE CARD</p>
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-4">
                <span className="font-display text-4xl text-white">$65</span>
                <div className="flex items-center gap-4 bg-black/40 border border-primary/20 px-3 py-1 font-mono text-sm">
                  <button onClick={() => handleUpdateQuantity('general', -1)} className="text-hot-coral hover:text-white transition-colors">-</button>
                  <span className="text-white w-4 text-center">{quantities.general}</span>
                  <button onClick={() => handleUpdateQuantity('general', 1)} className="text-primary hover:text-white transition-colors">+</button>
                </div>
              </div>
              <button
                onClick={() => handleAddToCartClick('general', 'GENERAL ENTRY', 'PHASE_01', 65)}
                className={`block w-full rounded-none font-accent font-bold text-xs py-4 text-center tracking-widest uppercase transition-colors border ${
                  quantities.general > 0
                    ? 'bg-hot-coral text-black border-hot-coral hover:bg-transparent hover:text-hot-coral'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                }`}
              >
                ADD TO CART
              </button>
            </div>
          </div>

          <div className="flex flex-col border-[3px] border-primary hover-lift p-6 relative bg-black/40">
            <div className="absolute -top-4 -right-2 bg-primary text-black font-accent font-bold px-3 py-1 text-[8px] tracking-widest uppercase z-10">
              SELLING FAST
            </div>
            <div className="h-40 bg-gradient-to-b from-primary/20 to-transparent mb-6 relative overflow-hidden">
              <span className="absolute bottom-2 left-2 font-display text-4xl opacity-20 text-primary">
                PHASE 02
              </span>
            </div>
            <h2 className="font-display text-3xl mb-1 text-white">VIP ACCESS</h2>
            <p className="font-accent text-[10px] text-zinc-400 mb-6 tracking-widest uppercase">FAST TRACK + VIP LOUNGE + 2 DRINKS</p>
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-4">
                <span className="font-display text-4xl text-white">$120</span>
                <div className="flex items-center gap-4 bg-black/40 border border-primary/20 px-3 py-1 font-mono text-sm">
                  <button onClick={() => handleUpdateQuantity('vip', -1)} className="text-hot-coral hover:text-white transition-colors">-</button>
                  <span className="text-white w-4 text-center">{quantities.vip}</span>
                  <button onClick={() => handleUpdateQuantity('vip', 1)} className="text-primary hover:text-white transition-colors">+</button>
                </div>
              </div>
              <button
                onClick={() => handleAddToCartClick('vip', 'VIP ACCESS', 'PHASE_02', 120)}
                className={`block w-full rounded-none font-accent font-bold text-xs py-4 text-center tracking-widest uppercase transition-colors border ${
                  quantities.vip > 0
                    ? 'bg-primary text-black border-primary hover:bg-transparent hover:text-primary'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                }`}
              >
                ADD TO CART
              </button>
            </div>
          </div>

          <div className="flex flex-col border-[3px] border-white hover-lift text-white p-6 bg-black/40">
            <div className="h-40 bg-gradient-to-br from-white/10 to-transparent mb-6 relative overflow-hidden">
              <span className="absolute bottom-2 left-2 font-display text-4xl opacity-20">ELITE</span>
            </div>
            <h2 className="font-display text-3xl mb-1 text-white">VORTEX PASS</h2>
            <p className="font-accent text-[10px] text-zinc-400 mb-6 tracking-widest uppercase">ALL ACCESS + SECRET ROOM</p>
            <div className="mt-auto">
              <div className="flex justify-between items-end mb-4">
                <span className="font-display text-4xl text-white">$250</span>
                <div className="flex items-center gap-4 bg-black/40 border border-primary/20 px-3 py-1 font-mono text-sm">
                  <button onClick={() => handleUpdateQuantity('elite', -1)} className="text-hot-coral hover:text-white transition-colors">-</button>
                  <span className="text-white w-4 text-center">{quantities.elite}</span>
                  <button onClick={() => handleUpdateQuantity('elite', 1)} className="text-primary hover:text-white transition-colors">+</button>
                </div>
              </div>
              <button
                onClick={() => handleAddToCartClick('elite', 'VORTEX PASS', 'ELITE', 250)}
                className={`block w-full rounded-none font-accent font-bold text-xs py-4 text-center tracking-widest uppercase transition-colors border ${
                  quantities.elite > 0
                    ? 'bg-white text-black border-white hover:bg-transparent hover:text-white'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                }`}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>

        {/* HISTORY LOG INSIDE LEFT COLUMN */}
        <div className="mt-16 reveal">
          <h2 className="font-display text-4xl text-white mb-6">HISTORY_LOG</h2>
          <div className="flex flex-col gap-4">
             <div className="bg-black/40 border-l-4 border-primary p-4 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-accent text-[8px] text-zinc-500 tracking-widest mb-1">2024_10_12</span>
                  <span className="font-display text-2xl text-white uppercase">CHROME RAVE</span>
                  <span className="font-accent text-[8px] text-primary uppercase tracking-widest mt-1">CONFIRMED</span>
                </div>
                <button className="border border-primary text-primary hover:bg-primary hover:text-black font-accent text-[10px] px-4 py-2 uppercase tracking-widest flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">qr_code_2</span> DOWNLOAD QR
                </button>
             </div>
             
             <div className="bg-black/40 border-l-4 border-hot-coral p-4 flex justify-between items-center opacity-60">
                <div className="flex flex-col">
                  <span className="font-accent text-[8px] text-zinc-500 tracking-widest mb-1">2024_08_30</span>
                  <span className="font-display text-2xl text-white uppercase">VOID SESSIONS</span>
                  <span className="font-accent text-[8px] text-hot-coral uppercase tracking-widest mt-1">ARCHIVED</span>
                </div>
                <button className="border border-hot-coral text-hot-coral hover:bg-hot-coral hover:text-black font-accent text-[10px] px-4 py-2 uppercase tracking-widest flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">history</span> VIEW RECEIPT
                </button>
             </div>
          </div>
        </div>

      </section>

      <aside className="reveal lg:col-span-4 flex flex-col gap-6">
        <div className="border-[3px] border-primary p-6 bg-black/40">
          <h2 className="font-display text-4xl text-primary mb-6 border-b-4 border-primary pb-2 inline-block">
            YOUR_CART
          </h2>
          
          <div className="flex flex-col gap-4 mb-8 min-h-[120px]">
            {cart.length === 0 ? (
              <p className="font-accent text-[10px] text-zinc-500 tracking-widest uppercase">
                Cart is empty
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex flex-col border-b border-primary/10 pb-4">
                   <div className="flex justify-between items-start">
                     <span className="font-accent text-white font-bold text-[10px] uppercase tracking-widest">
                        {item.title}
                     </span>
                     <span className="font-mono text-sm text-white">${item.price.toFixed(2)}</span>
                   </div>
                   <div className="font-accent text-zinc-500 text-[8px] uppercase tracking-widest mt-1 flex flex-col gap-0.5">
                     <span>{item.ticketId} // {item.phase}</span>
                     <span>ASSIGNED: {item.assignedName || "UNASSIGNED"}</span>
                   </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 font-accent text-[10px] uppercase tracking-widest border-b border-primary/30 pb-6 mb-6">
            <div className="flex justify-between">
              <span className="text-zinc-400">SUBTOTAL</span>
              <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">SERVICE_FEE</span>
              <span className="text-white font-mono">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">TAX (8%)</span>
              <span className="text-white font-mono">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <span className="font-display text-3xl text-white">TOTAL</span>
            <span className="font-mono text-4xl font-bold text-primary drop-shadow-[0_0_8px_rgba(203,255,0,0.5)]">
              ${total.toFixed(2)}
            </span>
          </div>

          <Link
            to={cart.length > 0 ? "/checkout" : "#"}
            state={{ selectedItems: cart.filter(c => c.ticketId).map(c => c.id) }}
            className={`block w-full py-5 font-accent font-bold text-lg text-center tracking-widest uppercase border transition-colors ${
              cart.length > 0
                ? 'bg-primary text-black border-primary hover:bg-transparent hover:text-primary shadow-[0_0_20px_rgba(203,255,0,0.3)]'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
            }`}
          >
            CONFIRM PURCHASE
          </Link>

          <div className="mt-6 flex items-center gap-3 bg-black/50 p-3 border border-primary/20">
             <span className="material-symbols-outlined text-primary">security</span>
             <p className="font-accent text-[8px] text-zinc-400 uppercase tracking-widest leading-loose">
               ENCRYPTION_ACTIVE // TRANSACTIONS ARE SECURED BY VORTEX PROTOCOL V4.0
             </p>
          </div>
        </div>

        {/* WARNING ALERT */}
        <div className="bg-hot-coral p-5 text-black">
           <p className="font-accent text-[10px] uppercase font-bold tracking-widest leading-loose">
             WARNING: ALL SALES ARE FINAL. TICKETS ARE LINKED TO NEON_PHANTOM BIOMETRIC SIGNATURE. SECONDARY MARKET RESALE PROHIBITED.
           </p>
        </div>
      </aside>

      {/* MODAL OVERLAY */}
      {pendingSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 border border-primary/50 relative overflow-y-auto max-h-[90vh]">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={cancelAddToCart} className="text-zinc-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <h2 className="font-display text-4xl text-primary mb-2">TICKET ASSIGNMENT</h2>
            <p className="font-accent text-[10px] text-zinc-400 tracking-widest uppercase mb-6">
              Assign a valid name and phone number to each {pendingSelection.title} ticket.
            </p>

            <div className="space-y-6 mb-8">
              {assignmentData.map((data, idx) => (
                <div key={idx} className="bg-black/40 border border-primary/20 p-4">
                  <h3 className="font-display text-2xl text-white mb-4">TICKET {idx + 1}</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block font-accent text-[10px] text-primary tracking-widest uppercase mb-1">
                        HOLDER NAME
                      </label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => handleAssignmentChange(idx, 'name', e.target.value)}
                        className="w-full bg-black/60 border border-zinc-700 text-white font-mono p-2 focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
                        placeholder="e.g. SARA LYNN"
                      />
                    </div>
                    <div>
                      <label className="block font-accent text-[10px] text-primary tracking-widest uppercase mb-1">
                        CONTACT PROTOCOL
                      </label>
                      <input
                        type="text"
                        value={data.phone}
                        onChange={(e) => handleAssignmentChange(idx, 'phone', e.target.value)}
                        className="w-full bg-black/60 border border-zinc-700 text-white font-mono p-2 focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
                        placeholder="e.g. 555-0199"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={cancelAddToCart}
                className="flex-1 py-3 border border-zinc-700 text-zinc-400 font-accent text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={confirmAddToCart}
                className="flex-1 py-3 bg-primary text-black font-accent text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_15px_rgba(203,255,0,0.3)]"
              >
                CONFIRM ASSIGNMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

