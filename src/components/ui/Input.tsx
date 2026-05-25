import { clsx } from 'clsx'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const base = 'w-full rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-2.5 text-sm text-surface-800 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-400 transition'

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-surface-500 dark:text-surface-400">{label}</label>}
      <input {...props} className={clsx(base, className)} />
    </div>
  )
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-surface-500 dark:text-surface-400">{label}</label>}
      <textarea {...props} className={clsx(base, 'resize-none', className)} />
    </div>
  )
}
