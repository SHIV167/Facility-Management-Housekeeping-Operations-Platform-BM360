'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'
interface Toast { id: number; message: string; type: ToastType }

const ToastCtx = createContext<{ toast: (message: string, type?: ToastType) => void }>({ toast: () => {} })
export const useToast = () => useContext(ToastCtx)

const styles: Record<ToastType, { bar: string; icon: ReactNode; label: string }> = {
  success: {
    bar: 'border-l-[#16a34a]',
    label: 'Success',
    icon: <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" /></svg>,
  },
  error: {
    bar: 'border-l-[#dc2626]',
    label: 'Error',
    icon: <svg className="w-4 h-4 text-[#dc2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>,
  },
  warning: {
    bar: 'border-l-[#d97706]',
    label: 'Warning',
    icon: <svg className="w-4 h-4 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>,
  },
  info: {
    bar: 'border-l-[#0e4c5e]',
    label: 'Info',
    icon: <svg className="w-4 h-4 text-[#0e4c5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++idRef.current
    setToasts((prev) => [...prev.slice(-4), { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => {
          const s = styles[t.type]
          return (
            <div
              key={t.id}
              className={`bg-white rounded-xl shadow-xl border border-[#e5e7eb] border-l-4 ${s.bar} px-4 py-3 flex items-start gap-3 animate-[toastIn_.25s_ease-out]`}
              role="status"
            >
              <span className="mt-0.5 shrink-0">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">{s.label}</p>
                <p className="text-[13px] text-[#111827] leading-snug mt-0.5">{t.message}</p>
              </div>
              <button onClick={() => dismiss(t.id)} className="text-[#9ca3af] hover:text-[#4b5563] shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )
        })}
      </div>
      <style jsx global>{`@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
    </ToastCtx.Provider>
  )
}
