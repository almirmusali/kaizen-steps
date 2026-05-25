import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { GoalBadge } from '../components/ui/Badge'
import { ru } from '../i18n/ru'
import { todayStr, getWeekStartStr, formatTime } from '../utils/date'
import { reviewsRepo } from '../db/repositories/reviews'

type Tab = 'daily' | 'weekly' | 'progress'

export function ReviewScreen() {
  const { tasks, projects, goals } = useStore()
  const [tab, setTab] = useState<Tab>('daily')

  // Ежедневный обзор
  const [dDone, setDDone]         = useState('')
  const [dBlockers, setDBlockers] = useState('')
  const [dNext, setDNext]         = useState('')
  const [dSaved, setDSaved]       = useState(false)

  useEffect(() => {
    reviewsRepo.getDailyReview(todayStr()).then(r => {
      if (r) { setDDone(r.done); setDBlockers(r.blockers); setDNext(r.nextStep) }
    })
  }, [])

  const saveDaily = async () => {
    await reviewsRepo.saveDailyReview({ date: todayStr(), done: dDone, blockers: dBlockers, nextStep: dNext })
    setDSaved(true)
    setTimeout(() => setDSaved(false), 2000)
  }

  // Еженедельная ретроспектива
  const weekStart = getWeekStartStr()
  const [wNotes, setWNotes]   = useState('')
  const [wSaved, setWSaved]   = useState(false)

  useEffect(() => {
    reviewsRepo.getWeeklyReview(weekStart).then(r => {
      if (r) { setWNotes(r.notes) }
    })
  }, [weekStart])

  const saveWeekly = async () => {
    await reviewsRepo.saveWeeklyReview({ weekStart, notes: wNotes })
    setWSaved(true)
    setTimeout(() => setWSaved(false), 2000)
  }

  // Прогресс по неделям
  const now = Date.now()
  const WEEK = 7 * 24 * 60 * 60 * 1000
  const thisWeekDone = tasks.filter(t =>
    t.status === 'done' && t.completedAt && (now - new Date(t.completedAt).getTime()) < WEEK
  )
  const prevWeekDone = tasks.filter(t =>
    t.status === 'done' && t.completedAt && (now - new Date(t.completedAt).getTime()) < 2 * WEEK
      && (now - new Date(t.completedAt).getTime()) >= WEEK
  )

  const goalProgress = goals.map(goal => {
    const goalProjects = projects.filter(p => p.goalId === goal.id)
    const thisWeek = thisWeekDone.filter(t => t.goalId === goal.id || goalProjects.some(p => p.id === t.projectId))
    const prevWeek = prevWeekDone.filter(t => t.goalId === goal.id || goalProjects.some(p => p.id === t.projectId))
    const timeThisWeek = thisWeek.reduce((s, t) => s + t.timeSpent, 0)
    return { goal, thisWeek: thisWeek.length, prevWeek: prevWeek.length, timeThisWeek }
  })

  const tabs: { id: Tab; label: string }[] = [
    { id: 'daily',    label: 'День' },
    { id: 'weekly',   label: 'Неделя' },
    { id: 'progress', label: 'Прогресс' },
  ]

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-xl mx-auto w-full">
      <h1 className="text-xl font-semibold text-surface-800 dark:text-surface-100">{ru.review.progress}</h1>

      {/* Табы */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${
              tab === t.id
                ? 'bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-100 shadow-sm'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Ежедневный */}
      {tab === 'daily' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm text-surface-500">{ru.review.daily}</p>
          <Textarea label={ru.review.done} value={dDone} onChange={e => setDDone(e.target.value)} rows={3} />
          <Textarea label={ru.review.blockers} value={dBlockers} onChange={e => setDBlockers(e.target.value)} rows={3} />
          <Textarea label={ru.review.nextStep} value={dNext} onChange={e => setDNext(e.target.value)} rows={2} />
          <Button variant="primary" onClick={saveDaily}>
            {dSaved ? '✓ Сохранено' : ru.review.save}
          </Button>
        </div>
      )}

      {/* Еженедельный */}
      {tab === 'weekly' && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm text-surface-500">{ru.review.weekly}</p>
          <Textarea
            label="Заметки о неделе: что двигалось, что оптимизировать"
            value={wNotes}
            onChange={e => setWNotes(e.target.value)}
            rows={6}
          />
          <Button variant="primary" onClick={saveWeekly}>
            {wSaved ? '✓ Сохранено' : ru.review.save}
          </Button>
        </div>
      )}

      {/* Прогресс */}
      {tab === 'progress' && (
        <div className="space-y-6 animate-fade-in">
          {/* Итого за неделю */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface-50 dark:bg-surface-800/50 p-4">
              <p className="text-2xl font-semibold text-surface-800 dark:text-surface-100">{thisWeekDone.length}</p>
              <p className="text-xs text-surface-400 mt-1">шагов на этой неделе</p>
            </div>
            <div className="rounded-2xl bg-surface-50 dark:bg-surface-800/50 p-4">
              <p className="text-2xl font-semibold text-surface-800 dark:text-surface-100">
                {formatTime(thisWeekDone.reduce((s, t) => s + t.timeSpent, 0))}
              </p>
              <p className="text-xs text-surface-400 mt-1">потрачено времени</p>
            </div>
          </div>

          {/* По целям */}
          {goalProgress.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">По целям</p>
              {goalProgress.map(({ goal, thisWeek, prevWeek, timeThisWeek }) => {
                const trend = thisWeek > prevWeek ? '↑' : thisWeek < prevWeek ? '↓' : '='
                const trendColor = thisWeek > prevWeek ? 'text-accent-500' : thisWeek < prevWeek ? 'text-amber-500' : 'text-surface-400'
                return (
                  <div key={goal.id} className="rounded-xl bg-surface-50 dark:bg-surface-800/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <GoalBadge label={goal.title} color={goal.color} />
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`font-medium ${trendColor}`}>{trend}</span>
                        <span className="text-surface-600 dark:text-surface-300 font-medium">{thisWeek}</span>
                        <span className="text-surface-400 text-xs">шагов</span>
                      </div>
                    </div>
                    {timeThisWeek > 0 && (
                      <p className="text-xs text-surface-400 mt-1">{formatTime(timeThisWeek)} за неделю</p>
                    )}
                    {/* Полоска прогресса */}
                    <div className="mt-2 flex gap-1 items-end h-6">
                      {Array.from({ length: 7 }).map((_, di) => {
                        const d = new Date()
                        d.setDate(d.getDate() - (6 - di))
                        const dayStr = d.toISOString().slice(0, 10)
                        const count = tasks.filter(t =>
                          t.status === 'done' &&
                          t.completedAt &&
                          new Date(t.completedAt).toISOString().slice(0, 10) === dayStr &&
                          (t.goalId === goal.id)
                        ).length
                        return (
                          <div
                            key={di}
                            className="flex-1 rounded-sm transition-all"
                            style={{
                              height: `${Math.max(count * 8, 2)}px`,
                              backgroundColor: count > 0 ? goal.color : '#e7e5e4',
                              opacity: count > 0 ? 1 : 0.4,
                            }}
                          />
                        )
                      })}
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">последние 7 дней</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
