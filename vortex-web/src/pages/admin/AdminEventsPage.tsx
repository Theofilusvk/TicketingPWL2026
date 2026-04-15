import { useState, useRef, useMemo, useEffect } from 'react'
import { type EventData, EVENT_CATEGORIES, type EventCategory } from '../../lib/store'

type EventFormData = {
  name: string
  description: string
  startDate: string
  endDate: string
  category: EventCategory
  category_id?: string
  status: 'ACTIVE' | 'DRAFT' | 'LOCKED' | 'COMPLETED'
  capacity: number
  venue: string
  price: number
}

const INITIAL_FORM: EventFormData = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  category: 'Musik',
  category_id: '',
  status: 'ACTIVE',
  capacity: 500,
  venue: '',
  price: 1500,
}

function getEventStatus(event: EventData): { label: string; color: string } {
  // Auto-detect "Past" from date
  const dateParts = event.date.replace(/_/g, '-')
  const eventDate = new Date(dateParts)
  const now = new Date()
  if (!isNaN(eventDate.getTime()) && eventDate < now && event.status !== 'ACTIVE') {
    return { label: 'PAST', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
  }
  switch (event.status) {
    case 'ACTIVE':
      return { label: 'ACTIVE', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]' }
    case 'COMPLETED':
      return { label: 'COMPLETED', color: 'bg-sky-500/10 text-sky-300 border-sky-500/20' }
    case 'LOCKED':
      return { label: 'SOLD OUT', color: 'bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[0_0_15px_rgba(251,113,133,0.1)]' }
    case 'DRAFT':
    default:
      return { label: 'DRAFT', color: 'bg-white/5 text-white/50 border-white/10' }
  }
}

export function AdminEventsPage() {
  const [apiEvents, setApiEvents] = useState<EventData[]>([])
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setCategories(json.data.map((c: any) => ({ id: String(c.category_id), name: c.name })))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/events')
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          const mapped = json.data.map((e: any) => {
            // Aggregate ticket data
            const tickets = e.ticket_types || []
            const totalStock = tickets.reduce((acc: number, t: any) => acc + t.available_stock, 0)
            const minPrice = tickets.length > 0 ? Math.min(...tickets.map((t: any) => parseFloat(t.price))) : 0
            
            return {
              id: String(e.event_id),
              name: e.title,
              date: e.start_time.split(' ')[0], // YYYY-MM-DD
              endDate: e.end_time ? e.end_time.split(' ')[0] : undefined,
              category: e.category ? e.category.name : 'Unknown',
              status: e.status ? e.status.toUpperCase() : (new Date(e.start_time) < new Date() ? 'PAST' : 'ACTIVE'),
              capacity: totalStock > 0 ? totalStock : 500,
              ticketsLeft: totalStock > 0 ? totalStock : 500,
              venue: e.location,
              price: minPrice,
              image: e.banner_url || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80',
            }
          })
          setApiEvents(mapped)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchCategories()
  }, [])

  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailEvent, setDetailEvent] = useState<EventData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  const [form, setForm] = useState<EventFormData>(INITIAL_FORM)

  // Filtered events
  const filteredEvents = useMemo(() => {
    return apiEvents.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchQuery.toLowerCase())
      const status = getEventStatus(e)
      const matchesFilter = filterStatus === 'ALL' || status.label === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [apiEvents, searchQuery, filterStatus])

  const openAddModal = () => {
    setIsEditing(false)
    setEditingId(null)
    setForm(INITIAL_FORM)
    setPosterFile(null)
    setPosterPreview(null)
    setFileError(null)
    setShowModal(true)
  }

  const openEditModal = (event: EventData) => {
    setIsEditing(true)
    setEditingId(event.id)
    const dateStr = event.date.replace(/_/g, '-')
    setForm({
      name: event.name,
      description: '',
      startDate: dateStr,
      endDate: dateStr,
      category: event.category || 'Musik',
      // Get the correct category_id based on the currently displayed category name
      category_id: categories.find(c => c.name === event.category)?.id || '',
      status: event.status,
      capacity: event.capacity,
      venue: event.venue,
      price: event.price,
    })
    setPosterFile(null)
    setPosterPreview(event.image || null)
    setFileError(null)
    setShowModal(true)
  }

  const openDetailModal = (event: EventData) => {
    setDetailEvent(event)
    setShowDetailModal(true)
  }

  const validateFile = (file: File): boolean => {
    setFileError(null)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setFileError('File harus berformat JPG atau PNG.')
      return false
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 2MB.')
      return false
    }
    return true
  }

  const handlePosterUpload = (file: File) => {
    if (!validateFile(file)) return
    setPosterFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPosterPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePosterUpload(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.startDate) return

    try {
      const formData = new FormData()
      formData.append('title', form.name)
      formData.append('description', form.description)
      formData.append('location', form.venue || 'THE FOUNDRY')
      formData.append('start_time', `${form.startDate} 19:00:00`)
      formData.append('end_time', `${form.endDate || form.startDate} 23:59:59`)
      formData.append('organizer_id', '2') // Usually mapped to auth()->id() if backend expects matching ID
      formData.append('category_id', form.category_id || (categories.length > 0 ? categories[0].id : '1'))
      formData.append('status', 'active')

      // Send default ticket payload so it's a valid usable event
      formData.append('ticket_types[0][name]', 'General Admission')
      formData.append('ticket_types[0][price]', '150000')
      formData.append('ticket_types[0][available_stock]', '500')

      if (posterFile) {
        formData.append('banner', posterFile)
      }

      if (isEditing) {
        formData.append('_method', 'PUT')
      }

      const url = isEditing
        ? `/api/events/${editingId}`
        : '/api/events'

      const token = localStorage.getItem('vortex.auth.token')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.data) {
        await fetchEvents() // Re-fetch from API to update the list instead of manual store manipulation
        setShowModal(false)
        setForm(INITIAL_FORM)
        setPosterPreview(null)
        setPosterFile(null)
      } else {
        alert('Action failed: ' + (result.message || 'Validation error'))
      }
    } catch (err) {
      alert('Could not connect to backend.')
    }
  }

  const handleDelete = async (event: EventData) => {
    setDeleteError(null)

    // Check if tickets have been ordered
    const ticketsSold = event.capacity - event.ticketsLeft
    if (ticketsSold > 0) {
      setDeleteError(`Cannot delete "${event.name}" — ${ticketsSold} ticket(s) already ordered.`)
      setTimeout(() => setDeleteError(null), 5000)
      return
    }

    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) return

    try {
      const token = localStorage.getItem('vortex.auth.token') || localStorage.getItem('auth_token')
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        await fetchEvents() // Fetch latest event list after deletion
      } else {
        alert('Could not delete event from database.')
      }
    } catch (err) {
      alert('Network error.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">Event Management</h1>
          <p className="text-sm font-medium text-white/50 mt-1.5 flex items-center gap-2">
            Add, edit, and monitor global events
            {isLoading && <span className="text-indigo-400 animate-pulse">(Connecting to live data...)</span>}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_-8px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
          New Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined text-[18px] text-white/30 absolute left-4 top-1/2 -translate-y-1/2">search</span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'DRAFT', 'SOLD OUT', 'PAST'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all duration-300 ${
                filterStatus === status
                  ? 'bg-white/15 text-white border-white/20'
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Error Toast */}
      {deleteError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-rose-400 text-[20px]">error</span>
          <p className="text-sm text-rose-300 font-medium">{deleteError}</p>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Poster</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Event Name</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Kategori</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Date Range</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Capacity</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Price</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="p-5 text-[11px] font-semibold text-white/40 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredEvents.map((event) => {
                const status = getEventStatus(event)
                const ticketsSold = event.capacity - event.ticketsLeft
                return (
                  <tr key={event.id} className="hover:bg-white/[0.03] transition-colors duration-300 group cursor-pointer" onClick={() => openDetailModal(event)}>
                    <td className="p-4">
                      <div className="w-12 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/[0.08] shadow-sm">
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="font-semibold text-sm text-white/90">{event.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">{event.venue}</p>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md bg-white/5 text-white/60 border-white/10">
                        {event.category || 'N/A'}
                      </span>
                    </td>
                    <td className="p-5 text-sm font-medium text-white/60 font-mono">
                      {event.date.replace(/_/g, '-')}
                      {event.endDate && event.endDate !== event.date && (
                        <span className="text-white/30"> — {event.endDate}</span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3 max-w-[150px]">
                        <div className="flex-1 h-1.5 bg-white/10 border border-white/5 rounded-full relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${event.ticketsLeft > 0 ? 'bg-indigo-400' : 'bg-rose-500'}`}
                            style={{ width: `${Math.max(5, Math.min(100, ((event.capacity - event.ticketsLeft) / event.capacity) * 100))}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-medium text-white/60">{ticketsSold}/{event.capacity}</span>
                      </div>
                    </td>
                    <td className="p-5 font-mono text-sm text-indigo-300">CRD {event.price.toLocaleString()}</td>
                    <td className="p-5">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(event)}
                          className="text-zinc-500 hover:text-white p-1.5 transition-colors"
                          title="Edit event"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors"
                          title="Delete event"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10 mb-3 block">event_busy</span>
                    <p className="text-sm text-white/30">No events found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Preview Modal */}
      {showDetailModal && detailEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-black/70 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-3xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="flex flex-col md:flex-row">
              {/* Poster Preview */}
              <div className="md:w-2/5 relative">
                <img src={detailEvent.image} alt={detailEvent.name} className="w-full h-64 md:h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md shadow-sm ${getEventStatus(detailEvent).color}`}>
                    {getEventStatus(detailEvent).label}
                  </span>
                </div>
              </div>
              {/* Details */}
              <div className="md:w-3/5 p-6 md:p-8 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">{detailEvent.name}</h2>
                    <p className="text-sm text-white/40 mt-1">{detailEvent.venue}</p>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="text-white/30 hover:text-white transition-colors p-1">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Date</p>
                    <p className="text-sm text-white/80 font-mono mt-1">
                      {detailEvent.date.replace(/_/g, '-')}
                      {detailEvent.endDate && detailEvent.endDate !== detailEvent.date && (
                        <span className="text-white/40"> — {detailEvent.endDate}</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Category</p>
                    <p className="text-sm text-white/80 mt-1">{detailEvent.category || 'N/A'}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Price</p>
                    <p className="text-sm text-indigo-300 font-mono mt-1">CRD {detailEvent.price.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Tickets</p>
                    <p className="text-sm text-white/80 font-mono mt-1">{detailEvent.capacity - detailEvent.ticketsLeft}/{detailEvent.capacity} sold</p>
                  </div>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${detailEvent.ticketsLeft > 0 ? 'bg-gradient-to-r from-indigo-500 to-sky-500' : 'bg-rose-500'}`}
                    style={{ width: `${((detailEvent.capacity - detailEvent.ticketsLeft) / detailEvent.capacity) * 100}%` }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowDetailModal(false); openEditModal(detailEvent) }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                  </button>
                  <button
                    onClick={() => { setShowDetailModal(false); handleDelete(detailEvent) }}
                    className="px-4 py-3 rounded-2xl border border-rose-500/20 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); setPosterPreview(null) }}>
          <div className="bg-black/70 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-4xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 relative overflow-hidden max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="flex flex-col md:flex-row">
              {/* Left Side - Poster Preview */}
              <div className="md:w-2/5 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.08] bg-white/[0.01]">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4 self-start">Poster Preview</p>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full aspect-[2/3] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden ${
                    isDragging
                      ? 'border-indigo-400 bg-indigo-500/10'
                      : 'border-white/[0.15] bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handlePosterUpload(file)
                    }}
                  />
                  {posterPreview ? (
                    <div className="absolute inset-0">
                      <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/60 rounded-2xl px-4 py-2 backdrop-blur-md">
                          <span className="text-white text-xs font-medium">Click to change</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-white/20">cloud_upload</span>
                      </div>
                      <p className="text-xs font-medium text-white/40 text-center">Drag & drop poster<br/>or click to upload</p>
                      <p className="text-[10px] text-white/20">JPG/PNG only, max 2MB</p>
                    </div>
                  )}
                </div>
                {fileError && (
                  <div className="mt-3 w-full bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                    <p className="text-xs text-rose-400 font-medium">{fileError}</p>
                  </div>
                )}
              </div>

              {/* Right Side - Form */}
              <div className="md:w-3/5 p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-white mb-6 tracking-tight">{isEditing ? 'Update Event' : 'Create New Event'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Event Name</label>
                    <input
                      type="text" required
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20"
                      placeholder="Enter event title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Description</label>
                    <textarea
                      value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20 resize-none"
                      placeholder="Event description..."
                    />
                  </div>

                  {/* Time Range Picker */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Start Date</label>
                      <input
                        type="date" required
                        value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">End Date</label>
                      <input
                        type="date" required
                        value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                        min={form.startDate}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Kategori</label>
                      <select
                        value={form.category_id}
                        onChange={e => setForm({ ...form, category_id: e.target.value })}
                        required
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 [color-scheme:dark] appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-zinc-900 text-white/50">Select category...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Venue</label>
                      <input
                        type="text" required
                        value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20"
                        placeholder="Enter venue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Capacity</label>
                      <input
                        type="number" min="1"
                        value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest pl-1">Price (CRD)</label>
                      <input
                        type="number" min="0"
                        value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => { setShowModal(false); setPosterPreview(null) }} className="flex-1 px-4 py-3.5 rounded-2xl border border-white/[0.1] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] transition-all duration-300">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95">{isEditing ? 'Save Changes' : 'Deploy Event'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
