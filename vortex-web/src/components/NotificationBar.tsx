import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X, Check, Loader, ArrowRight } from 'lucide-react'

interface Notification {
  notification_id: number
  user_id: number
  event_id: number | null
  type: string
  title: string
  message: string
  logo_url: string | null
  is_read: boolean
  created_at: string
  updated_at: string
}

interface PopupNotif {
  notification_id: number
  title: string
  message: string
  type: string
  logo_url: string | null
}

export function NotificationBar() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [popupNotifs, setPopupNotifs] = useState<PopupNotif[]>([])

  const token = localStorage.getItem('vortex.auth.token')

  useEffect(() => {
    if (token) {
      fetchUnreadCount()
      fetchNotifications()
      
      // Poll for new notifications every 10 seconds for real-time feel
      const interval = setInterval(() => {
        fetchUnreadCount()
        fetchNotifications()
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [token])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      const data = await response.json()
      setUnreadCount(data.unread_count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications?per_page=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      const data = await response.json()
      const newNotifications = data.data || data
      
      // Detect new unread notifications and show pop-up
      newNotifications.forEach((notif: Notification) => {
        const existingNotif = notifications.find(n => n.notification_id === notif.notification_id)
        if (!existingNotif && !notif.is_read) {
          // New unread notification - show as pop-up
          showPopupNotification(notif)
        }
      })
      
      setNotifications(newNotifications)
      setError('')
    } catch (err) {
      setError('Failed to fetch notifications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showPopupNotification = (notif: Notification) => {
    const popupItem: PopupNotif = {
      notification_id: notif.notification_id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      logo_url: notif.logo_url,
    }
    
    setPopupNotifs(prev => [...prev, popupItem])
    
    // Auto-remove pop-up after 5 seconds
    setTimeout(() => {
      setPopupNotifs(prev => prev.filter(p => p.notification_id !== notif.notification_id))
    }, 5000)
  }

  const handleOpen = () => {
    setIsOpen(true)
    fetchNotifications()
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.notification_id === notificationId ? { ...n, is_read: true } : n
      ))
      fetchUnreadCount()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      
      setNotifications(notifications.filter(n => n.notification_id !== notificationId))
      fetchUnreadCount()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const goToEvent = (eventId: number | null) => {
    if (eventId) {
      navigate(`/events/${eventId}`)
      setIsOpen(false) // Close notification panel
    }
  }

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'ticket_purchased': 'bg-green-900 text-green-300',
      'payment_success': 'bg-emerald-900 text-emerald-300',
      'payment_failed': 'bg-red-900 text-red-300',
      'waiting_list_available': 'bg-blue-900 text-blue-300',
      'event_reminder': 'bg-yellow-900 text-yellow-300',
      'event_canceled': 'bg-red-900 text-red-300',
      'admin_broadcast': 'bg-primary text-black',
    }
    return colors[type] || 'bg-zinc-700 text-zinc-300'
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  if (!token) return null

  return (
    <>
      {/* Notification Bell Icon */}
      <button
        onClick={handleOpen}
        className="relative p-2 hover:bg-zinc-800 rounded transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-hot-coral text-black text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="fixed top-20 right-4 w-96 max-h-96 bg-black border-2 border-primary z-50 overflow-y-auto shadow-lg">
          {/* Header */}
          <div className="sticky top-0 bg-black border-b-2 border-primary p-4 flex justify-between items-center">
            <h3 className="font-display text-primary text-lg uppercase tracking-wider">
              NOTIFICATIONS {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary hover:text-hot-coral transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-400 text-sm text-center py-8">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-zinc-400 text-sm text-center py-8">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className={`p-3 border border-primary rounded ${
                      notif.is_read ? 'bg-zinc-900' : 'bg-zinc-800'
                    } hover:border-hot-coral transition-colors group`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.logo_url && (
                        <img
                          src={notif.logo_url}
                          alt="Event"
                          className="w-8 h-8 rounded object-cover flex-shrink-0 mt-1"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${getTypeColor(notif.type)}`}>
                            {notif.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-hot-coral rounded-full mt-1"></div>
                          )}
                        </div>
                        <h4 className="font-display text-sm text-primary truncate">
                          {notif.title}
                        </h4>
                        <p className="font-accent text-xs text-zinc-400 line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-xs text-zinc-500 mt-1 block">
                          {formatTime(notif.created_at)}
                        </span>
                        {notif.event_id && (
                          <button
                            onClick={() => goToEvent(notif.event_id)}
                            className="mt-2 flex items-center gap-1 text-xs bg-primary text-black px-2 py-1 rounded font-bold hover:bg-hot-coral transition-colors"
                          >
                            View Event
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.notification_id)}
                            className="p-1 hover:text-primary text-zinc-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.notification_id)}
                          className="p-1 hover:text-hot-coral text-zinc-400 transition-colors"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t-2 border-primary p-4 flex gap-2">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex-1 py-2 px-3 bg-primary text-black font-accent font-bold text-xs uppercase tracking-wider hover:bg-hot-coral disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
              >
                Mark All Read
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Pop-up Notifications */}
      <div className="fixed bottom-4 left-4 space-y-2 z-50 max-w-sm pointer-events-none">
        {popupNotifs.map((popup) => (
          <div
            key={popup.notification_id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
          >
            <div className={`border-2 border-primary rounded p-4 bg-black shadow-lg flex gap-3 items-start ${getTypeColor(popup.type)}/20`}>
              {popup.logo_url && (
                <img
                  src={popup.logo_url}
                  alt="Notification"
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getTypeColor(popup.type)}`}>
                    {popup.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <h4 className="font-display text-sm text-primary">
                  {popup.title}
                </h4>
                <p className="font-accent text-xs text-zinc-300 mt-1">
                  {popup.message}
                </p>
              </div>
              <button
                onClick={() => setPopupNotifs(prev => prev.filter(p => p.notification_id !== popup.notification_id))}
                className="text-zinc-500 hover:text-primary p-1 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
