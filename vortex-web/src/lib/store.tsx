import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type EventCategory = 'Musik' | 'Festival' | 'Konser' | 'Workshop' | 'Seminar' | 'Olahraga' | 'Seni' | 'Lainnya'
export const EVENT_CATEGORIES: EventCategory[] = ['Musik', 'Festival', 'Konser', 'Workshop', 'Seminar', 'Olahraga', 'Seni', 'Lainnya']

export type CartItem = {
  id: string
  ticketId?: string // specifically for tickets
  eventId?: string // track which event this ticket belongs to
  title: string
  phase?: string // for tickets
  price: number
  assignedName?: string
  assignedPhone?: string
  image?: string // for merch
}

export type Ticket = {
  id: string
  eventId: string
  eventName: string
  venue: string
  date: string
  tier: string
  gate: string
  orderId: string
  purchaseDate: string
  assignedName: string
  ticketId: string
  image?: string
  status?: 'VALID' | 'SCANNED'
}

export type OrderHistoryItem = {
  id: string
  date: string
  items: { title: string; price: number }[]
  total: number
  creditsEarned: number
}

export type EventData = {
  id: string
  name: string
  date: string
  category: EventCategory
  status: 'ACTIVE' | 'DRAFT' | 'LOCKED' | 'COMPLETED'
  ticketsLeft: number
  capacity: number
  venue: string
  price: number
  image: string
  audioName?: string
  audioArtist?: string
  audioSrc?: string
  colorClasses?: string
  btnColor?: string
}

export type DropData = {
  id: string
  title: string
  price: number
  image: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  stock: number
  reqTier: string
}

export type NewsData = {
  id: string
  date: string
  tag: string
  tagColor: string
  title: string
  content: string
}

export type UserAccount = {
  id: string
  name: string
  email: string
  tier: string
  credits: number
  joinDate: string
  lastActive: string
}

type StoreContextValue = {
  cart: CartItem[]
  ownedTickets: Ticket[]
  orderHistory: OrderHistoryItem[]
  events: EventData[]
  drops: DropData[]
  news: NewsData[]
  users: UserAccount[]
  credits: number
  tier: string
  addToCart: (items: CartItem[]) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  checkout: (tickets: Ticket[], earnedCredits: number, cartItemIdsToRemove: string[]) => void
  getEventStock: (eventId: string) => number
  deleteTicket: (ticketId: string) => void
  checkInTicket: (ticketId: string) => void
  addCredits: (amount: number) => void
  
  // Admin CRUD Actions
  addEvent: (event: EventData) => void
  updateEvent: (id: string, updates: Partial<EventData>) => void
  deleteEvent: (id: string) => void
  addDrop: (drop: DropData) => void
  updateDrop: (id: string, updates: Partial<DropData>) => void
  deleteDrop: (id: string) => void
  addNews: (news: NewsData) => void
  updateNews: (id: string, updates: Partial<NewsData>) => void
  deleteNews: (id: string) => void
  updateUserTier: (id: string, tier: string) => void
  updateUserBalance: (id: string, amount: number) => void
  deleteUser: (id: string) => void
}

function calculateTier(credits: number): string {
  if (credits >= 50000) return 'SOVEREIGN'
  if (credits >= 15000) return 'LORD'
  if (credits >= 5000) return 'KNIGHT'
  if (credits >= 1000) return 'SQUIRE'
  return 'PHANTOM'
}

const STORAGE_KEY = 'vortex.store.v1'

const StoreContext = createContext<StoreContextValue | null>(null)

