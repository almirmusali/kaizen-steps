import { useState, useRef } from 'react'
import { Trash2, ArrowRight, Clock, FolderPlus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { GoalBadge } from '../components/ui/Badge'
import { ru } from '../i18n/ru'
import type { InboxItem } from '../types'

export function InboxScreen() {
  const { inbox, goals, addInbox, removeInbox, addTask, addProject } = useStore()
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Модалка «превратить в задачу»
  const [processItem, setProcessItem] = useState<InboxItem | null>(null)
  const [taskTitle, setTaskTitle]     = useState('')
  const [taskGoal, setTaskGoal]       = useState('')
  const [isProject, setIsProject]     = useState(false)

  const handleAdd = async () => {
    if (!text.trim()) return
    await addInbox(text.trim())
    setText('')
    inputRef.current?.focus()
  }

  const handleDoNow = async (item: InboxItem) => {
    // Правило 2 минут — просто удаляем (сделано сразу)
    await removeInbox(item.id)
  }

  const openProcess = (item: InboxItem) => {
    setProcessItem(item)
    setTaskTitle(item.text)
    setTaskGoal('')
    setIsProject(false)
  }

  const handleSaveTask = async () => {
    if (!processItem || !taskTitle.trim()) return
    if (isProject) {
      await addProject({ title: taskTitle.trim(), goalId: taskGoal || undefined, status: 'active' })
    } else {
      await addTask({ title: taskTitle.trim(), goalId: taskGoal || undefined, status: 'todo' })
    }
    await removeInbox(processItem.id)
    setProcessItem(null)
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-xl mx-auto w-full">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-surface-800 dark:text-surface-100">{ru.inbox.title}</h1>
        <p className="text-sm text-surface-400">Сбрасывай всё что в голове — не думая о формулировке</p>
      </div>

      {/* Быстрый ввод */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={ru.inbox.placeholder}
          className="flex-1 rounded-2xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-3 text-sm text-surface-800 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-400 transition"
          autoFocus
        />
        <Button variant="primary" onClick={handleAdd}>{ru.common.add}</Button>
      </div>

      {/* Список */}
      {inbox.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-3xl">🌿</p>
          <p className="text-surface-400">{ru.inbox.empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inbox.map(item => (
            <div
              key={item.id}
              className="group flex items-center gap-3 rounded-xl px-4 py-3 bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <p className="flex-1 text-sm text-surface-700 dark:text-surface-200">{item.text}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDoNow(item)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-surface-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors"
                  title={ru.inbox.doNow}
                >
                  <Clock size={12} /> 2мин
                </button>
                <button
                  onClick={() => openProcess(item)}
                  className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                  title={ru.inbox.makeTask}
                >
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => removeInbox(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-400 transition-colors"
                  title={ru.inbox.deleteItem}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка обработки */}
      <Modal
        open={Boolean(processItem)}
        onClose={() => setProcessItem(null)}
        title={ru.inbox.process}
      >
        {processItem && (
          <div className="space-y-4">
            <p className="text-xs text-surface-400 bg-surface-50 dark:bg-surface-700/50 px-3 py-2 rounded-lg">
              Исходное: «{processItem.text}»
            </p>

            {/* Тип */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsProject(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${!isProject ? 'bg-accent-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}
              >
                Задача
              </button>
              <button
                onClick={() => setIsProject(true)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${isProject ? 'bg-accent-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}
              >
                <FolderPlus size={14} className="inline mr-1" />Проект
              </button>
            </div>

            <Input
              label={isProject ? 'Название проекта' : 'Формулировка «делаю не думая»'}
              placeholder={isProject ? 'Записать 10 видео...' : 'Открыть телефон и...'}
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveTask()}
              autoFocus
            />

            {goals.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-surface-400">Цель</p>
                <div className="flex flex-wrap gap-2">
                  {goals.map(g => (
                    <button key={g.id} onClick={() => setTaskGoal(taskGoal === g.id ? '' : g.id)}>
                      <GoalBadge label={g.title} color={g.color} className={taskGoal === g.id ? 'ring-2 ring-offset-1' : ''} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setProcessItem(null)}>{ru.common.cancel}</Button>
              <Button variant="primary" onClick={handleSaveTask}>{ru.common.save}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
