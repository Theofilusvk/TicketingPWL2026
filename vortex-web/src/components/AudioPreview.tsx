import { useState, useRef, useEffect } from 'react'

interface AudioPreviewProps {
  src: string
  title: string
  artist: string
  color?: string
}

export function AudioPreview({ src, title, artist, color = 'var(--accent-color)' }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  
  // Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const initAudio = () => {
    if (!audioRef.current || audioCtxRef.current) return

    // Initialize Web Audio API
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new AudioContext()
    audioCtxRef.current = ctx

    const analyzer = ctx.createAnalyser()
    analyzer.fftSize = 64 // 32 frequency bins
    analyzerRef.current = analyzer

    const source = ctx.createMediaElementSource(audioRef.current)
    sourceRef.current = source

    source.connect(analyzer)
    analyzer.connect(ctx.destination)
  }

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      initAudio()
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      audioRef.current.play()
    }
  }

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyzerRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyzer = analyzerRef.current
    const bufferLength = analyzer.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyzer.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 1.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        ctx.fillStyle = isPlaying ? color : '#3f3f46' // zinc-700
        
        // Draw bars from center vertically
        const y = (canvas.height - barHeight) / 2
        
        ctx.fillRect(x, y, barWidth - 1, barHeight)
        x += barWidth
      }
    }

    draw()
  }

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer()
    } else {
      cancelAnimationFrame(animationRef.current)
      // Draw static flat line when paused
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#3f3f46'
          const barWidth = (canvas.width / 32) * 1.5
          let x = 0
          for (let i = 0; i < 32; i++) {
            ctx.fillRect(x, canvas.height / 2 - 1, barWidth - 1, 2)
            x += barWidth
          }
        }
      }
    }
    return () => cancelAnimationFrame(animationRef.current)
  }, [isPlaying, color])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedData = () => {
      setDuration(audio.duration)
      // Draw initial state
      setIsPlaying(false) 
    }
    const handleEnded = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    // Fire loadeddata manually if already loaded
    if (audio.readyState >= 1) handleLoadedData()

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  // Cleanup audio context entirely on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className="flex items-center gap-4 bg-black/60 border border-zinc-800 p-3 rounded-lg hover:border-zinc-700 transition-colors cursor-default backdrop-blur-md"
      onClick={e => e.preventDefault()}
    >
      <audio 
        ref={audioRef} 
        src={src} 
        preload="metadata"
        crossOrigin="anonymous" 
      />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-white hover:border-white transition-colors shrink-0"
        style={{ borderColor: isPlaying ? color : undefined, color: isPlaying ? color : 'white' }}
      >
        <span className="material-symbols-outlined text-xl">
          {isPlaying ? 'pause' : 'play_arrow'}
        </span>
      </button>

      {/* Info & Visualizer */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-end mb-1">
          <div className="truncate pr-4">
            <p className="font-display text-sm truncate" style={{ color: isPlaying ? color : 'white' }}>
              {title}
            </p>
            <p className="font-accent text-[9px] text-zinc-500 uppercase tracking-widest truncate">
              {artist}
            </p>
          </div>
          <span className="font-mono text-[9px] text-zinc-500 shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        {/* Visualizer Canvas */}
        <canvas 
          ref={canvasRef} 
          width={120} 
          height={24} 
          className="w-full h-6 rounded"
        />
      </div>
    </div>
  )
}
