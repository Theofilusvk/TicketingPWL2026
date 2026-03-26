import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(root: HTMLElement | null, deps: readonly unknown[] = []) {
  useLayoutEffect(() => {
    if (!root) return

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>('.reveal')
      targets.forEach((el) => {
        gsap.set(el, { opacity: 0, y: 24 })
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        })
      })
    }, root)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

