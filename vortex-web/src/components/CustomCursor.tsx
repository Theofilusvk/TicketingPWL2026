import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const isTouch = window.matchMedia?.('(pointer: coarse)').matches ?? false
    if (isTouch) {
      cursor.style.display = 'none'
      return
    }

    const setActive = (active: boolean, scale?: number) => {
      cursor.classList.toggle('is-active', active)
      if (typeof scale === 'number' && Number.isFinite(scale)) {
        cursor.style.setProperty('--cursor-scale', String(scale))
      } else {
        cursor.style.removeProperty('--cursor-scale')
      }
    }

    const getHoverTarget = (el: HTMLElement | null) => {
      if (!el) return null
      return el.closest<HTMLElement>('[data-cursor-scale], a, button, .hover-lift, [role="button"]')
    }

    const onMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`

      // Continuously check if the element under cursor is a hover target.
      // This fixes the bug where cursor stays enlarged when DOM elements
      // are removed (e.g. during page transitions) and mouseout never fires.
      const elUnder = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      const hit = getHoverTarget(elUnder)
      if (hit) {
        const scaleAttr = hit.getAttribute('data-cursor-scale')
        const scale = scaleAttr ? Number(scaleAttr) : undefined
        setActive(true, scale)
      } else {
        setActive(false)
      }
    }

    document.addEventListener('mousemove', onMouseMove)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  if (typeof document === 'undefined') return null

  return createPortal(<div ref={cursorRef} id="custom-cursor" aria-hidden="true" />, document.body)
}
