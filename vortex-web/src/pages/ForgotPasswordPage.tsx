import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset link')
      }
      
      setSuccessMsg('SYSTEM OVERRIDE LINK DISPATCHED. CHECK YOUR INBOX.')
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl h-[calc(100vh-88px)] flex flex-col justify-center overflow-hidden px-4">
      <div className="w-full scale-95 origin-center">
        <div className="text-center mb-6">
          <h1 className="font-display animate-float reveal inline-block text-4xl md:text-5xl mb-2">
            VORTEX
          </h1>
          <div className="flex justify-center flex-wrap gap-4 font-accent text-[10px] text-primary/60 uppercase tracking-widest mt-2">
            <span>/ SECURITY_OVERRIDE</span>
            <span>/ PROTOCOL: FORGOT_KEY</span>
          </div>
        </div>

        <div className="relative glass-card p-6 md:p-8 reveal shadow-[0_0_20px_rgba(203,255,0,0.1)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50" />

          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <p className="font-accent text-[10px] uppercase tracking-widest text-primary/70">
              / KEY_RECOVERY_PROTOCOL
            </p>
            <button
              type="button"
              className="font-accent text-[10px] uppercase tracking-widest text-primary hover:text-white transition-colors"
              onClick={() => navigate('/login')}
            >
              RETURN TO NODE
            </button>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {error ? (
              <div className="border border-hot-coral bg-hot-coral/10 py-3 px-4 rounded">
                <p className="font-accent text-xs text-hot-coral">{error}</p>
              </div>
            ) : null}
            {successMsg ? (
              <div className="border border-primary bg-primary/10 py-3 px-4 rounded">
                <p className="font-accent text-xs text-primary">{successMsg}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="font-accent text-xs text-primary flex justify-between items-end">
                <span>/ EMAIL_IDENTIFIER</span>
                <span className="text-[8px] opacity-50 text-zinc-400">REQUIRED_FIELD</span>
              </label>
              <div className="relative">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-primary/30 p-3 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm"
                  placeholder="_ENTER_EMAIL_LINKED_TO_NODE"
                  type="email"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30">
                  <span className="material-symbols-outlined text-sm">mail</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                className="w-full bg-primary text-dark-base px-8 py-3 rounded-full font-accent font-bold text-sm uppercase hover:scale-[1.02] active:scale-95 transition-transform duration-200 shadow-lg shadow-primary/20 text-center disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'TRANSMITTING...' : 'INITIATE RECOVERY'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
