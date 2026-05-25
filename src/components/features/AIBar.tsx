import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send, Loader2, Check, X, ChevronDown, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { useStore } from '../../store/useStore'
import { askAI } from '../../services/ai'
import { ru } from '../../i18n/ru'
import type { AIMessage, AIAction } from '../../types'
import { nanoid } from '../../utils/id'

// ─── Простой inline-рендер markdown ──────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Горизонтальная линия
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={key++} className="border-surface-200 dark:border-surface-600 my-2" />)
      continue
    }

    // Заголовки ## / ###
    const h2 = line.match(/^##\s+(.+)/)
    if (h2) {
      elements.push(
        <p key={key++} className="font-semibold text-surface-800 dark:text-surface-100 mt-3 mb-1">
          {inlineMarkdown(h2[1])}
        </p>
      )
      continue
    }

    // Ненумерованный список
    const li = line.match(/^[-*]\s+(.+)/)
    if (li) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start">
          <span className="text-accent-500 mt-0.5 flex-shrink-0">·</span>
          <span>{inlineMarkdown(li[1])}</span>
        </div>
      )
      continue
    }

    // Нумерованный список
    const oli = line.match(/^(\d+)\.\s+(.+)/)
    if (oli) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start">
          <span className="text-surface-400 text-xs mt-0.5 flex-shrink-0 w-4">{oli[1]}.</span>
          <span>{inlineMarkdown(oli[2])}</span>
        </div>
      )
      continue
    }

    // Пустая строка
    if (line.trim() === '') {
      if (i > 0 && lines[i - 1].trim() !== '') {
        elements.push(<div key={key++} className="h-2" />)
      }
      continue
    }

    // Обычный текст
    elements.push(<p key={key++} className="leading-relaxed">{inlineMarkdown(line)}</p>)
  }

  return elements
}

// Inline: **bold**, *italic*, `code`
function inlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let key = 0
  // Разбиваем по **bold**, *italic*, `code`
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>)
    if (m[2]) parts.push(<strong key={key++} className="font-semibold">{m[2]}</strong>)
    else if (m[3]) parts.push(<em key={key++}>{m[3]}</em>)
    else if (m[4]) parts.push(<code key={key++} className="text-xs bg-surface-200 dark:bg-surface-600 px-1 py-0.5 rounded font-mono">{m[4]}</code>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>)
  return parts.length > 0 ? <>{parts}</> : text
}

// ─── Основной компонент ───────────────────────────────────────────────────────
export function AIBar() {
  const {
    aiMessages, aiLoading, setAIMessages, setAILoading,
    goals, projects, tasks, aiSettings,
    addTask, scheduleToday, completeTask, updateTask, addProject,
  } = useStore()

  const [input, setInput]   = useState('')
  const [open, setOpen]     = useState(false)
  const inputRef            = useRef<HTMLTextAreaElement>(null)
  const bottomRef           = useRef<HTMLDivElement>(null)

  // Открываем панель при получении ответа
  useEffect(() => {
    if (aiMessages.length > 0) setOpen(true)
  }, [aiMessages.length])

  // Скролл к последнему сообщению
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, aiLoading])

  const send = async () => {
    const text = input.trim()
    if (!text || aiLoading) return
    setInput('')
    setOpen(true)

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
      if (action.type === 'create_task')    await addTask({ ...action.task, id: nanoid() })
      else if (action.type === 'create_project') await addProject({ title: '', status: 'active', ...action.project })
      else if (action.type === 'schedule_today') for (const id of action.taskIds) await scheduleToday(id)
      else if (action.type === 'complete_task')  await completeTask(action.taskId)
      else if (action.type === 'link_goal')      await updateTask(action.entityId, { goalId: action.goalId })
      else if (action.type === 'decompose')      for (const sub of action.subtasks) await addTask({ ...sub })
    }
    setAIMessages(aiMessages.map((m: AIMessage, i: number) =>
      i === msgIndex ? { ...m, pending: false } : m
    ))
  }

  const discardActions = (msgIndex: number) => {
    setAIMessages(aiMessages.map((m: AIMessage, i: number) =>
      i === msgIndex ? { ...m, pending: false, actions: undefined } : m
    ))
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* ── Кнопка-строка на главном экране ── */}
      <div
        className="flex items-center gap-3 bg-surface-50 dark:bg-surface-800 rounded-2xl px-4 py-3 border border-surface-200 dark:border-surface-700 cursor-text"
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
      >
        <Sparkles size={15} className="text-accent-500 flex-shrink-0" />
        <span className="flex-1 text-sm text-surface-400 select-none">{ru.home.askAI}</span>
        {aiMessages.length > 0 && (
          <span className="text-xs bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 px-2 py-0.5 rounded-full">
            {aiMessages.length}
          </span>
        )}
      </div>

      {/* ── Полноэкранная панель чата ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-surface-900 animate-fade-in">

          {/* Шапка */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-100 dark:border-surface-700 flex-shrink-0">
            <Sparkles size={16} className="text-accent-500" />
            <p className="flex-1 font-medium text-surface-800 dark:text-surface-100 text-sm">AI-помощник</p>
            {aiMessages.length > 0 && (
              <button
                onClick={() => { setAIMessages([]); setOpen(false) }}
                className="text-xs text-surface-400 hover:text-surface-500 px-2 py-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                Очистить
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {aiMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-surface-400">
                <Sparkles size={32} className="text-accent-300" />
                <p className="text-sm text-center max-w-xs">
                  Напиши, что хочешь сделать, и AI поможет составить план маленькими шагами
                </p>
              </div>
            )}

            {aiMessages.map((msg, i) => (
              <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={clsx(
                  'max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-accent-500 text-white rounded-br-md'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 rounded-bl-md',
                )}>
                  {msg.role === 'user'
                    ? <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    : <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                  }

                  {/* Предложенные действия */}
                  {msg.pending && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 border-t border-surface-200 dark:border-surface-600 pt-3">
                      <span className="text-xs text-surface-500 flex-1">
                        {ru.ai.pendingActions(msg.actions.length)}
                      </span>
                      <button
                        onClick={() => applyActions(msg.actions!, i)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-500 text-white text-xs font-medium"
                      >
                        <Check size={12} /> Применить
                      </button>
                      <button
                        onClick={() => discardActions(i)}
                        className="p-1.5 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {!msg.pending && msg.actions && msg.role === 'assistant' && msg.actions.length > 0 && (
                    <p className="text-xs opacity-50 mt-2">✓ задачи добавлены</p>
                  )}
                </div>
              </div>
            ))}

            {/* Индикатор загрузки */}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-surface-400" />
                  <span className="text-sm text-surface-400">{ru.ai.thinking}</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Поле ввода — прибито к низу */}
          <div className="flex-shrink-0 border-t border-surface-100 dark:border-surface-700 px-4 py-4 pb-safe bg-white dark:bg-surface-900">
            <div className="flex items-end gap-3 bg-surface-50 dark:bg-surface-800 rounded-2xl px-4 py-3 border border-surface-200 dark:border-surface-700">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Напиши запрос..."
                autoFocus
                className="flex-1 bg-transparent text-sm resize-none outline-none text-surface-800 dark:text-surface-100 placeholder:text-surface-400 max-h-40 scrollbar-hidden leading-relaxed"
              />
              <button
                onClick={send}
                disabled={!input.trim() || aiLoading}
                className="p-2 rounded-xl bg-accent-500 text-white disabled:opacity-40 transition-opacity flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
