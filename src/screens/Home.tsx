import { useMemo, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '../store/useStore'
import { AIBar } from '../components/features/AIBar'
import { TaskCard } from '../components/features/TaskCard'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { GoalBadge } from '../components/ui/Badge'
import { ru } from '../i18n/ru'
import { todayStr } from '../utils/date'

const MAX_TODAY = 3

export function HomeScreen() {
  const { tasks, goals, addTask, scheduleToday } = useStore()
  const today = todayStr()

  const todayTasks = useMemo(() =>
    tasks.filter(t => t.status === 'todo' && (t.isToday || t.scheduledDate === today))
      .slice(0, 10),
    [tasks, today]
  )
  const nextTask = todayTasks[0]
  const overloaded = todayTasks.length > MAX_TODAY

  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newGoal, setNewGoal]   = useState('')

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    const task = await addTask({ title: newTitle.trim(), goalId: newGoal || undefined, status: 'todo' })
    await scheduleToday(task.id)
    setNewTitle('')
    setNewGoal('')
    setShowAdd(false)
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8 max-w-xl mx-auto w-full">

      {/* Следующий шаг — крупно */}
      <div className="min-h-[140px] flex flex-col justify-center">
        {nextTask ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{ru.home.nextStep}</p>
            <div className="group flex items-start gap-4">
              <button
                onClick={() => useStore.getState().completeTask(nextTask.id)}
                className={clsx(
                  'mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all',
                  'border-surface-300 dark:border-surface-600 hover:border-accent-400 hover:bg-accent-50',
                )}
              >
                <Check size={12} className="opacity-0 group-hover:opacity-50 mx-auto text-accent-500" strokeWidth={3} />
              </button>
              <div>
                <p className="text-xl sm:text-2xl font-medium text-surface-800 dark:text-surface-100 leading-snug">
                  {nextTask.title}
                </p>
                {(() => {
                  const g = goals.find(g => g.id === nextTask.goalId)
                  return g ? (
                    <p className="mt-1 text-sm text-surface-400">
                      → {g.title}
                    </p>
                  ) : null
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-surface-400 text-lg">✓</p>
            <p className="text-surface-400">{ru.home.noSteps}</p>
          </div>
        )}
      </div>

      {/* Список на сегодня */}
      {todayTasks.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{ru.home.todayList}</p>
            {overloaded && (
              <span className="flex items-center gap-1 text-xs text-amber-500">
                <AlertCircle size={12} /> {ru.home.overload}
              </span>
            )}
          </div>
          {todayTasks.slice(1).map(t => (
            <TaskCard key={t.id} task={t} goals={goals} compact />
          ))}
          <button
            onClick={() => setShowAdd(true)}
            className="w-full text-left px-3 py-2 text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            + {ru.home.addToDay}
          </button>
        </div>
      )}

      {todayTasks.length === 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors text-center"
        >
          + {ru.home.addToDay}
        </button>
      )}

      {/* AI-строка */}
      <div className="space-y-2">
        <AIBar />
      </div>

      {/* Модалка добавления задачи */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={ru.tasks.addTask}>
        <div className="space-y-4">
          <Input
            placeholder={ru.tasks.placeholder}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          {goals.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-surface-400">Цель (необязательно)</p>
              <div className="flex flex-wrap gap-2">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setNewGoal(newGoal === g.id ? '' : g.id)}
                    className="transition-transform"
                  >
                    <GoalBadge
                      label={g.title}
                      color={g.color}
                      className={clsx('cursor-pointer', newGoal === g.id && 'ring-2 ring-offset-1')}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>{ru.common.cancel}</Button>
            <Button variant="primary" onClick={handleAdd}>{ru.common.add}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
