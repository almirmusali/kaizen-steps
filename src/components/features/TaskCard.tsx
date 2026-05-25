import { useState, useEffect } from 'react'
import { Check, Timer, Plus, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import type { Task, Goal } from '../../types'
import { useStore } from '../../store/useStore'
import { formatTime } from '../../utils/date'
import { GoalBadge } from '../ui/Badge'

interface Props {
  task:  Task
  goals: Goal[]
  compact?: boolean
}

export function TaskCard({ task, goals, compact }: Props) {
  const { completeTask, startTimer, stopTimer, addManualTime } = useStore()
  const [elapsed, setElapsed]     = useState(0)
  const [showTime, setShowTime]   = useState(false)
  const [manualMin, setManualMin] = useState('')

  const isRunning = Boolean(task.activeTimerStart)
  const goal = goals.find(g => g.id === task.goalId)

  // Тик таймера
  useEffect(() => {
    if (!isRunning || !task.activeTimerStart) return
    const tick = () => setElapsed(Math.round((Date.now() - task.activeTimerStart!) / 1000))
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [isRunning, task.activeTimerStart])

  const totalSecs = task.timeSpent + (isRunning ? elapsed : 0)

  return (
    <div className={clsx(
      'group flex items-start gap-3 rounded-xl p-3 transition-colors',
      'hover:bg-surface-50 dark:hover:bg-surface-800/50',
      task.status === 'done' && 'opacity-50',
    )}>
      {/* Чекбокс */}
      <button
        onClick={() => completeTask(task.id)}
        disabled={task.status === 'done'}
        className={clsx(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all',
          task.status === 'done'
            ? 'bg-accent-500 border-accent-500 flex items-center justify-center'
            : 'border-surface-300 dark:border-surface-600 hover:border-accent-400',
        )}
      >
        {task.status === 'done' && <Check size={11} strokeWidth={3} className="text-white" />}
      </button>

      {/* Содержимое */}
      <div className="flex-1 min-w-0">
        <p className={clsx(
          'text-sm text-surface-800 dark:text-surface-100 leading-snug',
          task.status === 'done' && 'line-through',
        )}>
          {task.title}
        </p>

        {!compact && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {goal && <GoalBadge label={goal.title} color={goal.color} />}
            {totalSecs > 0 && (
              <span className="text-xs text-surface-400">{formatTime(totalSecs)}</span>
            )}
          </div>
        )}
      </div>

      {/* Действия */}
      {task.status !== 'done' && !compact && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => isRunning ? stopTimer(task.id) : startTimer(task.id)}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              isRunning
                ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-600'
                : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400',
            )}
            title={isRunning ? 'Стоп' : 'Старт таймера'}
          >
            <Timer size={14} className={isRunning ? 'animate-pulse' : ''} />
          </button>

          <button
            onClick={() => setShowTime(v => !v)}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"
            title="Добавить время вручную"
          >
            <ChevronDown size={14} className={clsx('transition-transform', showTime && 'rotate-180')} />
          </button>
        </div>
      )}

      {/* Ручной ввод времени */}
      {showTime && (
        <div className="absolute z-10 mt-1 flex gap-2 items-center bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 shadow-lg">
          <input
            type="number"
            min="1"
            placeholder="мин"
            value={manualMin}
            onChange={e => setManualMin(e.target.value)}
            className="w-16 text-sm border-none bg-transparent outline-none text-surface-800 dark:text-surface-100"
          />
          <button
            onClick={() => {
              const m = parseInt(manualMin)
              if (m > 0) { addManualTime(task.id, m * 60); setShowTime(false); setManualMin('') }
            }}
            className="p-1 rounded-lg bg-accent-500 text-white"
          >
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
