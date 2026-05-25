import { clsx } from 'clsx'

interface Props {
  label:    string
  color?:   string  // hex color
  className?: string
}

export function GoalBadge({ label, color, className }: Props) {
  return (
    <span
      className={clsx('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', className)}
      style={{ backgroundColor: color ? `${color}22` : undefined, color: color ?? undefined }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
        style={{ backgroundColor: color ?? '#a8a29e' }}
      />
      {label}
    </span>
  )
}
