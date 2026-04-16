import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function LoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login, signup, isAuthenticated, user } = useAuth()

  const returnTo = useMemo(() => params.get('returnTo') || '/events', [params])

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        navigate(returnTo, { replace: true })
      }
    }
  }, [isAuthenticated, navigate, returnTo, user?.isAdmin])
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const [verificationPending, setVerificationPending] = useState(false)

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return
    const timer = setInterval(() => {
      setOtpCooldown((c) => c - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [otpCooldown])

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter an email address first.')
      return
    }
    setOtpLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await fetch('/api/auth/send-register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP.')
      }
      setOtpSent(true)
      setOtpCooldown(60) // 60 second cooldown before resend
      setSuccessMsg('OTP DISPATCHED. CHECK YOUR EMAIL INBOX.')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.')
    } finally {
      setOtpLoading(false)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Security Key must be at least 8 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Confirm Security Key must match Security Key.')
        return
      }
      if (!otp) {
        setError('Please enter the OTP code sent to your email.')
        return
      }
      const res = await signup({ username, password, email, otp })
      if (!res.ok) {
        setError(res.message)
        return
      }
      
      // Check if verification is pending
      if (res.verification_pending) {
        setVerificationPending(true)
        setSuccessMsg('REGISTRATION SUCCESSFUL. CHECK YOUR EMAIL TO VERIFY.')
        setPassword('')
        setConfirmPassword('')
        setOtp('')
        setOtpSent(false)
        setUsername('')
      } else {
        // Auto-login after registration
        setSuccessMsg('REGISTRATION SUCCESSFUL. PLEASE LOG IN.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setOtp('')
        setOtpSent(false)
      }
      setEmail('')
      return
    }

    const res = await login({ username, password })
    if (!res.ok) {
      // Check if it's an email verification issue
      if (res.email_verified === false) {
        setError('Please verify your email before logging in. Check your inbox for the verification link.')
      } else {
        setError(res.message)
      }
      return
    }
    if (res.user?.isAdmin) {
      navigate('/admin')
    } else {
      navigate(returnTo)
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
            <span>/ NODE_77-X</span>
            <span>/ ENCRYPTION: ACTIVE</span>
            <span>/ LATENCY: 12MS</span>
          </div>
        </div>

        <div className="relative glass-card p-6 md:p-8 reveal shadow-[0_0_20px_rgba(203,255,0,0.1)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50" />

        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-accent text-[10px] uppercase tracking-widest text-primary/70">
            / {mode === 'login' ? 'AUTHENTICATION_REQUIRED' : 'NEW_IDENTITY_REGISTRY'}
          </p>
          <button
            type="button"
            className="font-accent text-[10px] uppercase tracking-widest text-primary hover:text-white transition-colors"
            onClick={() => {
              setError(null)
              setSuccessMsg(null)
              setOtpSent(false)
              setOtp('')
              setEmail('')
              setMode((m) => (m === 'login' ? 'signup' : 'login'))
            }}
          >
            {mode === 'login' ? 'SIGN UP' : 'BACK TO LOGIN'}
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

          {/* EMAIL VERIFICATION PENDING */}
          {verificationPending && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <span className="material-symbols-outlined text-4xl text-primary animate-bounce">mail</span>
                </div>
                <h3 className="font-display text-xl text-primary mb-2">CHECK_YOUR_EMAIL</h3>
                <p className="font-accent text-xs text-zinc-400 mb-3">
                  We've sent a verification link to <span className="text-primary font-bold">{email}</span>
                </p>
                <p className="font-accent text-[11px] text-zinc-500 mb-4">
                  Click the link in your email to verify your account. The link expires in 24 hours.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setVerificationPending(false)}
                className="w-full py-2 bg-primary/20 hover:bg-primary/40 text-primary font-accent text-xs uppercase tracking-wider transition-colors rounded"
              >
                DIDN'T GET EMAIL? CHECK SPAM OR TRY AGAIN
              </button>
            </div>
          )}

          {!verificationPending && (
            <>
          {/* EMAIL - signup only, shown first */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="font-accent text-xs text-primary flex justify-between items-end">
                <span>/ EMAIL_IDENTIFIER</span>
                <span className="text-[8px] opacity-50 text-zinc-400">REQUIRED_FIELD</span>
              </label>
              <div className="relative">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-primary/30 p-3 pr-28 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm"
                  placeholder="_ENTER_EMAIL"
                  type="email"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || otpCooldown > 0}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary/20 hover:bg-primary/40 text-primary px-3 py-1.5 font-accent text-[9px] uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded"
                >
                  {otpLoading ? 'SENDING...' : otpCooldown > 0 ? `RESEND (${otpCooldown}s)` : otpSent ? 'RESEND OTP' : 'SEND OTP'}
                </button>
              </div>
            </div>
          )}

          {/* OTP - signup only, shown after OTP sent */}
          {mode === 'signup' && otpSent && (
            <div className="space-y-2 mt-4">
              <label className="font-accent text-xs text-primary flex justify-between items-end">
                <span>/ OTP_CODE</span>
                <span className="text-[8px] opacity-50 text-zinc-400">6_DIGIT_CODE</span>
              </label>
              <div className="relative">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-transparent border-b border-primary/30 p-3 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm tracking-[8px] text-center"
                  placeholder="______"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30">
                  <span className="material-symbols-outlined text-sm">pin</span>
                </div>
              </div>
            </div>
          )}

          {/* USERNAME */}
          <div className="space-y-2">
            <label className="font-accent text-xs text-primary flex justify-between items-end">
              <span>/ USERNAME</span>
              <span className="text-[8px] opacity-50 text-zinc-400">REQUIRED_FIELD</span>
            </label>
            <div className="relative">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border-b border-primary/30 p-3 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm"
                placeholder="_ENTER_IDENTIFIER"
                type="text"
                autoComplete="username"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30">
                <span className="material-symbols-outlined text-sm">fingerprint</span>
              </div>
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-2 mt-6">
            <label className="font-accent text-xs text-primary flex justify-between items-end">
              <span>/ SECURITY_KEY</span>
              <span className="text-[8px] opacity-50 text-zinc-400">AES_256_BIT</span>
            </label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-primary/30 p-3 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm"
                placeholder="********"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
            {mode === 'login' && (
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="font-accent text-[9px] text-primary/50 hover:text-primary transition-colors uppercase"
                >
                  FORGOT SECURITY KEY?
                </button>
              </div>
            )}
          </div>

          {/* CONFIRM PASSWORD - signup only */}
          {mode === 'signup' ? (
            <div className="space-y-2 mt-6">
              <label className="font-accent text-xs text-primary flex justify-between items-end">
                <span>/ CONFIRM_SECURITY_KEY</span>
                <span className="text-[8px] opacity-50 text-zinc-400">VERIFY_MATCH</span>
              </label>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-primary/30 p-3 font-accent text-white focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-zinc-700 text-sm"
                  placeholder="********"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                />
              </div>
            </div>
          ) : null}

          <div className="pt-6">
            <button
              className="w-full bg-primary text-dark-base px-8 py-3 rounded-full font-accent font-bold text-sm uppercase hover:scale-[1.02] active:scale-95 transition-transform duration-200 shadow-lg shadow-primary/20 text-center"
              type="submit"
            >
              {mode === 'login' ? 'AUTHENTICATE' : 'SIGN UP'}
            </button>
          </div>
            </>
          )}
        </form>
      </div>
      </div>
    </div>
  )
}

