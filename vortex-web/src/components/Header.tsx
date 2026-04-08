import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useStore } from '../lib/store'
import { useAudio } from '../lib/audio'
import { useTranslation } from '../lib/i18n'
import { NotificationBell } from './NotificationBell'

function navClassName({ isActive }: { isActive: boolean }) {
  return [
    'border-b-2 font-tag text-xs md:text-sm uppercase tracking-widest transition-colors',
    isActive
      ? 'text-primary border-primary'
      : 'text-slate-400 border-transparent hover:text-primary hover:border-primary',
  ].join(' ')
}

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const { cart, credits, tier } = useStore()
  const { playHoverSound, playClickSound } = useAudio()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  const [showMenu, setShowMenu] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
    <header className="sticky top-0 z-50 border-b-4 border-primary bg-background-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-4 md:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-4xl">cyclone</span>
            <span className="font-display text-4xl tracking-wider">VORTEX</span>
          </Link>

          {!isLoginPage ? (
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/events" className={navClassName}>
                {t('navEvents')}
              </NavLink>
              <NavLink to="/tickets" className={navClassName}>
                {t('navMyTickets')}
              </NavLink>
              <NavLink to="/drops" className={navClassName}>
                {t('navDrops')}
              </NavLink>
              <NavLink to="/news" className={navClassName}>
                {t('navNews')}
              </NavLink>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          {/* Hamburger Button - Mobile Only */}
          {!isLoginPage && (
            <button
              className="md:hidden text-white hover:text-primary transition-colors p-1"
              onClick={() => setShowMobileNav(!showMobileNav)}
              aria-label="Toggle navigation"
            >
              <span className="material-symbols-outlined text-3xl">
                {showMobileNav ? 'close' : 'menu'}
              </span>
            </button>
          )}
          {isAuthenticated && user ? (
            <>
              <div className="hidden lg:flex flex-col items-end mr-4">
                 <p className="font-accent text-[8px] text-zinc-500 tracking-widest uppercase mb-0.5">{t('balance')} // CRD</p>
                 <p className="font-mono text-primary font-bold leading-none">{credits.toLocaleString()}</p>
              </div>

              <NotificationBell />

              <Link
                to="/cart"
                className="relative text-white hover:text-primary transition-colors flex items-center justify-center p-2 mr-2 md:mr-4"
                onMouseEnter={playHoverSound}
                onClick={playClickSound}
              >
                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full pointer-events-none">
                    {cart.length}
                  </span>
                )}
              </Link>
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => { playClickSound(); setShowMenu(!showMenu) }}
                  onMouseEnter={playHoverSound}
                  className="flex items-center gap-2 lg:gap-3 lg:border-l-2 lg:border-primary/30 lg:pl-4 hover:opacity-80 transition-opacity text-left"
                >
                  <div className="text-right hidden lg:block group-hover:opacity-100">
                    <p className={`font-mono text-[10px] font-bold tracking-widest ${
                      tier === 'SOVEREIGN' ? 'text-purple-400' :
                      tier === 'LORD' ? 'text-amber-400' :
                      tier === 'KNIGHT' ? 'text-primary' :
                      tier === 'SQUIRE' ? 'text-blue-400' : 'text-zinc-400'
                    }`}>
                      {tier}
                    </p>
                    <p className="font-display text-xl leading-none">{user.displayName}</p>
                  </div>
                  <img
                    className={`h-10 w-10 border-2 object-cover ${
                      tier === 'SOVEREIGN' ? 'border-purple-500 shadow-[0_0_10px_purple]' :
                      tier === 'LORD' ? 'border-amber-500 shadow-[0_0_10px_orange]' :
                      tier === 'KNIGHT' ? 'border-primary shadow-[0_0_10px_#CBFF00]' :
                      tier === 'SQUIRE' ? 'border-blue-500' : 'border-zinc-600'
                    }`}
                    src={
                      user.avatarUrl ??
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5mp-WOImDCtb73Ca1NFmIt1welAuuSQXwMCZ_dey2ftzBzn_Ql_y_Oi7kwhGIox5c2aPxepI50EZ92Cq6EtVhi-JRdEFB-_jlOeVIRMa0XhkcEcFGdW6h-fblPg_SRktbcTRJapXyULn3NKrD__6w88TNPyYGJveVEVjSQzIZF0sofs7KTy1KP8N401cBNYuumlVlM12MKGguLXmi-rqI-d5AQU6pYPk72mSHR-hbLG2iEls2y_VkxqVT4RRer1ZJCGykkrgL3y8'
                    }
                    alt="User avatar"
                  />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-4 w-48 bg-zinc-950 border border-primary/30 shadow-[0_0_20px_rgba(203,255,0,0.1)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                    <button
                      onClick={() => {
                        playClickSound()
                        setShowMenu(false)
                        navigate('/profile')
                      }}
                      onMouseEnter={playHoverSound}
                      className="w-full text-left px-4 py-3 font-accent text-[10px] uppercase tracking-widest text-white hover:bg-primary/20 hover:text-primary transition-colors border-b border-white/5 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                      {t('menuProfile')}
                    </button>
                    <button
                      onClick={() => {
                        playClickSound()
                        setShowMenu(false)
                        navigate('/loyalty')
                      }}
                      onMouseEnter={playHoverSound}
                      className="w-full text-left px-4 py-3 font-accent text-[10px] uppercase tracking-widest text-white hover:bg-primary/20 hover:text-primary transition-colors border-b border-white/5 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">stars</span>
                      {t('menuLoyalty')}
                    </button>

                    <button
                      onClick={() => {
                        playClickSound()
                        setShowMenu(false)
                        navigate('/history')
                      }}
                      onMouseEnter={playHoverSound}
                      className="w-full text-left px-4 py-3 font-accent text-[10px] uppercase tracking-widest text-white hover:bg-primary/20 hover:text-primary transition-colors border-b border-white/5 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">receipt_long</span>
                      {t('menuHistory')}
                    </button>
                    <button
                      onClick={() => {
                        playClickSound()
                        setShowMenu(false)
                        navigate('/settings')
                      }}
                      onMouseEnter={playHoverSound}
                      className="w-full text-left px-4 py-3 font-accent text-[10px] uppercase tracking-widest text-white hover:bg-primary/20 hover:text-primary transition-colors border-b border-white/5 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">settings</span>
                      {t('menuSettings')}
                    </button>
                    <button
                      onClick={() => {
                        playClickSound()
                        setShowMenu(false)
                        logout()
                        navigate('/')
                      }}
                      onMouseEnter={playHoverSound}
                      className="w-full text-left px-4 py-3 font-accent text-[10px] uppercase tracking-widest text-hot-coral hover:bg-hot-coral/10 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : !isLoginPage ? (
            <Link
              to="/login"
              className="border-2 border-primary px-4 py-2 font-tag text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-colors"
            >
              Login
            </Link>
          ) : null}
        </div>
      </div>
    </header>
    {showMobileNav && <MobileNav onClose={() => setShowMobileNav(false)} />}
    </>
  )
}

