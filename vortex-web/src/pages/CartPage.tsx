import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'

export function CartPage() {
  const navigate = useNavigate()
  const { cart, removeFromCart } = useStore() // checkout removed as we navigate
  
  // Separation of cart types based on generated IDs or attributes 
  // (Merch vs Tickets)
  const ticketItems = cart.filter(item => item.ticketId !== undefined)
  const merchItems = cart.filter(item => item.image !== undefined)
  
  const [unselectedIds, setUnselectedIds] = useState<string[]>([])
  const toggleSelection = (id: string) => {
    setUnselectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  
  // Modal State
  const [isMerchModalOpen, setIsMerchModalOpen] = useState(false)
  
  // Delivery Form State - required ordered format: Name, Number, Email, Province, District, Address, Postal
  const [shippingForm, setShippingForm] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    address: '',
    postalCode: ''
  })
  
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value })
  }

  // Cost Calculators
  const calculateCosts = (items: typeof cart) => {
    const subtotal = items.reduce((sum, i) => sum + i.price, 0)
    const serviceFee = items.length > 0 ? (items === ticketItems ? 12.5 : 5.0) : 0 
    const tax = subtotal * 0.08
    const total = subtotal + serviceFee + tax
    return { subtotal, serviceFee, tax, total }
  }

  const activeTicketItems = ticketItems.filter(i => !unselectedIds.includes(i.id))
  const activeMerchItems = merchItems.filter(i => !unselectedIds.includes(i.id))

  const ticketCosts = calculateCosts(activeTicketItems)
  const merchCosts = calculateCosts(activeMerchItems)

  const handleCheckoutTickets = () => {
    if (activeTicketItems.length === 0) return
    navigate('/checkout', { state: { selectedItems: activeTicketItems.map(i => i.id) } })
  }

  const handleCheckoutMerch = () => {
    if (activeMerchItems.length === 0) return
    // Validate shipping form
    if (Object.values(shippingForm).some(v => v.trim() === '')) {
      alert('Please fill out all routing information fields.')
      return
    }
    
    setIsMerchModalOpen(false)
    navigate('/checkout', { state: { selectedItems: activeMerchItems.map(i => i.id) } })
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 mb-20 flex flex-col gap-12">
      <section className="reveal">
        <h1 className="font-display text-5xl md:text-7xl mb-8 border-b-4 border-primary pb-2 inline-block">
          YOUR_CART
        </h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          
          {/* VIRTUAL CARRIERS (TICKETS) */}
          <div className="flex flex-col gap-6">
            <h2 className="font-accent text-xs tracking-widest text-zinc-500 uppercase border-b border-zinc-800 pb-2">
              <span className="material-symbols-outlined text-[10px] mr-2">confirmation_number</span>
              VIRTUAL_ASSETS // PROTOCOL_ACCESS
            </h2>
            
            <div className="flex flex-col gap-4 border border-zinc-800 p-6 bg-black/40 h-full">
              {ticketItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-zinc-600 font-accent text-[10px] uppercase tracking-widest border border-dashed border-zinc-800 p-8">
                  NO TICKETS SELECTED
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                    {ticketItems.map(item => (
                      <div key={item.id} className="flex justify-between items-start border-b border-zinc-800 pb-4">
                        <div className="flex gap-4 items-start">
                          <input 
                            type="checkbox" 
                            checked={!unselectedIds.includes(item.id)} 
                            onChange={() => toggleSelection(item.id)}
                            className="w-4 h-4 mt-1 accent-primary bg-black border-zinc-700"
                          />
                          <div>
                            <p className="font-display text-xl text-primary">{item.phase}</p>
                            <p className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase mt-1">
                              {item.ticketId} // {item.title}
                            </p>
                            <p className="font-accent text-[8px] text-zinc-400 tracking-widest uppercase mt-1">
                              ASSIGNED: {item.assignedName}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-mono text-white text-sm">${item.price.toFixed(2)}</span>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-zinc-600 hover:text-hot-coral transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-primary space-y-2 font-accent text-[10px] uppercase tracking-widest text-zinc-400">
                     <div className="flex justify-between">
                       <span>SUBTOTAL</span>
                       <span className="font-mono text-white">${ticketCosts.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>SERVICE_FEE</span>
                       <span className="font-mono text-white">${ticketCosts.serviceFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>TAX (8%)</span>
                       <span className="font-mono text-white">${ticketCosts.tax.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between pt-4 mt-2 border-t border-zinc-700">
                       <span className="text-sm font-bold text-primary">TOTAL</span>
                       <span className="font-display text-3xl text-primary">${ticketCosts.total.toFixed(2)}</span>
                     </div>
                  </div>

                  <button 
                    onClick={handleCheckoutTickets}
                    disabled={activeTicketItems.length === 0}
                    className={`w-full py-4 mt-4 font-display text-2xl uppercase transition-colors ${
                      activeTicketItems.length > 0
                        ? 'bg-primary text-black hover:bg-white'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    CHECKOUT TICKETS
                  </button>
                </>
              )}
            </div>
          </div>

          {/* PHYSICAL CARRIERS (MERCHANDISE) */}
          <div className="flex flex-col gap-6">
            <h2 className="font-accent text-xs tracking-widest text-zinc-500 uppercase border-b border-zinc-800 pb-2">
              <span className="material-symbols-outlined text-[10px] mr-2">shopping_bag</span>
              PHYSICAL_ASSETS // MERCHANDISE
            </h2>
            
            <div className="flex flex-col gap-4 border border-zinc-800 p-6 bg-black/40 h-full">
              {merchItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-zinc-600 font-accent text-[10px] uppercase tracking-widest border border-dashed border-zinc-800 p-8">
                  NO MERCHANDISE SELECTED
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
                    {merchItems.map(item => (
                      <div key={item.id} className="flex gap-4 border-b border-zinc-800 pb-4 items-center">
                        <input 
                          type="checkbox" 
                          checked={!unselectedIds.includes(item.id)} 
                          onChange={() => toggleSelection(item.id)}
                          className="w-4 h-4 accent-hot-coral bg-black border-zinc-700 shrink-0"
                        />
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover grayscale opacity-80" />
                        <div className="flex-1">
                          <p className="font-display text-xl text-hot-coral">{item.title}</p>
                          <p className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase mt-1">
                            {item.id} // SECURE_SHIPPING
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="font-mono text-white text-sm">${item.price.toFixed(2)}</span>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-zinc-600 hover:text-hot-coral transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-hot-coral space-y-2 font-accent text-[10px] uppercase tracking-widest text-zinc-400">
                     <div className="flex justify-between">
                       <span>SUBTOTAL</span>
                       <span className="font-mono text-white">${merchCosts.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>SHIPPING_FEE</span>
                       <span className="font-mono text-white">${merchCosts.serviceFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span>TAX (8%)</span>
                       <span className="font-mono text-white">${merchCosts.tax.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between pt-4 mt-2 border-t border-zinc-700">
                       <span className="text-sm font-bold text-hot-coral">TOTAL</span>
                       <span className="font-display text-3xl text-hot-coral">${merchCosts.total.toFixed(2)}</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => setIsMerchModalOpen(true)}
                    disabled={activeMerchItems.length === 0}
                    className={`w-full py-4 mt-4 font-display text-2xl uppercase transition-colors ${
                      activeMerchItems.length > 0
                        ? 'bg-hot-coral text-black hover:bg-white'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    CHECKOUT MERCHANDISE
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* MERCHANDISE DELIVERY MODAL */}
      {isMerchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-zinc-950 border-2 border-hot-coral w-full max-w-2xl p-6 md:p-10 shadow-[0_0_50px_rgba(255,77,77,0.2)]">
            
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h3 className="font-display text-4xl text-hot-coral">PHYSICAL_DELIVERY_ROUTING</h3>
              <button 
                onClick={() => setIsMerchModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest mb-6">
              INPUT TARGET COORDINATES FOR ITEM DROP. VERIFY ALL DATA POINTS.
            </p>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleCheckoutMerch(); }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 font-accent text-xs uppercase"
            >
              {/* Ordered Fields: Nama, Nomor HP, Email, Provinsi, Kabupaten, Alamat, Kode Pos */}
              <div className="space-y-1">
                <label className="text-[8px] tracking-widest text-zinc-500">NAMA_LENGKAP</label>
                <input required name="name" value={shippingForm.name} onChange={handleShippingChange} type="text" className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-hot-coral focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] tracking-widest text-zinc-500">NOMOR_TELEPON</label>
                <input required name="phone" value={shippingForm.phone} onChange={handleShippingChange} type="tel" className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-hot-coral focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[8px] tracking-widest text-zinc-500">EMAIL_ADDRESS</label>
                <input required name="email" value={shippingForm.email} onChange={handleShippingChange} type="email" className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-hot-coral focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] tracking-widest text-zinc-500">PROVINSI</label>
                <input required name="province" value={shippingForm.province} onChange={handleShippingChange} type="text" className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-hot-coral focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] tracking-widest text-zinc-500">KABUPATEN / KOTA</label>
                <input required name="district" value={shippingForm.district} onChange={handleShippingChange} type="text" className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-hot-coral focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[8px] tracking-widest text-zinc-500">ALAMAT_LENGKAP</label>
                <textarea required name="address" value={shippingForm.address} onChange={handleShippingChange} rows={3} className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-hot-coral focus:outline-none transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] tracking-widest text-zinc-500">KODE_POS</label>
                <input required name="postalCode" value={shippingForm.postalCode} onChange={handleShippingChange} type="text" className="w-full bg-black border border-zinc-800 p-3 text-white focus:border-hot-coral focus:outline-none transition-colors" />
              </div>

              <div className="md:col-span-2 mt-6 flex justify-end gap-4">
                <button type="button" onClick={() => setIsMerchModalOpen(false)} className="px-6 py-3 border border-zinc-700 text-zinc-400 hover:text-white transition-colors tracking-widest font-bold text-[10px]">
                  CANCEL
                </button>
                <button type="submit" className="px-8 py-3 bg-hot-coral text-black tracking-widest font-bold text-[10px] hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,77,77,0.3)]">
                  CONFIRM_DISPATCH
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </main>
  )
}
