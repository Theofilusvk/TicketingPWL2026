import React, { useState, useEffect } from 'react'
import { Plus, X, Trash2, Edit2, Send } from 'lucide-react'
import { useToast } from '../../components/Toast'

interface Notification {
  notification_id: number
  event_id: number | null
  title: string
  message: string
  type: string
  logo_url: string | null
  is_read: boolean
  created_at: string
}

interface Event {
  event_id: number
  title: string
}

export function AdminNotificationPage() {
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null)
  const [filter, setFilter] = useState('all')
  const token = localStorage.getItem('vortex.auth.token')

  const [formData, setFormData] = useState({
    event_id: '',
    type: 'admin_broadcast',
    title: '',
    message: '',
    logo_url: '',
    user_ids: [],
  })

  useEffect(() => {
    fetchNotifications()
    fetchEvents()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      setNotifications(data.data || data)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data.data || data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        ...formData,
        event_id: formData.event_id ? parseInt(formData.event_id) : null,
      }

      const response = await fetch('/api/admin/notifications/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        fetchNotifications()
        setShowModal(false)
        resetForm()
        showToast('Notification broadcast successfully', 'success')
      } else {
        showToast('Failed to broadcast notification', 'error')
      }
    } catch (err) {
      console.error('Failed to create notification:', err)
      showToast('Network error', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      event_id: '',
      type: 'admin_broadcast',
      title: '',
      message: '',
      logo_url: '',
      user_ids: [],
    })
    setEditingNotif(null)
  }

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'ticket_purchased': 'bg-green-900/50 text-green-300 border-green-700',
      'payment_success': 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
      'payment_failed': 'bg-red-900/50 text-red-300 border-red-700',
      'waiting_list_available': 'bg-blue-900/50 text-blue-300 border-blue-700',
      'event_reminder': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
      'event_canceled': 'bg-red-900/50 text-red-300 border-red-700',
      'admin_broadcast': 'bg-primary/30 text-primary border-primary',
    }
    return colors[type] || 'bg-zinc-700/50 text-zinc-300 border-zinc-600'
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'broadcast') return !n.event_id
    if (filter === 'event') return !!n.event_id
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out transition-all z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-white tracking-tight drop-shadow-md">
            Notification Control
          </h1>
          <p className="text-sm font-medium text-white/50 mt-1.5">
            Broadcast messages and manage user notifications with custom logos and event linking
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary/20 hover:bg-primary/30 border border-primary text-primary font-semibold tracking-wide text-sm px-6 py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          New Notification
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'broadcast', label: 'Broadcasts' },
          { value: 'event', label: 'Event-specific' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-accent text-xs uppercase tracking-wider transition-all ${
              filter === tab.value
                ? 'bg-primary text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-[32px] overflow-hidden shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="p-8 text-center text-zinc-400">Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">No notifications yet</div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {filteredNotifications.map(notif => (
              <div
                key={notif.notification_id}
                className="p-6 hover:bg-white/[0.05] transition-colors duration-300 group flex items-start justify-between"
              >
                <div className="flex items-start gap-4 flex-1">
                  {notif.logo_url && (
                    <img
                      src={notif.logo_url}
                      alt="notification logo"
                      className="w-12 h-12 rounded border border-white/10 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display text-lg text-white">{notif.title}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${getTypeColor(notif.type)}`}>
                        {notif.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {notif.is_read && (
                        <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded">READ</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      {notif.event_id && (
                        <span className="bg-zinc-800/50 px-2 py-1 rounded">
                          Event ID: {notif.event_id}
                        </span>
                      )}
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button className="p-2 hover:bg-zinc-700 rounded transition-colors">
                    <Edit2 className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button className="p-2 hover:bg-red-900/30 rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-[60px] border border-white/[0.15] rounded-[32px] w-full max-w-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 ease-out">
            <div className="p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white tracking-tight">
                  {editingNotif ? 'Edit Notification' : 'Create Notification'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Notification Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm"
                  >
                    <option value="admin_broadcast">Admin Broadcast</option>
                    <option value="event_reminder">Event Reminder</option>
                    <option value="event_canceled">Event Canceled</option>
                    <option value="ticket_purchased">Ticket Purchased</option>
                    <option value="payment_success">Payment Success</option>
                    <option value="payment_failed">Payment Failed</option>
                    <option value="waiting_list_available">Waiting List Available</option>
                  </select>
                </div>

                {/* Event Selection (optional) */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Link to Event (Optional)
                  </label>
                  <select
                    value={formData.event_id}
                    onChange={e => setFormData({ ...formData, event_id: e.target.value })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm"
                  >
                    <option value="">-- No Event Link --</option>
                    {events.map(evt => (
                      <option key={evt.event_id} value={evt.event_id.toString()}>
                        {evt.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={200}
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm placeholder-zinc-600 focus:border-primary outline-none transition-colors"
                    placeholder="Notification title"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={4}
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm placeholder-zinc-600 focus:border-primary outline-none transition-colors resize-none"
                    placeholder="Notification message"
                  />
                </div>

                {/* Logo URL */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">
                    Logo/Image URL (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                      className="flex-1 bg-zinc-800/50 border border-zinc-700 text-white rounded px-3 py-2 font-mono text-sm placeholder-zinc-600 focus:border-primary outline-none transition-colors"
                      placeholder="https://..."
                    />
                    {formData.logo_url && (
                      <img
                        src={formData.logo_url}
                        alt="preview"
                        className="w-10 h-10 rounded border border-zinc-700 object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-zinc-800 text-white font-semibold text-sm hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-2xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
