import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { Navigation }       from './components/features/Navigation'
import { SuggestionToast }  from './components/features/SuggestionToast'
import { HomeScreen }       from './screens/Home'
import { InboxScreen }      from './screens/Inbox'
import { ProjectsScreen }   from './screens/Projects'
import { GoalsScreen }      from './screens/Goals'
import { ReviewScreen }     from './screens/Review'
import { JournalScreen }    from './screens/Journal'
import { AISettingsScreen } from './screens/AISettings'

export default function App() {
  const {
    screen, theme, loadAll,
    goals, nextSuggestion, dismissSuggestion, scheduleToday,
  } = useStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const screens = {
    home:       <HomeScreen />,
    inbox:      <InboxScreen />,
    projects:   <ProjectsScreen />,
    goals:      <GoalsScreen />,
    review:     <ReviewScreen />,
    journal:    <JournalScreen />,
    aiSettings: <AISettingsScreen />,
  }

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-100 transition-colors">
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
          {screens[screen]}
        </main>
      </div>

      {/* Тост «следующий шаг» — всплывает после завершения любой задачи */}
      <SuggestionToast
        suggestion={nextSuggestion}
        goals={goals}
        onAccept={(taskId) => {
          scheduleToday(taskId)
          dismissSuggestion()
        }}
        onDismiss={dismissSuggestion}
      />
    </div>
  )
}
