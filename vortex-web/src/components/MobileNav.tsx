import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from '../lib/i18n'
import { useAudio } from '../lib/audio'

export function MobileNav() {
  const { t } = useTranslation()
  const { playHoverSound, playClickSound } = useAudio()
  const location = useLocation()
  
  // Hide on auth pages or landing page if needed
  if (location.pathname === '/login' || location.pathname === '/') {
    return null
  }

  const navItems = [
    { to: '/events', icon: 'calendar_today', label: t('navEvents') },
    { to: '/tickets', icon: 'confirmation_number', label: t('navMyTickets') },
    { to: '/drops', icon: 'shopping_bag', label: t('navDrops') },
    { to: '/news', icon: 'feed', label: t('navNews') },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-dark/95 backdrop-blur-md border-t border-primary/30 flex justify-around items-center pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={playClickSound}
          onTouchStart={playHoverSound}
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full py-3 gap-1 transition-colors
            ${isActive ? 'text-primary' : 'text-zinc-500 hover:text-zinc-300'}
          `}
        >
          <span className="material-symbols-outlined text-xl">{item.icon}</span>
          <span className="font-accent text-[8px] uppercase tracking-widest">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
