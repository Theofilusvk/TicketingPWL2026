import { useEffect, useRef } from 'react'

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    let isMouseIn = false

    const mouse = { x: w / 2, y: h / 2 }
    const particles: Particle[] = []

    // Adjust particle count based on screen size (mobile friendly)
    const getParticleCount = () => Math.min(Math.floor((w * h) / 15000), 100)

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      baseX: number
      baseY: number
      density: number

      constructor() {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.baseX = this.x
        this.baseY = this.y
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 1.5 + 0.5
        this.density = (Math.random() * 20) + 1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Bounce edges
        if (this.x < 0 || this.x > w) this.vx = -this.vx
        if (this.y < 0 || this.y > h) this.vy = -this.vy

        // Mouse interaction
        if (isMouseIn) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 150

          if (distance < maxDist) {
            const forceDirectionX = dx / distance
            const forceDirectionY = dy / distance
            const force = (maxDist - distance) / maxDist
            const directionX = forceDirectionX * force * this.density
            const directionY = forceDirectionY * force * this.density

            this.x -= directionX * 0.5
            this.y -= directionY * 0.5
          }
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }
    }

    const init = () => {
      particles.length = 0
      const count = getParticleCount()
      for (let i = 0; i < count; i++) {
        particles.push(new Particle())
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      
      // Get accent color dynamically from CSS var
      const style = getComputedStyle(document.documentElement)
      const accent = style.getPropertyValue('--accent-color').trim() || '#CBFF00'
      ctx.fillStyle = `${accent}80` // 50% opacity

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
      }

      // Draw connecting lines
      ctx.strokeStyle = `${accent}20` // 12% opacity
      ctx.lineWidth = 0.5
      
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const dist = dx * dx + dy * dy

          if (dist < 10000) { // Math.pow(100, 2)
            ctx.beginPath()
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
            ctx.closePath()
          }
        }
      }

      requestAnimationFrame(animate)
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      init()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseEnter = () => isMouseIn = true
    const handleMouseLeave = () => isMouseIn = false

    init()
    const animationId = requestAnimationFrame(animate)

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}
