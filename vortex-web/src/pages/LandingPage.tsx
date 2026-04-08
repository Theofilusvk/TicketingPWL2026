import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { RotatingEarth } from '../components/RotatingEarth'

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const scrollProgressRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const targetDate = new Date('2026-04-15T00:00:00').getTime()
    const updateCountdown = () => {
      const now = Date.now()
      const diff = Math.max(0, targetDate - now)
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = useMemo(
    () => [
      {
        text: '"The most visceral production I\'ve experienced. Berlin has nothing on Vortex."',
        handle: '@X_REBEL',
        role: 'NYC RESIDENT',
        border: 'border-electric-lime',
        orb: 'bg-electric-lime shadow-[0_0_15px_#CBFF00]',
      },
      {
        text: '"Zero lag, pure energy. The visual mapping was actually mind-melting."',
        handle: '@GLITCH_MOMENT',
        role: 'DIGITAL ARTIST',
        border: 'border-hot-coral',
        orb: 'bg-hot-coral shadow-[0_0_15px_#FF4D4D]',
      },
      {
        text: '"Finally an event that understands the aesthetic. Real raw rave energy."',
        handle: '@VOID_ZERO',
        role: 'DJ / PRODUCER',
        border: 'border-white',
        orb: 'bg-white shadow-[0_0_15px_white]',
      },
      {
        text: '"They didn\'t just meet expectations, they shattered the simulation."',
        handle: '@CYBER_KID',
        role: 'VIBE ARCHITECT',
        border: 'border-electric-lime',
        orb: 'bg-electric-lime shadow-[0_0_15px_#CBFF00]',
      },
    ],
    [],
  )

  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin)

    const root = rootRef.current
    if (!root) return

    let isPaused = false
    let scrollPos = 0
    const SCROLL_AMOUNT = 420

    const onAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const link = target?.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!link) return
      const targetId = link.getAttribute('href')
      if (!targetId || targetId === '#') return
      const targetEl = root.querySelector(targetId) as HTMLElement | null
      if (!targetEl) return

      e.preventDefault()
      const targetY = targetEl.getBoundingClientRect().top + window.scrollY
      gsap.to(window, {
        scrollTo: { y: targetY, autoKill: true },
        duration: 1.2,
        ease: 'power3.inOut',
      })
    }
    root.addEventListener('click', onAnchorClick)

    const carousel = carouselRef.current
    const scrollProgress = scrollProgressRef.current

    const updateProgress = () => {
      if (!carousel || !scrollProgress) return
      const maxScroll = carousel.scrollWidth - carousel.clientWidth
      const progress = maxScroll > 0 ? (carousel.scrollLeft / maxScroll) * 100 : 0
      scrollProgress.style.width = `${progress}%`
    }

    const smoothScrollCarousel = (target: number) => {
      if (!carousel) return
      const maxScroll = carousel.scrollWidth - carousel.clientWidth
      const clamped = Math.max(0, Math.min(target, maxScroll))

      gsap.to(carousel, {
        scrollLeft: clamped,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          scrollPos = carousel.scrollLeft
          updateProgress()
        },
      })
    }

    const onScrollLeft = () => {
      if (!carousel) return
      isPaused = true
      smoothScrollCarousel(carousel.scrollLeft - SCROLL_AMOUNT)
    }

    const onScrollRight = () => {
      if (!carousel) return
      isPaused = true
      smoothScrollCarousel(carousel.scrollLeft + SCROLL_AMOUNT)
    }

    const scrollLeftBtn = root.querySelector('#scroll-left-btn') as HTMLButtonElement | null
    const scrollRightBtn = root.querySelector('#scroll-right-btn') as HTMLButtonElement | null
    scrollLeftBtn?.addEventListener('click', onScrollLeft)
    scrollRightBtn?.addEventListener('click', onScrollRight)

    const onCarouselEnter = () => (isPaused = true)
    const onCarouselLeave = () => (isPaused = false)
    const onCarouselScroll = () => {
      updateProgress()
      if (isPaused && carousel) scrollPos = carousel.scrollLeft
    }

    carousel?.addEventListener('mouseenter', onCarouselEnter)
    carousel?.addEventListener('mouseleave', onCarouselLeave)
    carousel?.addEventListener('touchstart', onCarouselEnter, { passive: true })
    carousel?.addEventListener('touchend', onCarouselLeave, { passive: true })
    carousel?.addEventListener('scroll', onCarouselScroll, { passive: true })

    const autoScroll = () => {
      if (carousel && !isPaused) {
        scrollPos += 0.5
        const halfWidth = carousel.scrollWidth / 2
        if (scrollPos >= halfWidth) {
          scrollPos = 0
          carousel.scrollLeft = 0
        } else {
          carousel.scrollLeft = scrollPos
        }
        updateProgress()
      }
      rafRef.current = requestAnimationFrame(autoScroll)
    }

    updateProgress()
    rafRef.current = requestAnimationFrame(autoScroll)

    let isScrolling = false
    const onWheel = (e: WheelEvent) => {
      if (isScrolling) return
      const t = e.target as HTMLElement | null
      if (t?.closest('.no-scrollbar')) return

      e.preventDefault()
      isScrolling = true
      const delta = e.deltaY
      const targetY = Math.max(
        0,
        Math.min(
          window.scrollY + delta * 2.5,
          document.documentElement.scrollHeight - window.innerHeight,
        ),
      )

      gsap.to(window, {
        scrollTo: { y: targetY, autoKill: true },
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          isScrolling = false
        },
      })

      window.setTimeout(() => {
        isScrolling = false
      }, 600)
    }

    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      root.removeEventListener('click', onAnchorClick)

      scrollLeftBtn?.removeEventListener('click', onScrollLeft)
      scrollRightBtn?.removeEventListener('click', onScrollRight)

      carousel?.removeEventListener('mouseenter', onCarouselEnter)
      carousel?.removeEventListener('mouseleave', onCarouselLeave)
      carousel?.removeEventListener('touchstart', onCarouselEnter)
      carousel?.removeEventListener('touchend', onCarouselLeave)
      carousel?.removeEventListener('scroll', onCarouselScroll)

      window.removeEventListener('wheel', onWheel)

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      gsap.killTweensOf(window)
      if (carousel) gsap.killTweensOf(carousel)
    }
  }, [])

  return (
    <div ref={rootRef} className="font-body text-white selection:bg-electric-lime selection:text-dark-base">
      <header className="relative min-h-screen flex flex-col" id="hero">
        <nav className="w-full p-6 flex justify-between items-center z-50">
          <div className="font-display text-4xl tracking-tighter text-electric-lime">VORTEX</div>
          <div className="space-x-8 font-accent text-xs uppercase hidden md:flex">
            <a
              className="hover:text-electric-lime transition-colors"
              href="#events"
              data-cursor-scale="2.8"
            >
              / Events
            </a>
            <a
              className="hover:text-electric-lime transition-colors"
              href="#how"
              data-cursor-scale="2.8"
            >
              / Guide
            </a>
            <a
              className="hover:text-electric-lime transition-colors text-hot-coral"
              href="#join"
              data-cursor-scale="2.8"
            >
              / Join Collective
            </a>
          </div>
        </nav>

        <div className="flex-1 flex flex-col md:flex-row md:items-end px-6 pb-28 pt-8 md:pt-0 gap-8 md:gap-0 relative z-10">
          <div className="flex-1">
            <h1 className="distort-title font-display animate-float hero-fade" data-purpose="hero-title">
              NEON
              <br />
              CHAOS
              <br />
              2026
            </h1>
          </div>

          <div
            className="relative w-full md:max-w-md md:mb-8 md:mr-20 z-20 hero-fade hero-fade-delay"
          >
            {/* Globe behind the card */}
            <div className="absolute -top-52 -left-52 md:-top-60 md:-left-60 z-0 opacity-50 pointer-events-none md:pointer-events-auto">
              <RotatingEarth size={700} />
            </div>

            <div
              className="glass-card p-8 relative z-10 hover:border-electric-lime transition-all"
              data-purpose="next-event-teaser"
            >
              <span className="font-accent text-[10px] text-hot-coral uppercase tracking-widest block mb-2">
                / NEXT DROP
              </span>
              <h3 className="font-display text-5xl mb-4 leading-none text-white">CHROME RAVE</h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Warehouse 7, Berlin. 24:00 - INF. High frequency audio visual experiences for the
                digital native.
              </p>

              {/* Countdown */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { val: countdown.days, label: 'DAYS' },
                  { val: countdown.hours, label: 'HRS' },
                  { val: countdown.minutes, label: 'MIN' },
                  { val: countdown.seconds, label: 'SEC' },
                ].map(unit => (
                  <div key={unit.label} className="bg-black/50 border border-electric-lime/30 p-2 text-center">
                    <p className="font-display text-2xl md:text-3xl text-electric-lime leading-none">
                      {String(unit.val).padStart(2, '0')}
                    </p>
                    <p className="font-accent text-[7px] text-gray-500 tracking-widest mt-1">{unit.label}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-electric-lime text-dark-base px-8 py-3 rounded-full font-accent font-bold text-xs uppercase hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg shadow-electric-lime/20"
                data-cursor-scale="2.6"
              >
                RSVP NOW
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full bg-electric-lime py-4 overflow-hidden rotate-[-2deg] origin-left scale-105 z-10">
          <div className="flex whitespace-nowrap animate-marquee" style={{ width: 'max-content' }}>
            {[...Array(8)].map((_, i) => (
              <span key={i} className="font-display text-4xl text-dark-base mx-4">
                UPCOMING · EVENTS · 2026 · JOIN NOW ·
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="py-32 px-6 bg-dark-base relative" id="events">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4 reveal">
          <h2 className="font-display text-7xl md:text-9xl uppercase leading-none">
            THE
            <br />
            <span className="text-electric-lime">CALENDAR</span>
          </h2>
          <p className="font-accent text-xs text-gray-500 max-w-[200px] md:text-right">
            EXCLUSIVE ACCESS ONLY. SELECTED CURATIONS FOR THE UNDERGROUND SENSES.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 group reveal">
            <div className="hover-lift bg-zinc-900 border border-zinc-800 p-4 aspect-[4/5] flex flex-col justify-between">
              <div className="relative overflow-hidden h-2/3 bg-gradient-to-br from-hot-coral to-purple-900">
                <div className="absolute inset-0 flex items-center justify-center font-display text-6xl opacity-20">
                  001
                </div>
              </div>
              <div className="mt-4">
                <div className="flex gap-2 mb-3">
                  <span className="text-[10px] border border-hot-coral text-hot-coral px-2 py-0.5 rounded-full font-accent">
                    TECHNO
                  </span>
                  <span className="text-[10px] border border-zinc-500 text-zinc-500 px-2 py-0.5 rounded-full font-accent">
                    18+
                  </span>
                </div>
                <h4 className="font-display text-3xl leading-none mb-1">CYBERPUNK DINNER</h4>
                <div className="flex justify-between items-end">
                  <p className="font-accent text-[10px] text-zinc-400">APR 12 / NYC</p>
                  <a className="font-accent text-xs text-electric-lime hover:underline" href="#" data-cursor="/ RSVP →">
                    RSVP →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 md:mt-24 reveal">
            <div className="hover-lift bg-zinc-900 border border-zinc-800 p-4 aspect-square flex flex-col justify-between">
              <div className="relative overflow-hidden h-3/4 bg-gradient-to-bl from-electric-lime to-blue-800">
                <div className="absolute inset-0 flex items-center justify-center font-display text-6xl opacity-20">
                  002
                </div>
              </div>
              <div className="mt-4">
                <div className="flex gap-2 mb-3">
                  <span className="text-[10px] border border-electric-lime text-electric-lime px-2 py-0.5 rounded-full font-accent">
                    AUDIO/VISUAL
                  </span>
                </div>
                <h4 className="font-display text-4xl leading-none mb-1">GLITCH FREQUENCY</h4>
                <div className="flex justify-between items-end">
                  <p className="font-accent text-[10px] text-zinc-400">MAY 05 / LONDON</p>
                  <a className="font-accent text-xs text-electric-lime hover:underline" href="#" data-cursor="/ RSVP →">
                    RSVP →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 reveal">
            <div className="hover-lift bg-zinc-900 border border-zinc-800 p-4 aspect-[3/4] flex flex-col justify-between">
              <div className="relative overflow-hidden h-1/2 bg-gradient-to-tr from-zinc-700 to-black border-b border-zinc-800">
                <div className="absolute inset-0 flex items-center justify-center font-display text-4xl opacity-20">
                  003
                </div>
              </div>
              <div className="mt-4">
                <div className="flex gap-2 mb-3">
                  <span className="text-[10px] border border-zinc-300 text-zinc-300 px-2 py-0.5 rounded-full font-accent">
                    SECRET LOOOKUP
                  </span>
                </div>
                <h4 className="font-display text-3xl leading-none mb-1">VOID SESSIONS</h4>
                <div className="flex justify-between items-end">
                  <p className="font-accent text-[10px] text-zinc-400">JUN 20 / TOKYO</p>
                  <a className="font-accent text-xs text-electric-lime hover:underline" href="#" data-cursor="/ RSVP →">
                    RSVP →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-32 px-6 bg-zinc-950 border-y border-zinc-900 relative overflow-hidden"
        id="how"
      >
        <h2 className="font-display text-6xl mb-24 relative z-10 reveal">THE PROTOCOL</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
          <div className="relative reveal">
            <span className="font-display giant-num">1</span>
            <div className="relative pl-4 border-l-2 border-electric-lime pt-12">
              <h4 className="font-accent font-bold text-lg mb-4 text-white uppercase">AUTHENTICATE</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Connect your digital identity to verify age and community standing. No bots allowed
                in the vortex.
              </p>
            </div>
          </div>
          <div className="relative reveal">
            <span className="font-display giant-num">2</span>
            <div className="relative pl-4 border-l-2 border-hot-coral pt-12">
              <h4 className="font-accent font-bold text-lg mb-4 text-white uppercase">ACQUIRE KEY</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Drop windows are random. Secure your encrypted ticket key before the timer hits
                zero.
              </p>
            </div>
          </div>
          <div className="relative reveal">
            <span className="font-display giant-num">3</span>
            <div className="relative pl-4 border-l-2 border-zinc-500 pt-12">
              <h4 className="font-accent font-bold text-lg mb-4 text-white uppercase">ASCEND</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Location revealed 2 hours prior. Follow the coordinates. Trust the signal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 overflow-hidden bg-dark-base relative">
        <div className="px-6 mb-12 flex items-end justify-between reveal">
          <h2 className="font-accent text-xs text-zinc-500 uppercase tracking-tighter">
            / ECHOES FROM THE VOID
          </h2>
          <div className="flex gap-3">
            <button
              id="scroll-left-btn"
              className="w-12 h-12 border border-zinc-700 bg-zinc-900/80 hover:bg-electric-lime hover:border-electric-lime hover:text-dark-base text-white flex items-center justify-center transition-all duration-300 group"
              aria-label="Scroll left"
              data-cursor="/ LEFT"
              type="button"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              id="scroll-right-btn"
              className="w-12 h-12 border border-electric-lime bg-electric-lime text-dark-base hover:bg-transparent hover:text-electric-lime flex items-center justify-center transition-all duration-300 group"
              aria-label="Scroll right"
              data-cursor="/ RIGHT"
              type="button"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-8 px-6 overflow-x-auto no-scrollbar pb-10"
          id="testimonial-scroll"
        >
          {[...testimonials, ...testimonials].map((t, idx) => (
            <div
              key={`${t.handle}-${idx}`}
              className={`min-w-[300px] md:min-w-[400px] bg-zinc-900/50 p-8 border-l ${t.border} snap-card reveal`}
              aria-hidden={idx >= testimonials.length}
            >
              <p className="font-body italic text-lg mb-8 text-zinc-300">{t.text}</p>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${t.orb}`} />
                <div>
                  <p className="font-accent text-[10px] font-bold">{t.handle}</p>
                  <p className="font-accent text-[8px] text-zinc-500 uppercase">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 mt-6 reveal">
          <div className="h-[2px] bg-zinc-800 w-full relative">
            <div
              ref={scrollProgressRef}
              id="scroll-progress"
              className="h-full bg-electric-lime transition-all duration-300"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </section>

      <footer className="bg-dark-base px-6 py-20 border-t border-electric-lime" id="join">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="reveal">
            <h2 className="font-display text-8xl text-white leading-none mb-8">
              VORTEX
              <br />
              SYSTEMS
            </h2>
            <div className="flex flex-col gap-2 font-accent text-xs text-zinc-500">
              <p>© 2026 ALL RIGHTS RESERVED BY CHAOS THEORY</p>
              <p>ESTABLISHED IN THE UNDERGROUND.</p>
            </div>
          </div>
          <div className="flex flex-col justify-between reveal">
            <div className="grid grid-cols-2 gap-8 mb-12 md:mb-0">
              <div>
                <h5 className="font-accent text-xs font-bold text-electric-lime mb-4 uppercase">
                  NAVIGATE
                </h5>
                <ul className="space-y-2 font-accent text-xs">
                  <li>
                    <a className="hover:text-hot-coral transition-colors" href="#">
                      EVENTS
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-hot-coral transition-colors" href="#">
                      ABOUT
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-hot-coral transition-colors" href="#">
                      CAREERS
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-hot-coral transition-colors" href="#">
                      LEGAL
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-accent text-xs font-bold text-hot-coral mb-4 uppercase">
                  CHANNELS
                </h5>
                <ul className="space-y-2 font-accent text-xs">
                  <li>
                    <a className="hover:text-electric-lime transition-colors" href="#">
                      INSTAGRAM
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-electric-lime transition-colors" href="#">
                      TWITTER
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-electric-lime transition-colors" href="#">
                      TIKTOK
                    </a>
                  </li>
                  <li>
                    <a className="hover:text-electric-lime transition-colors" href="#">
                      DISCORD
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-auto">
              <form className="flex border-b border-zinc-800 pb-2">
                <input
                  className="bg-transparent border-none focus:ring-0 text-xs font-accent w-full placeholder:text-zinc-700"
                  placeholder="ENTER YOUR COMMS LINK (EMAIL)"
                  type="email"
                />
                <button
                  className="font-accent text-xs text-electric-lime hover:tracking-widest transition-all"
                  type="submit"
                  data-cursor="/ JOIN"
                >
                  JOIN
                </button>
              </form>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

