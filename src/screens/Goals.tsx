import { useState } from 'react'
import { Plus, TrendingDown, Download, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { GoalBadge } from '../components/ui/Badge'
import { ru } from '../i18n/ru'
import { formatTime } from '../utils/date'
import { seedPlan } from '../utils/seed'

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ec4899',
  '#8b5cf6', '#06b6d4', '#f97316', '#10b981',
]

export function GoalsScreen() {
  const { goals, projects, tasks, addGoal, archiveGoal, loadAll } = useStore()

  const [showAdd, setShowAdd]     = useState(false)
  const [newTitle, setNewTitle]   = useState('')
  const [seeding, setSeeding]     = useState(false)
  const [seedDone, setSeedDone]   = useState(false)
  const [seedError, setSeedError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSeed = async (force = false) => {
    // Если данные уже есть и не подтверждено — показываем предупреждение
    if (!force && goals.length > 0) { setShowConfirm(true); return }
    setShowConfirm(false)
    setSeeding(true)
    setSeedError('')
    try {
      const result = await seedPlan()   // resetAndSeed — удалит всё и загрузит новое
      await loadAll()
      setSeedDone(true)
      console.log('Загружено:', result)
    } catch (e) {
      setSeedError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setSeeding(false)
    }
  }
  const [newDesc, setNewDesc]   = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    await addGoal({ title: newTitle.trim(), description: newDesc.trim() || undefined, color: newColor })
    setNewTitle(''); setNewDesc(''); setNewColor(COLORS[0]); setShowAdd(false)
  }

  // Баланс внимания: считаем задачи за последние 7 дней по каждой цели
  const now = Date.now()
  const WEEK = 7 * 24 * 60 * 60 * 1000

  const goalStats = goals.map(goal => {
    const goalProjects = projects.filter(p => p.goalId === goal.id)
    const goalTasks = tasks.filter(t => t.goalId === goal.id || goalProjects.some(p => p.id === t.projectId))
    const recentDone = goalTasks.filter(t =>
      t.status === 'done' && t.completedAt && (now - new Date(t.completedAt).getTime()) < WEEK
    ).length
    const totalTime = goalTasks.reduce((s, t) => s + t.timeSpent, 0)
    const todoCount = goalTasks.filter(t => t.status === 'todo').length

    return { goal, recentDone, totalTime, todoCount }
  })

  const maxRecent = Math.max(...goalStats.map(s => s.recentDone), 1)

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-surface-800 dark:text-surface-100">{ru.goals.title}</h1>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> {ru.goals.addGoal}
        </Button>
      </div>

      {/* ── Баннер загрузки / обновления плана ── */}
      {!seedDone && (
        <div className="rounded-2xl border-2 border-dashed border-accent-200 dark:border-accent-800 bg-accent-50/50 dark:bg-accent-900/10 p-5 space-y-3">
          <div>
            <p className="font-medium text-surface-800 dark:text-surface-100">
              {goals.length === 0 ? 'Загрузить стартовый план' : 'Обновить план (v2)'}
            </p>
            <p className="text-sm text-surface-500 mt-1">
              12 недель, 5 этапов, 70 задач — запуск YouTube-канала с зависимостями и порядком.
              {goals.length > 0 && <span className="text-amber-500"> Текущие данные будут заменены.</span>}
            </p>
          </div>

          {/* Диалог подтверждения */}
          {showConfirm ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Удалить все текущие задачи и цели и загрузить новый план?
              </p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={() => handleSeed(true)} disabled={seeding}>
                  {seeding ? <><Loader2 size={14} className="animate-spin" /> Удаляю…</> : 'Да, заменить всё'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="primary" size="sm" onClick={() => handleSeed()} disabled={seeding}>
                {seeding
                  ? <><Loader2 size={14} className="animate-spin" /> Загружаю…</>
                  : <><Download size={14} /> {goals.length === 0 ? 'Загрузить план' : 'Обновить план'}</>
                }
              </Button>
              {seedError && <p className="text-xs text-red-500">{seedError}</p>}
            </div>
          )}
        </div>
      )}

      {seedDone && (
        <div className="rounded-2xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 px-4 py-3 text-sm text-accent-700 dark:text-accent-300">
          ✓ Загружено: 1 цель, 5 этапов-проектов, 70 задач. Смотри в «Проектах».
        </div>
      )}

      {goals.length === 0 && !seedDone && (
        <div className="text-center py-4 text-surface-400">
          <p>{ru.goals.noGoals}</p>
        </div>
      )}

      {/* Баланс внимания */}
      {goalStats.length > 1 && (
        <div className="rounded-2xl bg-surface-50 dark:bg-surface-800/50 p-4 space-y-3">
          <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{ru.goals.attention}</p>
          {goalStats.map(({ goal, recentDone }) => {
            const pct = Math.round((recentDone / maxRecent) * 100)
            const stale = recentDone === 0
            return (
              <div key={goal.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <GoalBadge label={goal.title} color={goal.color} />
                  <div className="flex items-center gap-2">
                    {stale && (
                      <span className="flex items-center gap-1 text-xs text-amber-500">
                        <TrendingDown size={11} /> {ru.goals.notMoved}
                      </span>
                    )}
                    <span className="text-xs text-surface-400">{recentDone} шагов</span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: goal.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Список целей */}
      <div className="space-y-3">
        {goalStats.map(({ goal, totalTime, todoCount }) => {
          const goalProjects = projects.filter(p => p.goalId === goal.id && p.status === 'active')
          return (
            <div key={goal.id} className="rounded-2xl border border-surface-200 dark:border-surface-700 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: goal.color }} />
                  <p className="font-medium text-surface-800 dark:text-surface-100">{goal.title}</p>
                </div>
                <button
                  onClick={() => archiveGoal(goal.id)}
                  className="text-xs text-surface-400 hover:text-surface-500 flex-shrink-0"
                >
                  Архивировать
                </button>
              </div>

              {goal.description && (
                <p className="text-sm text-surface-500 dark:text-surface-400">{goal.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-surface-400">
                {totalTime > 0 && (
                  <span className="flex items-center gap-1">⏱ {formatTime(totalTime)}</span>
                )}
                {todoCount > 0 && <span>{todoCount} задач</span>}
                {goalProjects.length > 0 && (
                  <span>{goalProjects.length} проектов</span>
                )}
              </div>

              {/* Активные проекты */}
              {goalProjects.length > 0 && (
                <div className="space-y-1">
                  {goalProjects.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                      <span className="w-1 h-1 rounded-full bg-surface-300 dark:bg-surface-600" />
                      {p.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Модалка */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={ru.goals.addGoal}>
        <div className="space-y-4">
          <Input
            label="Название цели"
            placeholder="Запустить YouTube-канал"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            label="Описание (необязательно)"
            placeholder="Зачем эта цель для меня важна..."
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            rows={3}
          />
          <div className="space-y-1">
            <p className="text-xs text-surface-400">Цвет</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: newColor === c ? `3px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>{ru.common.cancel}</Button>
            <Button variant="primary" onClick={handleAdd}>{ru.common.add}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
