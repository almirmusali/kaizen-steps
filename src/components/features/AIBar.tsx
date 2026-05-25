import { useState, useRef, type KeyboardEvent } from 'react'
import { Send, Loader2, Check, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '../../store/useStore'
import { askAI } from '../../services/ai'
import { ru } from '../../i18n/ru'
import type { AIMessage, AIAction } from '../../types'
import { nanoid } from '../../utils/id'

export function AIBar() {
  const {
    aiMessages, aiLoading, setAIMessages, setAILoading,
    goals, projects, tasks, aiSettings,
    addTask, scheduleToday, completeTask, updateTask, addProject,
  } = useStore()

  const [input, setInput] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const send = async () => {
    const text = input.trim()
    if (!text || aiLoading) return
    setInput('')

    const userMsg: AIMessage = { role: 'user', content: text }
    const newMsgs = [...aiMessages, userMsg]
    setAIMessages(newMsgs)
    setAILoading(true)

    try {
      const resp = await askAI({ message: text, goals, projects, tasks, aiSettings })
      const assistantMsg: AIMessage = {
        role: 'assistant',
        content: resp.message,
        actions: resp.actions,
        pending: resp.actions && resp.actions.length > 0 && aiSettings.autonomyMode === 'suggest',
      }
      setAIMessages([...newMsgs, assistantMsg])
    } catch {
      setAIMessages([...newMsgs, { role: 'assistant', content: ru.ai.error }])
    } finally {
      setAILoading(false)
    }
  }

  const applyActions = async (actions: AIAction[], msgIndex: number) => {
    for (const action of actions) {
      if (action.type === 'create_task') {
        await addTask({ ...action.task, id: nanoid() })
      } else if (action.type === 'create_project') {
        await addProject({ title: '', status: 'active', ...action.project })
      } else if (action.type === 'schedule_today') {
        for (const id of action.taskIds) await scheduleToday(id)
      } else if (action.type === 'complete_task') {
        await completeTask(action.taskId)
      } else if (action.type === 'link_goal') {
        await updateTask(action.entityId, { goalId: action.goalId })
      } else if (action.type === 'decompose') {
        for (const sub of action.subtasks) await addTask({ ...sub, projectId: sub.projectId })
      }
    }
    setAIMessages(aiMessages.map((m: AIMessage, i: number) => i === msgIndex ? { ...m, pending: false } : m))
  }

  const discardActions = (msgIndex: number) => {
    setAIMessages(aiMessages.map((m: AIMessage, i: number) => i === msgIndex ? { ...m, pending: false, actions: undefined } : m))
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* История сообщений */}
      {aiMessages.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hidden">
          {aiMessages.map((msg, i) => (
            <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={clsx(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200',
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Предложенные действия */}
                {msg.pending && msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 border-t border-surface-200 dark:border-surface-600 pt-2">
                    <span className="text-xs text-surface-500 flex-1">
                      {ru.ai.pendingActions(msg.actions.length)}
                    </span>
                    <button
                      onClick={() => applyActions(msg.actions!, i)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-500 text-white text-xs"
                    >
                      <Check size={12} /> {ru.common.apply}
                    </button>
                    <button
                      onClick={() => discardActions(i)}
                      className="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Авто-режим: сразу применяем */}
                {!msg.pending && msg.actions && msg.role === 'assistant' && msg.actions.length > 0 &&
                  <span className="text-xs opacity-60 mt-1 block">✓ применено</span>
                }
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl px-4 py-2.5">
                <Loader2 size={16} className="animate-spin text-surface-400" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex items-end gap-2 bg-surface-50 dark:bg-surface-800 rounded-2xl px-4 py-3 border border-surface-200 dark:border-surface-700">
        <textarea
          ref={ref}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={ru.home.askAI}
          className="flex-1 bg-transparent text-sm resize-none outline-none text-surface-800 dark:text-surface-100 placeholder:text-surface-400 max-h-32 scrollbar-hidden"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || aiLoading}
          className="p-1.5 rounded-xl bg-accent-500 text-white disabled:opacity-40 transition-opacity flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