function MobileNav({ onClose }: { onClose: () => void }) {
  const { isAuthenticated } = useAuth()
  const { credits, tier } = useStore()

  const links = [
    { to: '/events', label: 'EVENTS', icon: 'calendar_month' },
    { to: '/tickets', label: 'MY TICKETS', icon: 'confirmation_number' },
    { to: '/drops', label: 'DROPS', icon: 'shopping_bag' },
    { to: '/news', label: 'NEWS', icon: 'newspaper' },
  ]

  const authLinks = [
    { to: '/cart', label: 'CART', icon: 'shopping_cart' },
    { to: '/settings', label: 'SETTINGS', icon: 'settings' },
  ]

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      {/* Panel */}
      <nav className="absolute top-0 right-0 w-[85%] max-w-[360px] h-full bg-zinc-950 border-l border-primary/20 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <span className="font-display text-2xl text-primary tracking-wider">NAVIGATE</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* User Info */}
        {isAuthenticated && (
          <div className="p-6 border-b border-zinc-800 bg-black/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-1">RANK // STATUS</p>
                <p className={`font-display text-2xl ${
                  tier === 'SOVEREIGN' ? 'text-purple-400' :
                  tier === 'LORD' ? 'text-amber-400' :
                  tier === 'KNIGHT' ? 'text-primary' :
                  tier === 'SQUIRE' ? 'text-blue-400' : 'text-zinc-400'
                }`}>{tier}</p>
              </div>
              <div className="text-right">
                <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-1">BALANCE</p>
                <p className="font-mono text-primary font-bold text-lg">{credits.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => 
                `flex items-center gap-4 px-6 py-4 font-accent text-xs uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'text-primary bg-primary/10 border-l-4 border-primary'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <>
              <div className="mx-6 my-4 border-t border-zinc-800" />
              {authLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) => 
                    `flex items-center gap-4 px-6 py-4 font-accent text-xs uppercase tracking-widest transition-all ${
                      isActive 
                        ? 'text-primary bg-primary/10 border-l-4 border-primary'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-lg">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800">
          {!isAuthenticated ? (
            <NavLink
              to="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black py-3 font-accent font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              LOGIN
            </NavLink>
          ) : (
            <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest text-center">
              VORTEX SYSTEMS © 2026
            </p>
          )}
        </div>
      </nav>
    </div>
  )
}
