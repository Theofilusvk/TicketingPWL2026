import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useAudio } from '../lib/audio'
import { useToast } from '../components/Toast'
import { useTranslation } from '../lib/i18n'
import { useNotification } from '../lib/useNotification'

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const { isSoundEnabled, toggleSound, playClickSound, playHoverSound } = useAudio()
  const { showToast } = useToast()
  const { t, lang, setLang } = useTranslation()
  const { permission, requestPermission, sendNotification } = useNotification()
  const navigate = useNavigate()
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')

  const [activeTab, setActiveTab] = useState('ACCOUNT_DATA')
  const [themeMode, setThemeMode] = useState(localStorage.getItem('vortex-theme') || 'dark')

  // Reset local state if user changes globally
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setEmail(user.email || '')
      setBio(user.bio || '')
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleThemeToggle = () => {
    if (window.toggleTheme) {
      window.toggleTheme()
      setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')
    }
  }

  const handleCommit = () => {
    updateUser({ displayName, email, bio, avatarUrl })
    showToast('ACCOUNT DATA SYNCED TO MAINFRAME', 'success')
  }

  const handleCancel = () => {
    if (user) {
      setDisplayName(user.displayName || '')
      setEmail(user.email || '')
      setBio(user.bio || '')
      setAvatarUrl(user.avatarUrl || '')
    }
    showToast('EDITS DISCARDED', 'info')
  }

  const handleDeactivate = () => {
    logout()
    navigate('/')
    showToast('CONNECTION TERMINATED', 'error')
  }

  return (
    <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
      <aside className="reveal md:col-span-4 space-y-8">
        <div className="p-6 glass-card border-t-2 border-primary relative group">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="size-32 mx-auto mb-6 rounded-full border-2 border-primary relative overflow-hidden shadow-[0_0_15px_rgba(203,255,0,0.3)] cursor-pointer group-hover:border-white transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 animate-pulse" />
            <img
              className="w-full h-full object-cover grayscale contrast-125 relative group-hover:grayscale-0 transition-all"
              alt="Profile"
              src={avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzxmQbfxvOo0UHykfktpWT3JkM4VIJm6AFKFMQd4O1dbg1UuxoEY56Xlg-ywtodIHULIxUr1vIPx_KeBAngxZYsET5peyuOc7Y0uKF2uDRVTRe-ZUoItyKErofCHyQBJdjDaLJlTTv9U2GDZbUhmppVYMHLrHZphIDTROO-OTiB84VqFo6oj9-6H3d6j3qIMlMSg9b127XJ31grtOlPKB61ck7iBnWXGNsDz17x5URz-kyDHPvWN5QtcxE1xVAw0rVEhc7Og-VzQM'}
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-display text-4xl text-primary tracking-wide break-all">{displayName || 'UNKNOWN_USER'}</h2>
            <p className="font-accent text-[8px] text-zinc-500 tracking-widest mt-2 uppercase">/ CONNECTED_SINCE: 2024</p>
          </div>
        </div>

        <nav className="flex flex-col gap-3 font-accent text-xs">
          <button 
            onClick={() => setActiveTab('ACCOUNT_DATA')}
            className={`flex items-center gap-4 p-4 rounded-full transition-all text-left uppercase tracking-widest ${
              activeTab === 'ACCOUNT_DATA' 
                ? 'bg-primary text-dark-base font-bold shadow-[0_0_10px_rgba(203,255,0,0.3)] hover:scale-[1.02]' 
                : 'border border-zinc-800 text-zinc-400 hover:border-primary hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">account_circle</span>
            ACCOUNT_DATA
          </button>
          {[
            ['shield_lock', 'SECURITY_PROTOCOLS'],
            ['dashboard_customize', 'DASHBOARD_PREFS'],
            ['notifications_active', 'NOTIFICATIONS'],
          ].map(([icon, label]) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`flex items-center gap-4 p-4 rounded-full transition-all text-left uppercase tracking-widest ${
                activeTab === label
                  ? 'bg-primary text-dark-base font-bold shadow-[0_0_10px_rgba(203,255,0,0.3)] hover:scale-[1.02]'
                  : 'border border-zinc-800 text-zinc-400 hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="reveal md:col-span-8 space-y-16">
        
        {activeTab === 'ACCOUNT_DATA' && (
          <div className="space-y-8 glass-card p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="distort-title text-5xl md:text-7xl font-display text-primary">
              {t('tabAccount')}
            </h1>
          <div className="grid grid-cols-1 gap-8 mt-6">
            <div className="flex flex-col gap-2">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">/ EMAIL_ADDRESS</label>
              <input
                className="bg-transparent border-b border-primary/30 p-3 font-accent text-sm text-white focus:border-primary focus:ring-0 outline-none transition-colors"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">/ DISPLAY_NAME</label>
              <input
                className="bg-transparent border-b border-primary/30 p-3 font-accent text-sm text-white focus:border-primary focus:ring-0 outline-none transition-colors uppercase"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest">/ BIO_DATA</label>
              <textarea
                className="bg-transparent border border-primary/30 p-4 font-accent text-sm text-white focus:border-primary focus:ring-0 outline-none transition-colors mt-2"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
          </div>
        </div>
        )}

        {activeTab === 'SECURITY_PROTOCOLS' && (
        <div className="space-y-8 glass-card p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="font-display text-5xl text-white">
            SECURITY_PROTOCOLS
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded">
              <div className="font-accent">
                <p className="text-primary font-bold text-xs uppercase tracking-widest">BIOMETRIC_AUTH</p>
                <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1">ENABLE RETINAL AND FINGERPRINT SCAN</p>
              </div>
              <button className="w-12 h-6 bg-primary flex items-center px-1" type="button">
                <div className="size-4 bg-background-dark ml-auto" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-zinc-800 rounded">
              <div className="font-accent">
                <p className="text-white text-xs uppercase tracking-widest">TWO_FACTOR_ENCRYPTION</p>
                <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1">REQUIRES PHYSICAL HARDWARE KEY</p>
              </div>
              <button className="w-12 h-6 bg-slate-700 flex items-center px-1" type="button">
                <div className="size-4 bg-slate-400" />
              </button>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'DASHBOARD_PREFS' && (
        <div className="space-y-8 glass-card p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="font-display text-5xl text-white">
            DASHBOARD_SETTINGS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-zinc-800 rounded flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="font-accent text-[10px] text-white uppercase tracking-widest">REAL_TIME_TICKER</span>
                <button className="w-10 h-5 bg-primary flex items-center px-0.5" type="button">
                  <div className="size-4 bg-background-dark ml-auto" />
                </button>
              </div>
              <p className="text-[8px] font-accent text-zinc-500 uppercase tracking-widest">
                Live credit market fluctuations injected directly into viewport.
              </p>
            </div>
            <div className="p-4 border border-zinc-800 rounded flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="font-accent text-[10px] text-white uppercase tracking-widest">AUTO_REFRESH_NEWS</span>
                <button className="w-10 h-5 bg-primary flex items-center px-0.5" type="button">
                  <div className="size-4 bg-background-dark ml-auto" />
                </button>
              </div>
              <p className="text-[8px] font-accent text-zinc-500 uppercase tracking-widest">
                Continuous feed synchronization with Vortex global network.
              </p>
            </div>
            
            <div className="p-4 border border-primary/30 flex flex-col gap-4 md:col-span-2 bg-primary/5 rounded cursor-pointer group" onClick={handleThemeToggle}>
              <div className="flex justify-between items-start">
                <span className="font-accent text-[10px] font-bold uppercase tracking-widest text-primary">
                  UI_THEME_MODE
                </span>
                <button className={`w-10 h-5 flex items-center px-0.5 transition-colors duration-300 ${themeMode === 'light' ? 'bg-zinc-600' : 'bg-primary'}`} type="button">
                  <div className={`size-4 transition-transform duration-300 ${themeMode === 'light' ? 'bg-zinc-300 translate-x-0' : 'bg-background-dark translate-x-5'}`} />
                </button>
              </div>
              <p className="text-[8px] font-accent text-primary/70 uppercase tracking-widest group-hover:text-primary transition-colors">
                Toggle between Light and Dark visual aesthetics for the entire application.
              </p>
            </div>

            <div 
              className="p-4 border border-secondary/30 flex flex-col gap-4 md:col-span-2 bg-secondary/5 rounded cursor-pointer group"
              onClick={() => {
                toggleSound()
                playClickSound()
              }}
              onMouseEnter={playHoverSound}
            >
              <div className="flex justify-between items-start">
                <span className="font-accent text-[10px] font-bold uppercase tracking-widest text-secondary">
                  UI_SOUND_EFFECTS
                </span>
                <button className={`w-10 h-5 flex items-center px-0.5 transition-colors duration-300 ${!isSoundEnabled ? 'bg-zinc-600' : 'bg-secondary'}`} type="button">
                  <div className={`size-4 transition-transform duration-300 ${!isSoundEnabled ? 'bg-zinc-300 translate-x-0' : 'bg-background-dark translate-x-5'}`} />
                </button>
              </div>
              <p className="text-[8px] font-accent text-secondary/70 uppercase tracking-widest group-hover:text-secondary transition-colors">
                Enable synthesized cyberpunk audio feedback for interactions.
              </p>
            </div>

            {/* LANGUAGE SELECTOR */}
            <div className="p-4 border border-zinc-700 flex flex-col gap-4 md:col-span-2">
              <div className="mb-2">
                <span className="font-accent text-[10px] font-bold uppercase tracking-widest text-white">
                  {t('langSetting')}
                </span>
                <p className="text-[8px] font-accent text-zinc-500 uppercase tracking-widest mt-1">
                  {t('langDesc')}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setLang('en')}
                  className={`flex-1 py-3 text-[10px] font-bold tracking-widest font-accent uppercase border transition-colors ${
                    lang === 'en' ? 'bg-primary text-black border-primary' : 'border-zinc-800 text-zinc-500 hover:border-zinc-500'
                  }`}
                >
                  ENGLISH
                </button>
                <button
                  onClick={() => setLang('id')}
                  className={`flex-1 py-3 text-[10px] font-bold tracking-widest font-accent uppercase border transition-colors ${
                    lang === 'id' ? 'bg-primary text-black border-primary' : 'border-zinc-800 text-zinc-500 hover:border-zinc-500'
                  }`}
                >
                  BAHASA INDONESIA
                </button>
              </div>
            </div>

            {/* ACCENT COLOR CUSTOMIZER */}
            <div className="p-4 border border-white/10 bg-black/40 rounded md:col-span-2">
              <div className="mb-4">
                <span className="font-accent text-[10px] font-bold uppercase tracking-widest text-white">
                  ACCENT_COLOR
                </span>
                <p className="text-[8px] font-accent text-zinc-500 uppercase tracking-widest mt-1">
                  Customize the primary accent color across the interface.
                </p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { name: 'NEON GREEN', hex: '#CBFF00' },
                  { name: 'HOT PINK', hex: '#FF2D78' },
                  { name: 'ELECTRIC BLUE', hex: '#00B4FF' },
                  { name: 'AMBER', hex: '#FFB800' },
                  { name: 'PURPLE', hex: '#A855F7' },
                  { name: 'CYAN', hex: '#00FFE0' },
                ].map(c => {
                  const saved = localStorage.getItem('vortex-accent') || '#CBFF00'
                  const isActive = saved === c.hex
                  return (
                    <button
                      key={c.hex}
                      onClick={() => {
                        document.documentElement.style.setProperty('--accent-color', c.hex)
                        localStorage.setItem('vortex-accent', c.hex)
                        showToast(`ACCENT SET: ${c.name}`, 'success')
                        setActiveTab('DASHBOARD_PREFS')
                      }}
                      className={`flex flex-col items-center gap-2 p-3 border transition-all hover:-translate-y-0.5 ${
                        isActive ? 'border-white bg-white/10' : 'border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full transition-shadow"
                        style={{
                          backgroundColor: c.hex,
                          boxShadow: isActive ? `0 0 20px ${c.hex}60` : 'none',
                        }}
                      />
                      <span className="font-accent text-[7px] uppercase tracking-widest text-zinc-500">{c.name}</span>
                      {isActive && <span className="material-symbols-outlined text-white text-xs">check</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-8 glass-card p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start">
            <h2 className="font-display text-5xl text-white">
              NOTIFICATIONS
            </h2>
            <button
              onClick={async () => {
                if (permission === 'default') {
                  const granted = await requestPermission()
                  if (granted) {
                    sendNotification('🔗 PROTOCOL CONNECTED', { body: 'Browser notifications are now active.' })
                  }
                } else if (permission === 'granted') {
                  sendNotification('⚡ SYSTEM TEST', { body: 'Comm-link is stable and operational.' })
                }
              }}
              className="border border-primary text-primary px-4 py-2 font-accent text-[8px] tracking-widest uppercase hover:bg-primary/20 transition-colors"
            >
              {permission === 'granted' ? 'TEST PUSH NOTIFICATION' : 'ENABLE BROWSER PUSH'}
            </button>
          </div>
          <div className="space-y-3">
            {[
              { icon: 'local_fire_department', color: 'text-hot-coral', time: '2 MIN AGO', msg: 'SYSTEM ALERT: Tiket NEON CHAOS 2025 hampir habis! Segera amankan posisi Anda.', highlight: true },
              { icon: 'stars', color: 'text-amber-400', time: '1 HOUR AGO', msg: 'RANK UPGRADE: Selamat! Anda telah naik ke tier KNIGHT. Nikmati benefit eksklusif.', highlight: false },
              { icon: 'shopping_bag', color: 'text-primary', time: '3 HOURS AGO', msg: 'NEW DROP: VORTEX_HOODIE V2 tersedia sekarang di halaman Drops. Limited stock.', highlight: false },
              { icon: 'verified', color: 'text-blue-400', time: '1 DAY AGO', msg: 'ACCOUNT VERIFIED: Identitas Anda telah berhasil diverifikasi oleh Vortex Protocol.', highlight: false },
              { icon: 'credit_card', color: 'text-primary', time: '2 DAYS AGO', msg: 'CREDIT DEPOSIT: +5,000 CRD telah ditambahkan ke saldo Anda sebagai welcome bonus.', highlight: false },
            ].map((notif, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 border rounded transition-colors cursor-pointer hover:border-primary/40 ${notif.highlight ? 'border-hot-coral/40 bg-hot-coral/5' : 'border-zinc-800 bg-black/40'}`}>
                <span className={`material-symbols-outlined text-xl mt-0.5 ${notif.color}`}>{notif.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-accent text-[10px] text-white uppercase tracking-widest leading-relaxed">{notif.msg}</p>
                  <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest mt-2">{notif.time}</p>
                </div>
                {notif.highlight && <span className="size-2 bg-hot-coral rounded-full animate-pulse shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        </div>
        )}

        {activeTab === 'ACCOUNT_DATA' && (
        <div className="space-y-8 glass-card border border-secondary/30 p-6 md:p-10 mt-16 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="font-display text-5xl text-secondary">
            DANGER_ZONE
          </h2>
          <div className="border border-secondary p-6 bg-secondary/5 rounded flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_15px_rgba(255,77,77,0.15)]">
            <div className="font-accent text-center md:text-left">
              <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-1">TERMINATE_CONNECTION</p>
              <p className="text-[8px] text-secondary/70 uppercase tracking-widest">
                Wipe all local data and disconnect from the Vortex mainframe permanently.
              </p>
            </div>
            <button 
              onClick={handleDeactivate}
              className="bg-secondary text-dark-base font-accent font-bold text-[10px] px-8 py-3 rounded-full hover:scale-105 transition-transform tracking-widest shadow-[0_0_15px_rgba(255,77,77,0.4)] uppercase"
            >
              DEACTIVATE_PROTOCOL
            </button>
          </div>
        </div>
        )}

        <div className="pt-8 border-t border-white/10 flex justify-end gap-4 mt-8">
          <button 
            onClick={handleCancel}
            className="font-accent font-bold tracking-widest uppercase text-xs border border-primary px-8 py-3 rounded-full text-primary hover:bg-primary/10 transition-colors"
          >
            CANCEL_EDITS
          </button>
          <button 
            onClick={handleCommit}
            className="bg-primary text-dark-base font-accent font-bold text-xs px-12 py-3 rounded-full shadow-[0_0_15px_rgba(203,255,0,0.4)] active:scale-95 hover:scale-[1.02] transition-transform tracking-widest uppercase"
          >
            COMMIT_CHANGES
          </button>
        </div>
      </section>
    </main>
  )
}

