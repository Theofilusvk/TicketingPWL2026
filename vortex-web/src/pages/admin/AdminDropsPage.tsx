import { useState, useRef } from 'react'
import { useStore, type DropData } from '../../lib/store'

export function AdminDropsPage() {
  const { drops, deleteDrop, addDrop } = useStore()
  const [showModal, setShowModal] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [newDrop, setNewDrop] = useState<Partial<DropData>>({
    title: '',
    price: 5000,
    image: '',
    rarity: 'RARE',
    stock: 100,
    reqTier: 'SQUIRE'
  })

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
      setNewDrop(prev => ({ ...prev, image: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDrop.title || !newDrop.image) return
    
    addDrop({
      ...newDrop as DropData,
      id: `drop-${Date.now()}`
    })
    setShowModal(false)
    setNewDrop({
      title: '',
      price: 5000,
      image: '',
      rarity: 'RARE',
      stock: 100,
      reqTier: 'SQUIRE'
    })
    setImagePreview(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Merchandise Intel</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">Manage exclusive Drops and Inventory</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_-8px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add_shopping_cart</span>
          New Drop
        </button>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Asset</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Title</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Rarity</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Price (CRD)</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Stock</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
            {drops.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.03] transition-colors duration-300 group">
                <td className="p-5">
                  <div className="w-12 h-12 rounded-xl border border-white/[0.1] overflow-hidden shadow-inner">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="p-5 font-semibold text-sm text-white/90">{item.title}</td>
                <td className="p-5">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm ${
                    item.rarity === 'LEGENDARY' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]' :
                    item.rarity === 'EPIC' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' :
                    item.rarity === 'RARE' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' :
                    'bg-slate-500/10 text-slate-300 border-slate-500/20'
                  }`}>
                    {item.rarity}
                  </span>
                </td>
                <td className="p-5 font-mono text-sm font-medium text-white/60 tracking-wider whitespace-nowrap">{item.price.toLocaleString()}</td>
                <td className="p-5 font-mono text-sm font-medium text-white/60 tracking-wider whitespace-nowrap">{item.stock} Units</td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteDrop(item.id)} className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-500">
          <div className="bg-black/60 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 ease-out relative flex flex-col max-h-[90vh]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <h2 className="text-2xl font-semibold text-white mb-6 tracking-tight drop-shadow-sm shrink-0">Add Merchandise</h2>
            <div className="overflow-y-auto flex-1 pr-2 -mr-2">
              <form onSubmit={handleAdd} className="space-y-4 pb-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Title</label>
                  <input 
                    type="text" required 
                    value={newDrop.title} onChange={e => setNewDrop({...newDrop, title: e.target.value})}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20 shadow-inner" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Rarity</label>
                    <select 
                      value={newDrop.rarity} 
                      onChange={e => setNewDrop({...newDrop, rarity: e.target.value as any})}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 shadow-inner appearance-none"
                    >
                      <option value="COMMON" className="bg-zinc-900">COMMON</option>
                      <option value="RARE" className="bg-zinc-900">RARE</option>
                      <option value="EPIC" className="bg-zinc-900">EPIC</option>
                      <option value="LEGENDARY" className="bg-zinc-900">LEGENDARY</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Req Tier</label>
                    <select 
                      value={newDrop.reqTier} 
                      onChange={e => setNewDrop({...newDrop, reqTier: e.target.value as any})}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 shadow-inner appearance-none"
                    >
                      <option value="PHANTOM" className="bg-zinc-900">PHANTOM</option>
                      <option value="SQUIRE" className="bg-zinc-900">SQUIRE</option>
                      <option value="KNIGHT" className="bg-zinc-900">KNIGHT</option>
                      <option value="LORD" className="bg-zinc-900">LORD</option>
                      <option value="SOVEREIGN" className="bg-zinc-900">SOVEREIGN</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Price (CRD)</label>
                    <input 
                      type="number" required 
                      min="0"
                      value={newDrop.price} onChange={e => setNewDrop({...newDrop, price: parseInt(e.target.value)})}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Stock</label>
                    <input 
                      type="number" required 
                      min="0"
                      value={newDrop.stock} onChange={e => setNewDrop({...newDrop, stock: parseInt(e.target.value)})}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 shadow-inner" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Merchandise Image</label>
                  <div
                    onDrop={handleDropEvent}
                    onDragOver={handleDragOver}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden ${
                      isDragging 
                        ? 'border-indigo-400 bg-indigo-500/10' 
                        : 'border-white/[0.15] bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                    />
                    {imagePreview ? (
                      <div className="absolute inset-0">
                        <img src={imagePreview} alt="Drop preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium">Click to change</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-white/30">cloud_upload</span>
                        <p className="text-xs font-medium text-white/40">Drag & drop or click</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 pt-6 mt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3.5 rounded-2xl border border-white/[0.1] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] transition-all duration-300">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95">Deploy</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
