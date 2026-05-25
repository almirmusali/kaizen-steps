import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  open:     boolean
  onClose:  () => void
  title?:   string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className={clsx(
        'relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-surface-800',
        'shadow-xl border border-surface-100 dark:border-surface-700 animate-slide-up',
        className,
      )}>
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-semibold text-surface-800 dark:text-surface-100">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}
