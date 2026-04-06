import { useEffect, useRef, useState } from 'react'
import Lenis from '@studio-freight/lenis'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { AnimatedOutlet } from './AnimatedOutlet'
import { useScrollReveal } from '../lib/scrollReveal'
import { CustomCursor } from './CustomCursor'
import { ToastProvider } from './Toast'
import { PageLoader } from './PageLoader'
import { SupportBot } from './SupportBot'
import { useAuth } from '../lib/auth'
import { ParticleBackground } from './ParticleBackground'
import { MobileNav } from './MobileNav'

export function AppShell() {
  const location = useLocation()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const isLanding = location.pathname === '/'
  const isLogin = location.pathname === '/login'
  const { isAuthenticated } = useAuth()

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('vortex-theme') as 'dark' | 'light') || 'dark'
  })

  useEffect(() => {
    window.toggleTheme = () => {
      setTheme(prev => {
        const next = prev === 'dark' ? 'light' : 'dark'
        localStorage.setItem('vortex-theme', next)
        return next
      })
    }
    // Load saved accent color
    const savedAccent = localStorage.getItem('vortex-accent')
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent-color', savedAccent)
    }
  }, [])

  useScrollReveal(contentRef.current, [location.pathname])

  useEffect(() => {
    if (!isLogin) return

    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [isLogin])

  // GSAP Smooth Scrolling (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <ToastProvider>
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light bg-slate-100 text-zinc-900' : 'bg-background-dark text-slate-100'} transition-colors duration-500`}>
      <CustomCursor />
      <PageLoader />
      <ParticleBackground />
      <div className="relative z-10">
        {!isLanding ? <Header /> : null}
        <div
          ref={contentRef}
          className={
            isLanding ? 'w-full pb-20 md:pb-0' : 'mx-auto w-full max-w-[1440px] px-4 md:px-8 py-8 pb-24 md:pb-8'
          }
        >
          <AnimatedOutlet />
        </div>
      </div>
      <MobileNav />
      {isAuthenticated && !isLanding && !isLogin && <SupportBot />}
    </div>
    </ToastProvider>
  )
}

