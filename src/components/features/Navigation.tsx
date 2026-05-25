import { Home, Inbox, FolderOpen, Target, BarChart2, BookOpen, Settings } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '../../store/useStore'
import { ru } from '../../i18n/ru'
import type { ComponentType } from 'react'

type Screen = 'home' | 'inbox' | 'projects' | 'goals' | 'review' | 'journal' | 'aiSettings'

interface NavItem {
  id:    Screen
  label: string
  Icon:  ComponentType<{ size?: number; className?: string }>
}

const items: NavItem[] = [
  { id: 'home',       label: ru.nav.home,       Icon: Home },
  { id: 'inbox',      label: ru.nav.inbox,      Icon: Inbox },
  { id: 'projects',   label: ru.nav.projects,   Icon: FolderOpen },
  { id: 'goals',      label: ru.nav.goals,      Icon: Target },
  { id: 'review',     label: ru.nav.review,     Icon: BarChart2 },
  { id: 'journal',    label: ru.nav.journal,    Icon: BookOpen },
  { id: 'aiSettings', label: ru.nav.aiSettings, Icon: Settings },
]

export function Navigation() {
  const { screen, setScreen, inbox } = useStore()
  const inboxCount = inbox.length

  return (
    <>
      {/* Боковая навигация (десктоп) */}
      <nav className="hidden sm:flex flex-col gap-1 w-56 flex-shrink-0 px-3 py-6 border-r border-surface-200 dark:border-surface-700">
        <div className="px-3 pb-6">
          <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">Кайдзен</p>
          <p className="text-xs text-surface-400">маленькие шаги</p>
        </div>
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
              screen === id
                ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800',
            )}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {id === 'inbox' && inboxCount > 0 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                {inboxCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Нижняя навигация (мобайл) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-t border-surface-200 dark:border-surface-700 px-2 pb-safe">
        <div className="flex">
          {items.slice(0, 5).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className={clsx(
                'flex-1 flex flex-col items-center gap-0.5 pt-2 pb-3 transition-colors',
                screen === id
                  ? 'text-accent-500'
                  : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300',
              )}
            >
              <div className="relative">
                <Icon size={20} />
                {id === 'inbox' && inboxCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                    {inboxCount > 9 ? '!' : inboxCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
