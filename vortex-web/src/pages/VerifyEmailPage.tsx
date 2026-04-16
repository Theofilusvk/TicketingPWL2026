import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const id = params.get('id')
  const hash = params.get('hash')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!id || !hash) {
          setError('Invalid verification link.')
          setLoading(false)
          return
        }

        const res = await fetch(`/api/auth/verify-email/${id}/${hash}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Verification failed.')
        }

        setVerified(true)
        setToken(data.token)
        // Store token for auto-login
        if (data.token) {
          localStorage.setItem('vortex.auth.token', data.token)
        }
      } catch (err: any) {
        setError(err.message || 'Verification failed.')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [id, hash])

  const handleResendEmail = async () => {
    if (!email) return

    setResendLoading(true)
    setError(null)
    setResendSuccess(false)

    try {
      const res = await fetch('/api/auth/resend-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification email.')
      }

      setResendSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl h-[calc(100vh-88px)] flex flex-col justify-center overflow-hidden px-4">
      <div className="w-full scale-95 origin-center">
        <div className="text-center mb-6">
          <h1 className="font-display animate-float reveal inline-block text-6xl md:text-7xl mb-2">
            VORTEX
          </h1>
          <div className="flex justify-center flex-wrap gap-4 font-accent text-[10px] text-primary/60 uppercase tracking-widest mt-2">
            <span>/ EMAIL_VERIFICATION</span>
            <span>/ ENCRYPTION: ACTIVE</span>
            <span>/ LATENCY: 12MS</span>
          </div>
        </div>

        <div className="relative glass-card p-6 md:p-8 reveal shadow-[0_0_20px_rgba(203,255,0,0.1)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50" />

          {loading ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin">
                  <span className="material-symbols-outlined text-4xl text-primary">hourglass_empty</span>
                </div>
              </div>
              <p className="font-accent text-sm text-zinc-400 uppercase tracking-wider">
                VERIFYING_EMAIL_ADDRESS...
              </p>
            </div>
          ) : verified ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="animate-bounce">
                  <span className="material-symbols-outlined text-6xl text-primary">check_circle</span>
                </div>
              </div>
              <div>
                <h2 className="font-display text-3xl text-primary mb-2">EMAIL_VERIFIED</h2>
                <p className="font-accent text-sm text-zinc-400 uppercase tracking-wider">
                  YOUR_ACCOUNT_IS_READY
                </p>
              </div>
              <p className="text-zinc-400 text-sm">
                Your email has been successfully verified. You will be automatically redirected to your dashboard.
              </p>
              <Link
                to="/events"
                className="inline-block mt-4 px-6 py-2 bg-primary text-black font-accent text-sm uppercase tracking-wider hover:bg-primary/80 transition-colors rounded"
              >
                Go to Events
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <span className="material-symbols-outlined text-5xl text-hot-coral">error</span>
                </div>
                <h2 className="font-display text-2xl text-hot-coral mb-2">VERIFICATION_FAILED</h2>
                <p className="font-accent text-xs text-zinc-400 uppercase tracking-wider mb-4">
                  INVALID_OR_EXPIRED_LINK
                </p>
              </div>

              {error && (
                <div className="border border-hot-coral bg-hot-coral/10 py-3 px-4 rounded">
                  <p className="font-accent text-xs text-hot-coral">{error}</p>
                </div>
              )}

              {resendSuccess && (
                <div className="border border-primary bg-primary/10 py-3 px-4 rounded">
                  <p className="font-accent text-xs text-primary">
                    ✓ VERIFICATION EMAIL SENT. CHECK YOUR INBOX.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="font-accent text-xs text-primary uppercase tracking-wider">
                  / ENTER_EMAIL_TO_RESEND
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent border-b border-primary/30 p-3 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm"
                  />
                  <button
                    onClick={handleResendEmail}
                    disabled={!email || resendLoading}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/40 text-primary font-accent text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded"
                  >
                    {resendLoading ? 'SENDING...' : 'RESEND'}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-zinc-500 text-xs mb-2">OR</p>
                <Link
                  to="/auth/login"
                  className="font-accent text-xs text-primary hover:text-white transition-colors uppercase tracking-wider"
                >
                  BACK TO LOGIN
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
