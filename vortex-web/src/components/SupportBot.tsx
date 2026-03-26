import { useState, useRef, useEffect } from 'react'
import { useAudio } from '../lib/audio'

interface Message {
  role: 'user' | 'model'
  text: string
  timestamp: Date
}

const SYSTEM_PROMPT = `Kamu adalah VORTEX AI ASSISTANT — asisten virtual untuk platform event VORTEX, sebuah platform tiket event underground/rave/elektronik dengan estetika cyberpunk.

ATURAN KETAT:
1. Kamu HANYA boleh menjawab pertanyaan yang berhubungan dengan VORTEX dan fitur-fitur website ini.
2. Jika pengguna bertanya di luar konteks VORTEX (misalnya tentang cuaca, coding, matematika, politik, berita, dll), jawab dengan: "⚠️ PROTOCOL_VIOLATION: Pertanyaan ini di luar jangkauan sistem VORTEX. Saya hanya bisa membantu terkait event, tiket, merchandise, akun, dan fitur platform VORTEX."
3. Jawab dalam bahasa yang sama dengan pertanyaan user (Indonesia atau English).
4. Gunakan gaya cyberpunk/teknis yang singkat dan to-the-point.
5. Gunakan huruf kapital untuk istilah sistem seperti VORTEX, CREDIT, TIER, dll.

KONTEKS VORTEX:
- VORTEX adalah platform event organizer untuk event underground, rave, dan elektronik
- Event tersedia: NEON CHAOS 2025 (Berlin, 14 Feb 2025), STATIC PULSE (Tokyo, 1 Mar 2025)
- Tier tiket: GENERAL (69 USD), VIP (149 USD), ELITE (249 USD)
- Sistem CREDIT: setiap pembelian mendapat credit (100 CRD per USD). Credit bisa dipakai untuk merch.
- Loyalty Tier: INITIATE → SQUIRE → KNIGHT → LORD → SOVEREIGN (naik berdasarkan total pembelian)
- Fitur: Ticket, Drops/Merch, News, Order History, Profile, Settings (Theme, Sound Effects)
- Merchandise: VORTEX_HOODIE (95 USD), GLITCH_CAP (45 USD), NEON_PATCH (15 USD)
- Pembayaran: QRIS, CARD, E-WALLET, CRYPTO
- Kebijakan: Tidak ada refund. Single-entry protocol (sekali keluar, akses expired). Dress code: dark aesthetics.
- Venue map interaktif tersedia di halaman event detail.
- Sound effects bisa diaktifkan/dinonaktifkan di Settings > Dashboard Preferences.`

const API_KEY = 'AIzaSyDB8b08xOs7LeLXuNTQJy4qIyLcs8TizrU'
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

async function sendToGemini(messages: Message[]): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }))

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        }
      })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('Gemini API error:', res.status, errData)
      throw new Error(`API error: ${res.status}`)
    }
    
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'SYSTEM_ERROR: Tidak dapat memproses respons.'
  } catch (err) {
    console.error('Gemini fetch error:', err)
    return '⚠️ CONNECTION_LOST: Gagal terhubung ke VORTEX AI. Periksa koneksi dan coba lagi.'
  }
}

export function SupportBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { playClickSound, playHoverSound } = useAudio()

  // Auto-scroll on message changes and during streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, isStreaming])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => { if (streamRef.current) clearTimeout(streamRef.current) }
  }, [])

  const streamText = (fullText: string) => {
    let i = 0
    setIsStreaming(true)
    // Add empty model message first
    const botMsg: Message = { role: 'model', text: '', timestamp: new Date() }
    setMessages(prev => [...prev, botMsg])

    const typeChar = () => {
      i++
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === 'model') {
          updated[updated.length - 1] = { ...last, text: fullText.slice(0, i) }
        }
        return updated
      })

      if (i < fullText.length) {
        // Variable speed: faster for spaces, slower for punctuation
        const char = fullText[i]
        const delay = char === ' ' ? 10 : '.!?,:;\n'.includes(char) ? 60 : 18
        streamRef.current = setTimeout(typeChar, delay)
      } else {
        setIsStreaming(false)
      }
    }

    streamRef.current = setTimeout(typeChar, 18)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isTyping || isStreaming) return

    const userMsg: Message = { role: 'user', text, timestamp: new Date() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    const reply = await sendToGemini(newMessages)
    
    setIsTyping(false)
    streamText(reply)
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-8 z-[150] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col bg-zinc-950 border border-primary/30 shadow-[0_0_40px_rgba(203,255,0,0.08)] animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ height: '500px', maxHeight: 'calc(100vh - 8rem)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-black/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
              <div>
                <h3 className="font-display text-lg text-primary leading-none">VORTEX_AI</h3>
                <p className="font-accent text-[7px] text-zinc-600 uppercase tracking-widest">SUPPORT PROTOCOL v2.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2 bg-primary rounded-full animate-pulse" />
              <span className="font-accent text-[8px] text-primary uppercase tracking-widest">ONLINE</span>
              <button
                onClick={() => { playClickSound(); setIsOpen(false) }}
                className="ml-2 text-zinc-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-zinc-800 mb-3 block">forum</span>
                <p className="font-accent text-[10px] text-zinc-600 uppercase tracking-widest mb-4">
                  VORTEX AI READY
                </p>
                <div className="space-y-2">
                  {['Apa saja event yang tersedia?', 'Bagaimana cara naik tier?', 'Berapa harga tiket VIP?'].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); playClickSound() }}
                      className="block w-full text-left px-3 py-2 border border-zinc-800 font-accent text-[9px] text-zinc-400 uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      → {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary/10 border border-primary/30 text-white'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                }`}>
                  {msg.role === 'model' && (
                    <p className="font-accent text-[7px] text-primary uppercase tracking-widest mb-1">VORTEX_AI</p>
                  )}
                  <p className="font-accent text-[10px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className="font-accent text-[7px] text-zinc-700 uppercase tracking-widest mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800 px-3 py-2">
                  <p className="font-accent text-[7px] text-primary uppercase tracking-widest mb-1">VORTEX_AI</p>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-primary/20 p-3 bg-black/60">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="TRANSMIT_MESSAGE..."
                disabled={isTyping || isStreaming}
                className="flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 font-accent text-[10px] text-white uppercase tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
              <button
                onClick={() => { playClickSound(); handleSend() }}
                onMouseEnter={playHoverSound}
                disabled={isTyping || isStreaming || !input.trim()}
                className="px-3 bg-primary text-black font-accent text-[10px] font-bold uppercase tracking-widest hover:bg-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => { playClickSound(); setIsOpen(!isOpen) }}
        onMouseEnter={playHoverSound}
        className={`fixed bottom-6 right-4 md:right-8 z-[150] w-14 h-14 flex items-center justify-center transition-all duration-300 group ${
          isOpen
            ? 'bg-zinc-800 text-zinc-400 rotate-0'
            : 'bg-primary text-black shadow-[0_0_20px_rgba(203,255,0,0.3)] hover:shadow-[0_0_30px_rgba(203,255,0,0.5)] hover:scale-110'
        }`}
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-hot-coral rounded-full animate-pulse" />
        )}
      </button>
    </>
  )
}
