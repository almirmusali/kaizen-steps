import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?:    Size
}

const variants: Record<Variant, string> = {
  primary:   'bg-accent-500 hover:bg-accent-600 text-white',
  secondary: 'bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200',
  ghost:     'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400',
  danger:    'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500',
}

const sizes: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-sm',
  md:  'px-4 py-2 text-sm',
  lg:  'px-5 py-3 text-base',
}

export function Button({ variant = 'secondary', size = 'md', className, children, ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl font-medium transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  )
}
