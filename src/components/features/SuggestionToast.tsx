/**
 * Тост «следующий шаг» — всплывает снизу после выполнения задачи.
 * Предлагает: добавить на сегодня / пропустить.
 */
import { useEffect, useState } from 'react'
import { Check, X, Sparkles, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import type { NextSuggestion } from '../../services/autoNext'
import { GoalBadge } from '../ui/Badge'
import type { Goal } from '../../types'

interface Props {
  suggestion: NextSuggestion | null
  goals:      Goal[]
  onAccept:   (taskId: string) => void
  onDismiss:  () => void
}

const AUTO_CLOSE_MS = 12000

export function SuggestionToast({ suggestion, goals, onAccept, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  // Анимация появления + таймер автозакрытия
  useEffect(() => {
    if (!suggestion) { setVisible(false); return }

    setVisible(true)
    setProgress(100)

    const start = Date.now()
    const iv = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS) * 100)
      setProgress(pct)
      if (pct === 0) { clearInterval(iv); onDismiss() }
    }, 100)

    return () => clearInterval(iv)
  }, [suggestion])  // eslint-disable-line react-hooks/exhaustive-deps

  if (!suggestion || !visible) return null

  const goal = goals.find(g => g.id === suggestion.task.goalId)

  return (
    <div className={clsx(
      'fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40',
      'animate-slide-up',
    )}>
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden">

        {/* Прогресс-бар автозакрытия */}
        <div className="h-0.5 bg-surface-100 dark:bg-surface-700">
          <div
            className="h-full bg-accent-400 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 space-y-3">
          {/* Заголовок */}
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent-500 flex-shrink-0" />
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">
              AI предлагает следующий шаг
            </p>
            <button
              onClick={onDismiss}
              className="ml-auto p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"
            >
              <X size={14} />
            </button>
          </div>

          {/* Задача */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-surface-800 dark:text-surface-100 leading-snug">
              {suggestion.task.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {goal && <GoalBadge label={goal.title} color={goal.color} />}
              <p className="text-xs text-surface-400 flex items-center gap-1">
                <ArrowRight size={10} /> {suggestion.reason}
              </p>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-2">
            <button
              onClick={() => { onAccept(suggestion.task.id); setVisible(false) }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-colors"
            >
              <Check size={15} /> На сегодня
            </button>
            <button
              onClick={() => { onDismiss(); setVisible(false) }}
              className="px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium transition-colors"
            >
              Потом
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
