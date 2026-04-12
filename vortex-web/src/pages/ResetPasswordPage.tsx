import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !email) {
      setError('INVALID URL. MISSING SECURITY TOKENS.')
      return
    }

    if (password !== confirmPassword) {
      setError('CONFIRM KEY MUST MATCH NEW SECURITY KEY.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          token, 
          email, 
          password, 
          password_confirmation: confirmPassword 
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-xl h-[calc(100vh-88px)] flex flex-col justify-center overflow-hidden px-4">
        <div className="w-full scale-95 origin-center text-center">
          <div className="mb-6">
            <span className="material-symbols-outlined text-6xl text-primary mb-4 reveal">check_circle</span>
            <h1 className="font-display animate-float text-4xl mb-2 text-primary">OVERRIDE SUCCESSFUL</h1>
            <p className="font-accent text-xs text-zinc-400 mt-4">YOUR SECURITY KEY HAS BEEN UPDATED.</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="inline-block bg-primary text-dark-base px-8 py-3 rounded-full font-accent font-bold text-sm uppercase hover:scale-[1.02] active:scale-95 transition-transform"
          >
            RETURN TO AUTHENTICATOR
          </button>
        </div>
      </div>
    )
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
            <span>/ PROTOCOL: ESTABLISH_NEW_KEY</span>
          </div>
        </div>

        <div className="relative glass-card p-6 md:p-8 reveal shadow-[0_0_20px_rgba(203,255,0,0.1)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50" />

          <div className="mb-8">
             <p className="font-accent text-[10px] uppercase tracking-widest text-primary/70">
              / ENTER_NEW_CREDENTIALS
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {error ? (
              <div className="border border-hot-coral bg-hot-coral/10 py-3 px-4 rounded">
                <p className="font-accent text-xs text-hot-coral">{error}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="font-accent text-xs text-primary flex justify-between items-end">
                <span>/ NEW_SECURITY_KEY</span>
                <span className="text-[8px] opacity-50 text-zinc-400">AES_256_BIT</span>
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-primary/30 p-3 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm"
                  placeholder="********"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    className="text-primary/30 hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <label className="font-accent text-xs text-primary flex justify-between items-end">
                <span>/ CONFIRM_NEW_KEY</span>
                <span className="text-[8px] opacity-50 text-zinc-400">VERIFY_MATCH</span>
              </label>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-primary/30 p-3 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm"
                  placeholder="********"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                className="w-full bg-primary text-dark-base px-8 py-3 rounded-full font-accent font-bold text-sm uppercase hover:scale-[1.02] active:scale-95 transition-transform duration-200 shadow-lg shadow-primary/20 text-center disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'ENCRYPTING...' : 'CONFIRM OVERRIDE'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
