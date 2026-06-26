import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { STATUS_META } from '../types'
import { IconCheck, IconX } from './icons'

/* ---------------- Toasts ---------------- */

type Toast = { id: number; msg: string; kind: 'ok' | 'err' }
const ToastCtx = createContext<(msg: string, kind?: 'ok' | 'err') => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const notify = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-pop card flex items-center gap-2.5 px-4 py-3 text-sm shadow-2xl"
            style={{ minWidth: 220 }}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full"
              style={{ background: t.kind === 'ok' ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)' }}
            >
              {t.kind === 'ok' ? (
                <IconCheck className="h-3.5 w-3.5" />
              ) : (
                <IconX className="h-3.5 w-3.5" />
              )}
            </span>
            <span className="text-[#dcdce8]">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------------- Status badge ---------------- */

export function StatusBadge({ status }: { status: string | null }) {
  const m = STATUS_META[status ?? 'To Apply'] ?? STATUS_META['To Apply']
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: m.bg, color: m.text, border: `1px solid ${m.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} />
      {status ?? 'To Apply'}
    </span>
  )
}

/* ---------------- Modal ---------------- */

export function Modal({
  open,
  onClose,
  children,
  title,
  width = 520,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  title: string
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      style={{ background: 'rgba(5,5,10,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="card animate-pop my-auto w-full p-5 shadow-2xl"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[--color-muted] hover:bg-[--color-surface-2] hover:text-white"
          >
            <IconX />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
