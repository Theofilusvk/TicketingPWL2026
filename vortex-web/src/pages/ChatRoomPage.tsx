import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useAudio } from '../lib/audio'

type ChatMessage = {
  id: string
  user: string
  avatar: string
  text: string
  timestamp: Date
  isSelf: boolean
}

const MOCK_MESSAGES = [
  "Can't wait for this one! 🔥",
  "Anyone got spare tickets??",
  "The lineup is insane this year 🤯",
  "See you all in the pit o7",
  "VORTEX never disappoints.",
  "What time does the headliner start?",
  "CYBER_WITCH is going to destroy the main stage",
  "Let's goooo 🚀🚀🚀",
  "Need to secure that VIP access asap",
  "Gonna be my 5th Vortex event!",
]

const MOCK_USERS = [
  { name: 'NeonSamurai', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Samurai' },
  { name: 'GlitchQueen', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Queen' },
  { name: 'ZeroCool', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zero' },
  { name: 'AcidFreak', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Acid' },
  { name: 'VortexFan99', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vortex' },
]

export function ChatRoomPage() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const { playClickSound, playHoverSound } = useAudio()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Simulate incoming messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const randomMsg = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)]
        const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]
        
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          user: randomUser.name,
          avatar: randomUser.avatar,
          text: randomMsg,
          timestamp: new Date(),
          isSelf: false
        }].slice(-50)) // Keep last 50 messages
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return

    playClickSound()
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      user: user.displayName || 'Anonymous',
      avatar: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
      text: input,
      timestamp: new Date(),
      isSelf: true
    }

    setMessages(prev => [...prev, newMsg])
    setInput('')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="reveal max-w-4xl mx-auto min-h-[80vh] flex flex-col glass-card border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-black/80 border-b border-primary/30 p-4 md:p-6 flex items-center justify-between">
        <div>
          <Link 
            to={`/events/${eventId}`}
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="font-accent text-[10px] text-zinc-500 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 mb-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            BACK TO EVENT
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-white">
            <span className="text-primary mr-3">#</span>
            {eventId?.toUpperCase().replace('-', '_')} // GLOBAL CHAT
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs text-primary">{Math.floor(Math.random() * 500 + 100)} ONLINE</span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gradient-to-b from-black/40 to-transparent"
      >
        <div className="text-center mb-8">
          <span className="inline-block bg-primary/10 text-primary border border-primary/20 px-4 py-1 font-accent text-[10px] uppercase tracking-widest rounded-full">
            TICKETS LIVE FOR {eventId?.toUpperCase()}
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.isSelf ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <img 
              src={msg.avatar} 
              alt={msg.user} 
              className={`w-10 h-10 rounded shadow-[0_0_10px_rgba(0,0,0,0.5)] ${msg.isSelf ? 'border-primary border' : 'bg-zinc-800'}`}
            />
            <div className={`flex flex-col max-w-[80%] ${msg.isSelf ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-display text-sm tracking-widest ${msg.isSelf ? 'text-primary' : 'text-zinc-400'}`}>
                  {msg.user}
                </span>
                <span className="font-mono text-[9px] text-zinc-600">{formatTime(msg.timestamp)}</span>
              </div>
              <div className={`p-3 rounded-lg backdrop-blur-sm ${
                msg.isSelf 
                  ? 'bg-primary/10 border border-primary/30 text-white rounded-tr-none' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
              }`}>
                <p className="text-sm font-sans leading-relaxed break-words">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
           <p className="text-center font-accent text-xs text-zinc-600 tracking-widest uppercase mt-20">Waiting for transmission...</p>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-black/80 border-t border-zinc-800">
        <form onSubmit={handleSend} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={user ? "BROADCAST TO NETWORK..." : "LOGIN REQUIRED TO BROADCAST"}
            disabled={!user}
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white font-accent text-xs p-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all tracking-widest disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!user || !input.trim()}
            onMouseEnter={playHoverSound}
            className="group bg-primary text-black px-8 py-4 font-accent font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            SEND
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
