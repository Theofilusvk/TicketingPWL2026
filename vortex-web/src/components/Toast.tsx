import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type ToastVariant = 'success' | 'error' | 'info'

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const ICONS: Record<ToastVariant, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
}

const COLORS: Record<ToastVariant, string> = {
  success: 'border-l-4 border-[#CBFF00] bg-[#CBFF00]/10 text-[#CBFF00]',
  error: 'border-l-4 border-[#FF4D4D] bg-[#FF4D4D]/10 text-[#FF4D4D]',
  info: 'border-l-4 border-white bg-white/10 text-white',
}

function ToastSlot({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
    timerRef.current = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 3500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [toast.id, onDismiss])

  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ${COLORS[toast.variant]} ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ minWidth: '280px', maxWidth: '420px' }}
    >
      <span className="material-symbols-outlined text-lg shrink-0">{ICONS[toast.variant]}</span>
      <p className="font-accent text-[10px] uppercase tracking-widest leading-relaxed flex-1">{toast.message}</p>
      <button onClick={() => { setIsVisible(false); setTimeout(() => onDismiss(toast.id), 300) }} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-4), { id, message, variant }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-auto">
        {toasts.map(t => (
          <ToastSlot key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
