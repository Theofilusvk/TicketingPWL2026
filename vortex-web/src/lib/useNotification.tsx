import { useState, useEffect } from 'react'

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return

    try {
      const notification = new Notification(title, {
        icon: '/vortex-logo.png', // Fallback icon (can be changed to SVG if handled by SW, but PNG is safer)
        badge: '/vortex-logo.png',
        silent: false,
        ...options,
      })

      notification.onclick = function() {
        window.focus()
        this.close()
      }
    } catch (e) {
      // In some older Android browsers, the Notification constructor throws an error
      // if not called from a Service Worker. We ignore this safely for the mock.
      console.warn('Local notification failed - possibly requires service worker on this platform')
    }
  }

  // Helper to schedule a notification (mocked as setTimeout)
  const scheduleNotification = (title: string, delayMs: number, options?: NotificationOptions) => {
    if (permission !== 'granted') return

    setTimeout(() => {
      sendNotification(title, options)
    }, delayMs)
  }

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleNotification
  }
}
