export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}с`
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m}м`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem ? `${h}ч ${rem}м` : `${h}ч`
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekStartStr(date?: Date): string {
  return getWeekStart(date).toISOString().slice(0, 10)
}
