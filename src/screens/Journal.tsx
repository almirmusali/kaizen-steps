import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button } from '../components/ui/Button'
import { ru } from '../i18n/ru'
import { formatDate } from '../utils/date'
import { askAI } from '../services/ai'

export function JournalScreen() {
  const { journalNotes, addJournalNote, goals, projects, tasks, aiSettings } = useStore()
  const [text, setText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const handleAdd = async () => {
    if (!text.trim()) return
    await addJournalNote(text.trim())
    setText('')
  }

  const handleAIInsight = async () => {
    if (journalNotes.length === 0) return
    setAiLoading(true)
    try {
      const notesText = journalNotes.slice(0, 10).map(n => n.text).join('\n---\n')
      const resp = await askAI({
        message: `Вот мои заметки дневника:\n${notesText}\n\nПомоги увидеть закономерности, паттерны, что я повторяю или чему учусь. Коротко, вдумчиво.`,
        goals, projects, tasks, aiSettings,
      })
      // Добавляем инсайт как заметку
      await addJournalNote(`[AI-инсайт] ${resp.message}`)
    } catch {
      // silence
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-surface-800 dark:text-surface-100">{ru.journal.title}</h1>
        {journalNotes.length >= 3 && (
          <Button variant="ghost" size="sm" onClick={handleAIInsight} disabled={aiLoading}>
            <Sparkles size={14} className={aiLoading ? 'animate-spin' : ''} />
            {ru.journal.askAI}
          </Button>
        )}
      </div>

      {/* Ввод */}
      <div className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAdd())}
          placeholder={ru.journal.placeholder}
          rows={3}
          className="flex-1 rounded-2xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-3 text-sm text-surface-800 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-400 transition resize-none"
        />
        <Button variant="primary" size="md" onClick={handleAdd} disabled={!text.trim()}>
          <Send size={14} />
        </Button>
      </div>

      {/* Список заметок */}
      {journalNotes.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <p className="text-3xl mb-2">📓</p>
          <p className="text-sm">Запиши первый инсайт</p>
        </div>
      ) : (
        <div className="space-y-3">
          {journalNotes.map(note => {
            const isAI = note.text.startsWith('[AI-инсайт]')
            return (
              <div
                key={note.id}
                className={`rounded-2xl px-4 py-3 space-y-1 ${
                  isAI
                    ? 'bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800'
                    : 'bg-surface-50 dark:bg-surface-800/50'
                }`}
              >
                {isAI && (
                  <div className="flex items-center gap-1 text-xs text-accent-500 mb-1">
                    <Sparkles size={11} /> AI-инсайт
                  </div>
                )}
                <p className="text-sm text-surface-700 dark:text-surface-200 whitespace-pre-wrap leading-relaxed">
                  {isAI ? note.text.replace('[AI-инсайт] ', '') : note.text}
                </p>
                <p className="text-xs text-surface-400">{formatDate(note.createdAt)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
