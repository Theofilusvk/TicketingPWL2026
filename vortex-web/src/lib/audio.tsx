import React, { createContext, useContext, useEffect, useState } from 'react'

type AudioContextType = {
  playHoverSound: () => void
  playClickSound: () => void
  playTickSound: () => void
  playSuccessSound: () => void
  isSoundEnabled: boolean
  toggleSound: () => void
}

const AudioContext = createContext<AudioContextType | null>(null)

// Core Synthesizer engine using Web Audio API
class AudioEngine {
  private ctx: AudioContext | null = null

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playHover() {
    this.init()
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05)
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05)
    
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.05)
  }

  playClick() {
    this.init()
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(150, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1)
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
    
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.1)
  }

  playTick() {
    this.init()
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(3000, this.ctx.currentTime)
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03)
    
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.03)
  }

  playSuccess() {
    this.init()
    if (!this.ctx) return
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
      
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const t = this.ctx.currentTime
    playNote(659.25, t, 0.15) // E5
    playNote(880.00, t + 0.1, 0.3) // A5
  }
}

const engine = new AudioEngine()

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    return localStorage.getItem('vortex-audio') !== 'disabled'
  })

  useEffect(() => {
    localStorage.setItem('vortex-audio', isSoundEnabled ? 'enabled' : 'disabled')
  }, [isSoundEnabled])

  const toggleSound = () => setIsSoundEnabled(prev => !prev)

  const value = {
    isSoundEnabled,
    toggleSound,
    playHoverSound: () => isSoundEnabled && engine.playHover(),
    playClickSound: () => isSoundEnabled && engine.playClick(),
    playTickSound: () => isSoundEnabled && engine.playTick(),
    playSuccessSound: () => isSoundEnabled && engine.playSuccess(),
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
