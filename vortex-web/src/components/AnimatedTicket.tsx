import { useRef, useState, useCallback } from 'react'
import type { Ticket } from '../lib/store'

interface AnimatedTicketProps {
  ticket: Ticket
}

export function AnimatedTicket({ ticket }: AnimatedTicketProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (y - 0.5) * -20
    const tiltY = (x - 0.5) * 20
    setTilt({ x: tiltX, y: tiltY })
    setGlare({ x: x * 100, y: y * 100, opacity: 0.25 })
  }, [])

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50, opacity: 0 })
    setIsHovered(false)
  }

  const handleDownload = async () => {
    // Create a downloadable ticket image using Canvas
    const canvas = document.createElement('canvas')
    const dpr = 2
    const w = 600
    const h = 380
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#0A0A0A'
    ctx.fillRect(0, 0, w, h)

    // Border
    ctx.strokeStyle = '#CBFF00'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, w - 2, h - 2)

    // Top accent bar
    const grad = ctx.createLinearGradient(0, 0, w, 0)
    grad.addColorStop(0, '#CBFF00')
    grad.addColorStop(0.6, 'rgba(203,255,0,0.5)')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, 4)

    // Event name
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 36px Bebas Neue, sans-serif'
    ctx.fillText(ticket.eventName, 30, 55)

    // Tier badge
    ctx.fillStyle = '#CBFF00'
    ctx.font = 'bold 20px Bebas Neue, sans-serif'
    const tierText = ticket.tier
    const tierW = ctx.measureText(tierText).width + 20
    ctx.strokeStyle = '#CBFF00'
    ctx.lineWidth = 1
    ctx.strokeRect(w - tierW - 30, 28, tierW, 28)
    ctx.fillText(tierText, w - tierW - 20, 50)

    // Dashed line separator
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#333'
    ctx.beginPath()
    ctx.moveTo(20, 80)
    ctx.lineTo(w - 20, 80)
    ctx.stroke()
    ctx.setLineDash([])

    // Info labels
    const labels = [
      { label: 'VENUE', value: ticket.venue, x: 30, y: 115 },
      { label: 'DATE', value: ticket.date, x: 200, y: 115 },
      { label: 'GATE', value: ticket.gate, x: 380, y: 115 },
      { label: 'ASSIGNED TO', value: ticket.assignedName, x: 30, y: 170 },
      { label: 'ORDER ID', value: ticket.orderId, x: 30, y: 220 },
      { label: 'TICKET ID', value: ticket.ticketId, x: 30, y: 270 },
    ]

    labels.forEach(({ label, value, x, y }) => {
      ctx.fillStyle = '#71717A'
      ctx.font = '9px Space Mono, monospace'
      ctx.fillText(label, x, y)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '12px Space Mono, monospace'
      ctx.fillText(value.length > 30 ? value.slice(0, 30) + '...' : value, x, y + 16)
    })

    // VORTEX branding
    ctx.fillStyle = '#CBFF0040'
    ctx.font = 'bold 80px Bebas Neue, sans-serif'
    ctx.fillText('VORTEX', w - 260, h - 30)

    // Barcode at bottom
    for (let i = 0; i < 50; i++) {
      const bw = Math.random() * 3 + 1
      ctx.fillStyle = '#71717A'
      ctx.fillRect(30 + i * 6, h - 40, bw, 20)
    }

    // Footer text
    ctx.fillStyle = '#52525B'
    ctx.font = '7px Space Mono, monospace'
    ctx.fillText('PRESENT THIS TICKET AT THE DESIGNATED GATE • VORTEX COLLECTIVE', 30, h - 8)

    // Download
    const link = document.createElement('a')
    link.download = `VORTEX_${ticket.eventName.replace(/\s+/g, '_')}_${ticket.ticketId}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleShare = async () => {
    const shareData = {
      title: `VORTEX — ${ticket.eventName}`,
      text: `🎫 ${ticket.eventName}\n📍 ${ticket.venue}\n📅 ${ticket.date}\n🏷️ Tier: ${ticket.tier}\n\nJoin the VORTEX Collective!`,
      url: window.location.href,
    }
    try {
      if (navigator.share) await navigator.share(shareData)
      else {
        await navigator.clipboard.writeText(shareData.text + '\n' + shareData.url)
        alert('Copied to clipboard!')
      }
    } catch (_) { /* user cancelled */ }
  }

  return (
    <div className="perspective-[1200px]">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative border-2 border-primary bg-zinc-950 overflow-hidden shadow-[0_0_40px_rgba(203,255,0,0.1)] transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Holographic Glare Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, 
              rgba(203,255,0,0.15) 0%, 
              rgba(255,77,77,0.08) 25%, 
              rgba(168,85,247,0.06) 50%,
              transparent 70%)`,
            opacity: glare.opacity,
          }}
        />

        {/* Animated holographic strip */}
        <div
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
          style={{ opacity: isHovered ? 0.4 : 0 }}
        >
          <div
            className="absolute w-[200%] h-full"
            style={{
              background: 'linear-gradient(105deg, transparent 20%, rgba(203,255,0,0.1) 30%, rgba(255,77,77,0.08) 35%, rgba(168,85,247,0.08) 40%, transparent 50%)',
              animation: isHovered ? 'holoSheen 2s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        {/* Top Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-primary via-primary/50 to-hot-coral/30 relative z-10" />

        {/* Number watermark */}
        <div className="absolute top-4 right-4 font-display text-[120px] leading-none text-primary/[0.04] pointer-events-none z-0 select-none">
          #{ticket.ticketId.slice(-4)}
        </div>

        {/* Header */}
        <div className="p-8 md:p-10 border-b border-dashed border-zinc-700 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest">NFT_ACCESS_PROTOCOL</p>
              </div>
              <h1 className="font-display text-5xl md:text-7xl text-white leading-none">{ticket.eventName}</h1>
            </div>
            <div className="text-right">
              <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">ADMISSION_CLASS</p>
              <p className="font-display text-3xl text-primary drop-shadow-[0_0_8px_rgba(203,255,0,0.5)]">{ticket.tier}</p>
            </div>
          </div>
        </div>

        {/* Middle Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-dashed border-zinc-700 relative z-10">
          {[
            { label: 'VENUE', value: ticket.venue, highlight: false },
            { label: 'DATE', value: ticket.date, highlight: false },
            { label: 'GATE', value: ticket.gate, highlight: true },
            { label: 'ORDER_ID', value: ticket.orderId, highlight: false },
          ].map((cell, i) => (
            <div key={i} className={`p-5 ${i < 3 ? 'border-r border-dashed border-zinc-700' : ''}`}>
              <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-2">{cell.label}</p>
              <p className={`font-accent text-xs uppercase tracking-widest font-bold ${cell.highlight ? 'text-primary' : 'text-white'}`}>
                {cell.value}
              </p>
            </div>
          ))}
        </div>

        {/* QR Code Section */}
        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 border-b border-dashed border-zinc-700 relative z-10">
          {/* QR Code with holographic border */}
          <div className="relative p-1 shrink-0" style={{
            background: isHovered
              ? 'linear-gradient(135deg, #CBFF00, #FF4D4D, #A855F7, #CBFF00)'
              : 'linear-gradient(135deg, #CBFF00, #CBFF0060)',
            backgroundSize: '300% 300%',
            animation: isHovered ? 'gradientShift 3s ease infinite' : 'none',
          }}>
            <div className="bg-white p-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketId}`}
                alt="QR Code"
                className="w-40 h-40 mix-blend-multiply"
              />
            </div>
          </div>

          {/* Ticket Details */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-1">ASSIGNED_TO</p>
              <p className="font-display text-3xl text-primary">{ticket.assignedName}</p>
            </div>
            <div>
              <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-1">TICKET_ID</p>
              <p className="font-mono text-sm text-white break-all">{ticket.ticketId}</p>
            </div>
            <div>
              <p className="font-accent text-[8px] text-zinc-500 uppercase tracking-widest mb-1">PURCHASED_ON</p>
              <p className="font-mono text-xs text-zinc-400">{new Date(ticket.purchaseDate).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 p-3 bg-primary/10 border border-primary/30">
              <span className="material-symbols-outlined text-primary text-sm">verified</span>
              <p className="font-accent text-[8px] text-primary uppercase tracking-widest font-bold">
                NFT VERIFIED — BLOCKCHAIN SEALED
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <p className="font-accent text-[8px] text-zinc-600 uppercase tracking-widest text-center md:text-left">
            PRESENT THIS QR CODE AT THE DESIGNATED GATE.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 border border-primary/50 text-primary font-accent text-[9px] uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              SAVE
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 border border-hot-coral/50 text-hot-coral font-accent text-[9px] uppercase tracking-widest hover:bg-hot-coral hover:text-black transition-all"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              SHARE
            </button>
          </div>
        </div>

        {/* Decorative barcode */}
        <div className="px-6 pb-4 flex justify-center gap-[2px] relative z-10">
          {[...Array(50)].map((_, i) => {
            const seed = ticket.ticketId.charCodeAt(i % ticket.ticketId.length)
            return <div key={i} className="h-6" style={{ width: ((seed * 7 + i * 3) % 4) + 1 + 'px', backgroundColor: `rgba(203,255,0,${0.15 + (seed % 3) * 0.1})` }} />
          })}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes holoSheen {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(50%); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
