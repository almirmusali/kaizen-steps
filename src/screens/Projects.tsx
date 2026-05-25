import { useState } from 'react'
import { Plus, ChevronRight, Timer, ChevronDown, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '../store/useStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { GoalBadge } from '../components/ui/Badge'
import { TaskCard } from '../components/features/TaskCard'
import { ru } from '../i18n/ru'
import { formatTime } from '../utils/date'
import type { Project } from '../types'

export function ProjectsScreen() {
  const { projects, tasks, goals, addProject, updateProject, addTask } = useStore()

  const active = projects.filter(p => p.status === 'active')
  const done   = projects.filter(p => p.status === 'done')

  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newGoal, setNewGoal]   = useState('')

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [addingTask, setAddingTask] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const toggle = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const handleAddProject = async () => {
    if (!newTitle.trim()) return
    await addProject({ title: newTitle.trim(), goalId: newGoal || undefined, status: 'active' })
    setNewTitle(''); setNewGoal(''); setShowAdd(false)
  }

  const handleAddTask = async (project: Project) => {
    if (!newTaskTitle.trim()) return
    const task = await addTask({ title: newTaskTitle.trim(), projectId: project.id, goalId: project.goalId, status: 'todo' })
    await useStore.getState().updateProject(project.id, { nextActionId: project.nextActionId ?? task.id })
    setNewTaskTitle(''); setAddingTask(null)
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-surface-800 dark:text-surface-100">{ru.projects.title}</h1>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> {ru.projects.addProject}
        </Button>
      </div>

      {active.length === 0 && (
        <div className="text-center py-16 text-surface-400">
          <p>{ru.projects.noProjects}</p>
        </div>
      )}

      {/* Активные проекты */}
      <div className="space-y-3">
        {active.map(proj => {
          const projTasks = tasks.filter(t => t.projectId === proj.id)
          const todoTasks = projTasks.filter(t => t.status === 'todo')
          const nextAction = projTasks.find(t => t.id === proj.nextActionId && t.status === 'todo')
            ?? todoTasks[0]
          const goal = goals.find(g => g.id === proj.goalId)
          const isOpen = expanded[proj.id]

          return (
            <div key={proj.id} className="rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
              {/* Заголовок */}
              <button
                onClick={() => toggle(proj.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left"
              >
                <ChevronRight
                  size={16}
                  className={clsx('text-surface-400 transition-transform flex-shrink-0', isOpen && 'rotate-90')}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-800 dark:text-surface-100 text-sm">{proj.title}</p>
                  {goal && <GoalBadge label={goal.title} color={goal.color} className="mt-0.5" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-400 flex-shrink-0">
                  {proj.totalTime > 0 && (
                    <span className="flex items-center gap-1">
                      <Timer size={11} /> {formatTime(proj.totalTime)}
                    </span>
                  )}
                  <span>{todoTasks.length} шагов</span>
                </div>
              </button>

              {/* Следующее действие (всегда видно) */}
              {!isOpen && nextAction && (
                <div className="px-4 pb-3 ml-7">
                  <p className="text-xs text-surface-400">{ru.projects.nextAction}:</p>
                  <p className="text-sm text-surface-600 dark:text-surface-300 mt-0.5">{nextAction.title}</p>
                </div>
              )}

              {/* Раскрытый вид */}
              {isOpen && (
                <div className="border-t border-surface-100 dark:border-surface-700">
                  {todoTasks.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-surface-400">{ru.projects.noAction}</p>
                  ) : (
                    todoTasks.map(t => (
                      <TaskCard key={t.id} task={t} goals={goals} />
                    ))
                  )}

                  {/* Добавить шаг */}
                  {addingTask === proj.id ? (
                    <div className="px-4 pb-3 flex gap-2">
                      <input
                        autoFocus
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddTask(proj)
                          if (e.key === 'Escape') { setAddingTask(null); setNewTaskTitle('') }
                        }}
                        placeholder={ru.tasks.placeholder}
                        className="flex-1 text-sm bg-transparent outline-none border-b border-surface-200 dark:border-surface-600 pb-1 text-surface-800 dark:text-surface-100 placeholder:text-surface-400"
                      />
                      <button onClick={() => handleAddTask(proj)} className="p-1 text-accent-500">
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingTask(proj.id); setNewTaskTitle('') }}
                      className="w-full text-left px-4 py-2.5 text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors flex items-center gap-2"
                    >
                      <Plus size={14} /> Добавить шаг
                    </button>
                  )}

                  {/* Завершить проект */}
                  <div className="px-4 pb-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateProject(proj.id, { status: 'done', completedAt: new Date() })}
                    >
                      <ChevronDown size={12} /> {ru.projects.complete}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Завершённые */}
      {done.length > 0 && (
        <details className="group">
          <summary className="text-xs text-surface-400 cursor-pointer select-none">
            Завершённые ({done.length})
          </summary>
          <div className="mt-2 space-y-2 opacity-60">
            {done.map(proj => (
              <div key={proj.id} className="px-4 py-2 rounded-xl bg-surface-50 dark:bg-surface-800/50 flex items-center justify-between">
                <span className="text-sm text-surface-600 dark:text-surface-300 line-through">{proj.title}</span>
                <Button variant="ghost" size="sm" onClick={() => updateProject(proj.id, { status: 'active', completedAt: undefined })}>
                  Восстановить
                </Button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Модалка добавления */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={ru.projects.addProject}>
        <div className="space-y-4">
          <Input
            label="Название проекта"
            placeholder="Запустить YouTube-канал..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddProject()}
            autoFocus
          />
          {goals.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-surface-400">Цель</p>
              <div className="flex flex-wrap gap-2">
                {goals.map(g => (
                  <button key={g.id} onClick={() => setNewGoal(newGoal === g.id ? '' : g.id)}>
                    <GoalBadge label={g.title} color={g.color} className={newGoal === g.id ? 'ring-2 ring-offset-1' : ''} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>{ru.common.cancel}</Button>
            <Button variant="primary" onClick={handleAddProject}>{ru.common.add}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
