import { useEffect, useRef } from 'react'

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  density: number
  depth: number
  shape: number // 0-1 determines which shape to draw
  pulsePhase: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let mouseIn = false
    let mouseX = w / 2
    let mouseY = h / 2
    let scrollY = window.scrollY
    let frame = 0

    // ── Accent color ────────────────────────────────────
    const ACCENT = '#CBFF00'

    // ── Particle pool ───────────────────────────────────
    const COUNT = Math.min(Math.floor((w * h) / 14000), 90)
    let dots: Dot[] = []

    function spawn(): Dot {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.8,
        density: Math.random() * 15 + 5,
        depth: Math.random() * 3 + 1,
        shape: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
      }
    }

    function init() {
      dots = []
      for (let i = 0; i < COUNT; i++) dots.push(spawn())
    }

    // ── Render loop ─────────────────────────────────────
    let raf: number

    function draw() {
      frame++
      const t = frame * 0.005 // slow global time

      // Full clear (no trails — clean each frame)
      ctx!.clearRect(0, 0, w, h)

      const curScroll = window.scrollY
      const scrollDelta = curScroll - scrollY
      scrollY = curScroll

      // ── 1. Scrolling grid ─────────────────────────────
      const gridSpacing = 70
      const gridOffsetY = (curScroll * 0.15) % gridSpacing

      ctx!.save()
      ctx!.strokeStyle = `${ACCENT}12` // ~7% opacity
      ctx!.lineWidth = 1

      // Vertical lines
      ctx!.beginPath()
      for (let x = 0; x <= w; x += gridSpacing) {
        ctx!.moveTo(x, 0)
        ctx!.lineTo(x, h)
      }
      ctx!.stroke()

      // Horizontal lines (scrolling)
      ctx!.beginPath()
      for (let y = -gridOffsetY; y <= h + gridSpacing; y += gridSpacing) {
        ctx!.moveTo(0, y)
        ctx!.lineTo(w, y)
      }
      ctx!.stroke()
      ctx!.restore()

      // ── 2. Glow orbs (large ambient blobs) ────────────
      const orbs = [
        {
          cx: w * 0.2 + Math.sin(t * 0.7) * 80,
          cy: h * 0.3 + Math.cos(t * 0.5) * 60 - (curScroll * 0.08 % h),
          r: 250,
          color: 'rgba(203, 255, 0, 0.03)',
        },
        {
          cx: w * 0.75 + Math.cos(t * 0.6) * 100,
          cy: h * 0.7 + Math.sin(t * 0.4) * 70 - (curScroll * 0.05 % h),
          r: 300,
          color: 'rgba(203, 255, 0, 0.025)',
        },
        {
          cx: w * 0.5 + Math.sin(t * 0.3) * 120,
          cy: h * 0.5 + Math.cos(t * 0.8) * 50 - (curScroll * 0.06 % h),
          r: 200,
          color: 'rgba(100, 130, 0, 0.035)',
        },
      ]

      for (const orb of orbs) {
        const grad = ctx!.createRadialGradient(
          orb.cx, orb.cy, 0,
          orb.cx, orb.cy, orb.r
        )
        grad.addColorStop(0, orb.color)
        grad.addColorStop(1, 'transparent')
        ctx!.fillStyle = grad
        ctx!.fillRect(orb.cx - orb.r, orb.cy - orb.r, orb.r * 2, orb.r * 2)
      }

      // ── 3. Update & draw particles ────────────────────
      for (const d of dots) {
        // Parallax scroll
        d.y -= scrollDelta * d.depth * 0.12

        // Drift
        d.x += d.vx
        d.y += d.vy

        // Wrap seamlessly
        if (d.x < -10) d.x = w + 10
        if (d.x > w + 10) d.x = -10
        if (d.y < -10) d.y = h + 10
        if (d.y > h + 10) d.y = -10

        // Mouse repulsion
        if (mouseIn) {
          const dx = mouseX - d.x
          const dy = mouseY - d.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            const force = (180 - dist) / 180
            d.x -= (dx / dist) * force * d.density * 0.6
            d.y -= (dy / dist) * force * d.density * 0.6
          }
        }

        // Pulsing alpha
        const pulse = 0.5 + 0.5 * Math.sin(t * 3 + d.pulsePhase)
        const alpha = (0.35 + pulse * 0.45).toFixed(2)

        // Draw shape
        ctx!.save()
        if (d.shape > 0.88 && d.size > 1.2) {
          // ✚ crosshair
          ctx!.strokeStyle = `rgba(203, 255, 0, ${alpha})`
          ctx!.lineWidth = 1
          const arm = 4
          ctx!.beginPath()
          ctx!.moveTo(d.x - arm, d.y)
          ctx!.lineTo(d.x + arm, d.y)
          ctx!.moveTo(d.x, d.y - arm)
          ctx!.lineTo(d.x, d.y + arm)
          ctx!.stroke()
        } else if (d.shape > 0.74 && d.size > 1.4) {
          // ◇ diamond
          ctx!.strokeStyle = `rgba(203, 255, 0, ${alpha})`
          ctx!.lineWidth = 1
          const s = 3.5
          ctx!.beginPath()
          ctx!.moveTo(d.x, d.y - s)
          ctx!.lineTo(d.x + s, d.y)
          ctx!.lineTo(d.x, d.y + s)
          ctx!.lineTo(d.x - s, d.y)
          ctx!.closePath()
          ctx!.stroke()
        } else if (d.shape > 0.60 && d.size > 1.0) {
          // □ hollow square
          ctx!.strokeStyle = `rgba(203, 255, 0, ${alpha})`
          ctx!.lineWidth = 1
          ctx!.strokeRect(d.x - 2.5, d.y - 2.5, 5, 5)
        } else {
          // ● dot
          ctx!.fillStyle = `rgba(203, 255, 0, ${alpha})`
          ctx!.beginPath()
          ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.restore()
      }

      // ── 4. Constellation lines ────────────────────────
      ctx!.save()
      ctx!.lineWidth = 0.6
      for (let a = 0; a < dots.length; a++) {
        for (let b = a + 1; b < dots.length; b++) {
          const dx = dots[a].x - dots[b].x
          const dy = dots[a].y - dots[b].y
          const distSq = dx * dx + dy * dy
          if (distSq < 14000) {
            const proximity = 1 - distSq / 14000
            ctx!.strokeStyle = `rgba(203, 255, 0, ${(proximity * 0.15).toFixed(3)})`
            ctx!.beginPath()
            ctx!.moveTo(dots[a].x, dots[a].y)
            ctx!.lineTo(dots[b].x, dots[b].y)
            ctx!.stroke()
          }
        }
      }
      ctx!.restore()

      // ── 5. Mouse glow ring ────────────────────────────
      if (mouseIn) {
        const glowRad = 120
        const grad = ctx!.createRadialGradient(
          mouseX, mouseY, 0,
          mouseX, mouseY, glowRad
        )
        grad.addColorStop(0, 'rgba(203, 255, 0, 0.06)')
        grad.addColorStop(0.5, 'rgba(203, 255, 0, 0.02)')
        grad.addColorStop(1, 'transparent')
        ctx!.fillStyle = grad
        ctx!.fillRect(
          mouseX - glowRad,
          mouseY - glowRad,
          glowRad * 2,
          glowRad * 2
        )
      }

      // ── 6. Scanning line (sweeps down screen slowly) ──
      const scanSpeed = 0.0008
      const scanPos = ((frame * scanSpeed + curScroll * 0.0003) % 1.3) * h
      ctx!.save()
      const scanGrad = ctx!.createLinearGradient(0, scanPos - 40, 0, scanPos + 40)
      scanGrad.addColorStop(0, 'transparent')
      scanGrad.addColorStop(0.5, 'rgba(203, 255, 0, 0.04)')
      scanGrad.addColorStop(1, 'transparent')
      ctx!.fillStyle = scanGrad
      ctx!.fillRect(0, scanPos - 40, w, 80)
      ctx!.restore()

      raf = requestAnimationFrame(draw)
    }

    // ── Event handlers ──────────────────────────────────
    function onResize() {
      w = canvas!.width = window.innerWidth
      h = canvas!.height = window.innerHeight
      init()
    }
    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    function onMouseEnter() { mouseIn = true }
    function onMouseLeave() { mouseIn = false }

    init()
    scrollY = window.scrollY
    raf = requestAnimationFrame(draw)

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseenter', onMouseEnter)
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 1 }}
    />
  )
}