const defaultEvents: EventData[] = [
  { id: 'neon-chaos-2025', name: 'NEON CHAOS 2025', date: '2025_02_14', category: 'Festival', status: 'ACTIVE', ticketsLeft: 145, capacity: 500, venue: 'THE_FOUNDRY', price: 1500, image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80', audioName: 'VOID_ZERO PREVIEW', audioArtist: 'TECHNO', audioSrc: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3', colorClasses: 'border-white hover:border-white', btnColor: 'bg-primary text-black' },
  { id: 'synthwave-nights', name: 'SYNTHWAVE NIGHTS', date: '2025_03_21', category: 'Konser', status: 'ACTIVE', ticketsLeft: 500, capacity: 500, venue: 'SKY GARDEN', price: 2000, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80', colorClasses: 'border-white hover:border-white', btnColor: 'bg-secondary text-black' },
  { id: 'static-pulse', name: 'STATIC PULSE', date: '2025_01_05', category: 'Musik', status: 'LOCKED', ticketsLeft: 0, capacity: 300, venue: 'VOID_STATION_4', price: 1000, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80', audioName: 'NEURAL_SYNC PREVIEW', audioArtist: 'DARK TECHNO', audioSrc: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3', colorClasses: 'border-white hover:border-white', btnColor: 'bg-hot-coral text-black' },
]

const defaultDrops: DropData[] = [
  { id: 'holo-jacket', title: 'HOLO VER 3.0 JACKET', price: 15000, rarity: 'LEGENDARY', stock: 50, reqTier: 'LORD', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80' },
  { id: 'neon-mask', title: 'LED SOUND RESPONSIVE MASK', price: 5000, rarity: 'EPIC', stock: 200, reqTier: 'KNIGHT', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80' },
  { id: 'cyber-glasses', title: 'AR SYNTH SHADES', price: 2500, rarity: 'RARE', stock: 500, reqTier: 'SQUIRE', image: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&q=80' },
]

const defaultNews: NewsData[] = [
  { id: 'news-1', date: 'JAN 15, 2025', tag: 'URGENT', tagColor: 'bg-hot-coral text-black', title: 'SECURITY PROTOCOL UPDATE', content: 'Vortex Systems implementing biometric signature verification for all upcoming 2025 events. Refresh your profile data.' },
  { id: 'news-2', date: 'JAN 12, 2025', tag: 'NEW_DROP', tagColor: 'bg-primary text-black', title: 'NEON CHAOS LINEUP LEAKED', content: 'Phase 1 headliners confirmed. Expect heavy bass and sensory overload. Tickets selling at record speeds.' },
  { id: 'news-3', date: 'JAN 08, 2025', tag: 'UPDATE', tagColor: 'border border-zinc-600 text-zinc-400', title: 'STATION 4 RENOVATION', content: 'VOID Station 4 expanding capacity by 20%. New visual array installed for STATIC PULSE.' },
  { id: 'news-4', date: 'JAN 05, 2025', tag: 'BREAKING', tagColor: 'bg-hot-coral text-black', title: 'LOST_SIGNAL DETECTED', content: 'Hidden coordinates found in recent merch drop. Decrypt for secret venue access.' },
]

const defaultUsers: UserAccount[] = [
  { id: 'usr-001', name: 'NEON_RIDER', email: 'neon@vortex.sys', tier: 'KNIGHT', credits: 12500, joinDate: '2024-11-12', lastActive: '2026-03-20T08:23:00Z' },
  { id: 'usr-002', name: 'CYBER_PUNK', email: 'punk@edge.net', tier: 'PHANTOM', credits: 200, joinDate: '2025-01-01', lastActive: '2026-03-20T07:10:00Z' },
  { id: 'usr-003', name: 'VOID_WALKER', email: 'void@shadow.realm', tier: 'SOVEREIGN', credits: 154000, joinDate: '2023-04-20', lastActive: '2026-03-20T09:14:00Z' },
  { id: 'usr-004', name: 'GLITCH_BUNNY', email: 'glitch@vortex.sys', tier: 'LORD', credits: 45000, joinDate: '2024-08-05', lastActive: '2026-03-20T02:15:00Z' },
]

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<{ cart: CartItem[]; ownedTickets: Ticket[]; credits: number; orderHistory: OrderHistoryItem[]; events: EventData[]; drops: DropData[]; news: NewsData[]; users: UserAccount[] }>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migrate old events: add missing category + fix broken image URLs
        const migratedEvents = (parsed.events || defaultEvents).map((e: any) => {
          const defaultMatch = defaultEvents.find(d => d.id === e.id)
          const patched = { ...e }
          if (!patched.category) {
            patched.category = defaultMatch?.category || 'Lainnya'
          }
          if (patched.id === 'static-pulse' && patched.image?.includes('photo-1558317751')) {
            patched.image = defaultMatch?.image || patched.image
          }
          return patched
        })
        return { 
          cart: parsed.cart || [], 
          ownedTickets: parsed.ownedTickets || [], 
          credits: parsed.credits || 0, 
          orderHistory: parsed.orderHistory || [],
          events: migratedEvents,
          drops: parsed.drops || defaultDrops,
          news: parsed.news || defaultNews,
          users: parsed.users || defaultUsers
        }
      } catch (e) {
        // ignore
      }
    }
    return { cart: [], ownedTickets: [], credits: 0, orderHistory: [], events: defaultEvents, drops: defaultDrops, news: defaultNews, users: defaultUsers }
  })

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }, [store])

  // Fetch from Laravel API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/events')
        const result = await response.json()
        if (result.data) {
          const apiEvents = result.data.map((e: any) => {
            const ticketTotalSupply = e.ticket_types ? e.ticket_types.reduce((sum: number, tt: any) => sum + Number(tt.available_stock), 0) : 0
            const mainPrice = e.ticket_types && e.ticket_types.length > 0 ? Number(e.ticket_types[0].price) : 0
            
            let activeImage = 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80';
            if (e.banner_url) {
               activeImage = e.banner_url.startsWith('http') ? e.banner_url : (e.banner_url.startsWith('/') ? 'http://127.0.0.1:8000' + e.banner_url : 'http://127.0.0.1:8000/' + e.banner_url);
            }

            return {
              id: e.event_id.toString(),
              name: e.title,
              date: e.start_time ? e.start_time.split(' ')[0].replace(/-/g, '_') : 'TBA',
              status: e.status ? e.status.toUpperCase() : 'ACTIVE',
              ticketsLeft: ticketTotalSupply,
              capacity: ticketTotalSupply > 0 ? ticketTotalSupply : 500, // mock capacity
              venue: e.location || 'THE_FOUNDRY',
              price: mainPrice,
              image: activeImage,
              colorClasses: 'border-white hover:border-white',
              btnColor: 'bg-primary text-black'
            }
          })
          
          console.log("Database Events Loaded:", apiEvents);
          setStore(prev => ({
            ...prev,
            events: apiEvents
          }))
        }
      } catch (err) {
        console.error('Failed to fetch events from backend', err)
      }
    }
    
    fetchEvents()
  }, [])

  const addToCart = (items: CartItem[]) => {
    setStore(prev => ({ ...prev, cart: [...prev.cart, ...items] }))
  }

  const removeFromCart = (id: string) => {
    setStore(prev => ({ ...prev, cart: prev.cart.filter(c => c.id !== id) }))
  }

  const clearCart = () => {
    setStore(prev => ({ ...prev, cart: [] }))
  }

  const checkout = (tickets: Ticket[], earnedCredits: number, cartItemIdsToRemove: string[]) => {
    setStore(prev => {
      const removedItems = prev.cart.filter(item => cartItemIdsToRemove.includes(item.id))
      const total = removedItems.reduce((acc, item) => acc + item.price, 0)
      const newOrder: OrderHistoryItem = {
        id: `ORD-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
        date: new Date().toISOString(),
        items: removedItems.map(item => ({ title: item.title, price: item.price })),
        total: total + (total * 0.08) + (removedItems.some(i => i.ticketId) ? 12.5 : 5.0),
        creditsEarned: earnedCredits
      }
      // Automatic stock management: decrement ticketsLeft per event
      const ticketCountByEvent: Record<string, number> = {}
      removedItems.forEach(item => {
        if (item.ticketId && item.eventId) {
          ticketCountByEvent[item.eventId] = (ticketCountByEvent[item.eventId] || 0) + 1
        }
      })
      const updatedEvents = prev.events.map(e => {
        const sold = ticketCountByEvent[e.id]
        if (sold) {
          const newLeft = Math.max(0, e.ticketsLeft - sold)
          return { ...e, ticketsLeft: newLeft, status: newLeft === 0 ? 'LOCKED' as const : e.status }
        }
        return e
      })
      return {
        ...prev,
        cart: prev.cart.filter(item => !cartItemIdsToRemove.includes(item.id)),
        ownedTickets: [...prev.ownedTickets, ...tickets],
        credits: prev.credits + earnedCredits,
        orderHistory: [...prev.orderHistory, newOrder],
        events: updatedEvents
      }
    })
  }

  const getEventStock = (eventId: string): number => {
    const event = store.events.find(e => e.id === eventId)
    return event?.ticketsLeft ?? 0
  }

  const deleteTicket = (ticketId: string) => {
    setStore(prev => ({
      ...prev,
      ownedTickets: prev.ownedTickets.filter(t => t.ticketId !== ticketId)
    }))
  }

  const checkInTicket = (ticketId: string) => {
    setStore(prev => ({
      ...prev,
      ownedTickets: prev.ownedTickets.map(t => t.ticketId === ticketId ? { ...t, status: 'SCANNED' } : t)
    }))
  }

  const addCredits = (amount: number) => {
    setStore(prev => ({
      ...prev,
      credits: prev.credits + amount
    }))
  }

  const addEvent = (event: EventData) => setStore(prev => ({ ...prev, events: [...prev.events, event] }))
  const updateEvent = (id: string, updates: Partial<EventData>) => setStore(prev => ({
    ...prev,
    events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
  }))
  const deleteEvent = (id: string) => setStore(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }))

  const addDrop = (drop: DropData) => setStore(prev => ({ ...prev, drops: [...prev.drops, drop] }))
  const updateDrop = (id: string, updates: Partial<DropData>) => setStore(prev => ({
    ...prev,
    drops: prev.drops.map(d => d.id === id ? { ...d, ...updates } : d)
  }))
  const deleteDrop = (id: string) => setStore(prev => ({ ...prev, drops: prev.drops.filter(d => d.id !== id) }))

  const addNews = (newsItem: NewsData) => setStore(prev => ({ ...prev, news: [newsItem, ...prev.news] }))
  const updateNews = (id: string, updates: Partial<NewsData>) => setStore(prev => ({
    ...prev,
    news: prev.news.map(n => n.id === id ? { ...n, ...updates } : n)
  }))
  const deleteNews = (id: string) => setStore(prev => ({ ...prev, news: prev.news.filter(n => n.id !== id) }))

  const updateUserTier = (id: string, tier: string) => setStore(prev => ({
    ...prev,
    users: prev.users.map(u => u.id === id ? { ...u, tier } : u)
  }))

  const updateUserBalance = (id: string, amount: number) => setStore(prev => ({
    ...prev,
    users: prev.users.map(u => u.id === id ? { ...u, credits: Math.max(0, u.credits + amount) } : u)
  }))

  const deleteUser = (id: string) => setStore(prev => ({
    ...prev,
    users: prev.users.filter(u => u.id !== id)
  }))

  const tier = useMemo(() => calculateTier(store.credits), [store.credits])

  const value = useMemo<StoreContextValue>(() => ({
    ...store,
    tier,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    getEventStock,
    deleteTicket,
    checkInTicket,
    addCredits,
    addEvent,
    updateEvent,
    deleteEvent,
    addDrop,
    updateDrop,
    deleteDrop,
    addNews,
    updateNews,
    deleteNews,
    updateUserTier,
    updateUserBalance,
    deleteUser
  }), [store, tier])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
