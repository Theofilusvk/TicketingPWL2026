import { useState } from 'react'
import { useStore } from '../lib/store'
import { useAudio } from '../lib/audio'

type Package = {
  id: string
  crd: number
  price: number
  bonus: number
  popular?: boolean
}

const PACKAGES: Package[] = [
  { id: 'pkg-1', crd: 1000, price: 10, bonus: 0 },
  { id: 'pkg-2', crd: 5000, price: 45, bonus: 500, popular: true },
  { id: 'pkg-3', crd: 10000, price: 85, bonus: 1500 },
]

export function PaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addCredits } = useStore()
  const { playClickSound, playHoverSound } = useAudio()
  
  const [selectedPkg, setSelectedPkg] = useState<Package>(PACKAGES[1])
  const [step, setStep] = useState<'SELECT' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('SELECT')
  
  const [cardNumber, setCardNumber] = useState('')
  const [exp, setExp] = useState('')
  const [cvv, setCvv] = useState('')

  if (!isOpen) return null

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    setStep('PROCESSING')
    
    setTimeout(() => {
      addCredits(selectedPkg.crd + selectedPkg.bonus)
      setStep('SUCCESS')
      playClickSound()
    }, 2000)
  }

  const closeAndReset = () => {
    onClose()
    setTimeout(() => {
      setStep('SELECT')
      setCardNumber('')
      setExp('')
      setCvv('')
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-zinc-950/80 backdrop-blur-[60px] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out flex flex-col">
        {/* Top Glows */}
        <div className="absolute top-0 left-1/4 w-1/2 h-20 bg-primary/20 blur-[60px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        <div className="flex justify-between items-center p-6 border-b border-white/[0.05]">
          <div>
            <h2 className="text-xl font-display text-white">SYSTEM TOP_UP</h2>
            <p className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase">Acquire network credits</p>
          </div>
          <button onClick={closeAndReset} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-6 relative min-h-[400px] flex flex-col justify-center">
          
          {step === 'SELECT' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                {PACKAGES.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => { setSelectedPkg(pkg); playHoverSound() }}
                    className={`w-full group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      selectedPkg.id === pkg.id 
                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(203,255,0,0.15)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 left-4 bg-primary text-black font-accent text-[8px] px-2 py-0.5 font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(203,255,0,0.5)]">Recommended</span>
                    )}
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPkg.id === pkg.id ? 'border-primary' : 'border-white/30 group-hover:border-white/50'}`}>
                        {selectedPkg.id === pkg.id && <div className="w-2 h-2 bg-primary rounded-full animate-in zoom-in" />}
                      </div>
                      <div>
                        <div className="font-mono text-xl text-white font-bold tracking-tight">
                          {pkg.crd.toLocaleString()} <span className="text-sm font-accent text-zinc-500 uppercase tracking-widest">CRD</span>
                        </div>
                        {pkg.bonus > 0 && <div className="font-accent text-[10px] text-primary mt-1 tracking-widest">+ {pkg.bonus.toLocaleString()} CRD BONUS</div>}
                      </div>
                    </div>
                    <div className="font-display text-2xl text-white">
                      ${pkg.price}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => { setStep('PAYMENT'); playClickSound() }} className="w-full py-4 rounded-2xl bg-white text-black font-bold font-accent uppercase tracking-widest text-xs hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95 transition-all">
                Proceed to Checkout
              </button>
            </div>
          )}

          {step === 'PAYMENT' && (
             <form onSubmit={handlePay} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center mb-6">
                 <div>
                   <span className="block font-accent text-[10px] text-zinc-400 uppercase tracking-widest">Total Amount</span>
                   <span className="font-display text-3xl text-white">${selectedPkg.price}</span>
                 </div>
                 <div className="text-right">
                   <span className="block font-accent text-[10px] text-zinc-400 uppercase tracking-widest">You Receive</span>
                   <span className="font-mono text-xl text-primary font-bold">{(selectedPkg.crd + selectedPkg.bonus).toLocaleString()} CRD</span>
                 </div>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block font-accent text-[9px] text-zinc-500 uppercase tracking-widest mb-1 pl-1">Card Number</label>
                   <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 material-symbols-outlined">credit_card</span>
                     <input 
                       required
                       type="text" 
                       placeholder="0000 0000 0000 0000"
                       value={cardNumber}
                       onChange={e => setCardNumber(e.target.value)}
                       className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all shadow-inner"
                     />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block font-accent text-[9px] text-zinc-500 uppercase tracking-widest mb-1 pl-1">Expiry</label>
                     <input 
                       required
                       type="text" 
                       placeholder="MM/YY"
                       value={exp}
                       onChange={e => setExp(e.target.value)}
                       className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all shadow-inner"
                     />
                   </div>
                   <div>
                     <label className="block font-accent text-[9px] text-zinc-500 uppercase tracking-widest mb-1 pl-1">CVC</label>
                     <input 
                       required
                       type="password" 
                       placeholder="•••"
                       value={cvv}
                       onChange={e => setCvv(e.target.value)}
                       className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all shadow-inner"
                     />
                   </div>
                 </div>
               </div>

               <div className="pt-2 flex gap-3">
                 <button type="button" onClick={() => setStep('SELECT')} className="px-5 py-4 rounded-2xl bg-white/10 text-white font-bold font-accent uppercase tracking-widest text-xs hover:bg-white/20 transition-all">
                   Back
                 </button>
                 <button type="submit" className="flex-1 py-4 rounded-2xl bg-white text-black font-bold font-accent uppercase tracking-widest text-xs hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                   Pay ${selectedPkg.price}
                 </button>
               </div>
             </form>
          )}

          {step === 'PROCESSING' && (
            <div className="flex flex-col items-center justify-center gap-6 py-12 animate-in fade-in zoom-in-95 duration-300">
               <div className="relative flex items-center justify-center">
                 <div className="absolute w-24 h-24 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                 <div className="absolute w-16 h-16 border-2 border-white/20 border-b-transparent rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                 <span className="material-symbols-outlined text-4xl text-primary animate-pulse">lock</span>
               </div>
               <p className="font-accent text-sm text-primary uppercase tracking-widest drop-shadow-[0_0_10px_rgba(203,255,0,0.5)] animate-pulse">Securing Transaction...</p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center gap-6 py-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500">
               <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_40px_rgba(203,255,0,0.4)] animate-in zoom-in delay-150 duration-500">
                 <span className="material-symbols-outlined text-5xl text-primary drop-shadow-[0_0_10px_rgba(203,255,0,0.8)]">check_circle</span>
               </div>
               <div className="text-center space-y-1">
                 <h3 className="font-display text-3xl text-white">TRANSFER COMPLETE</h3>
                 <p className="font-accent text-[10px] text-zinc-400 uppercase tracking-widest">{"Funds deposited into your secure wallet."}</p>
               </div>
               
               <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mt-4 space-y-3">
                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                   <span className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">Amount Paid</span>
                   <span className="font-mono text-white text-lg">${selectedPkg.price}</span>
                 </div>
                 <div className="flex justify-between items-center pt-1">
                   <span className="font-accent text-[10px] text-primary uppercase tracking-widest">Total Earned</span>
                   <span className="font-mono text-primary font-bold text-xl drop-shadow-[0_0_8px_rgba(203,255,0,0.6)]">+{(selectedPkg.crd + selectedPkg.bonus).toLocaleString()} CRD</span>
                 </div>
               </div>

               <button onClick={closeAndReset} className="w-full py-4 mt-2 rounded-2xl bg-white/10 text-white border border-white/20 font-bold font-accent uppercase tracking-widest text-xs hover:bg-white/20 transition-all">
                 Return to Profile
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
