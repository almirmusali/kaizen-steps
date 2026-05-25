import { useState, useEffect } from 'react'
import { KeyRound, Info } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { ru } from '../i18n/ru'
import { exportData, importData } from '../utils/export'
import type { AutonomyMode } from '../types'

const autonomyOptions: { id: AutonomyMode; label: string; hint: string }[] = [
  { id: 'suggest',  label: ru.aiSettings.suggest,  hint: 'AI предлагает задачи и план — вы подтверждаете' },
  { id: 'auto',     label: ru.aiSettings.auto,      hint: 'AI назначает задачи сразу — вы можете поправить' },
  { id: 'adaptive', label: ru.aiSettings.adaptive,  hint: 'AI подстраивается под контекст разговора' },
]

export function AISettingsScreen() {
  const { aiSettings, saveAISettings, theme, toggleTheme } = useStore()

  const [goals,       setGoals]       = useState(aiSettings.goals)
  const [instruction, setInstruction] = useState(aiSettings.instruction)
  const [rhythm,      setRhythm]      = useState(aiSettings.rhythm)
  const [autonomy,    setAutonomy]    = useState<AutonomyMode>(aiSettings.autonomyMode)
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    setGoals(aiSettings.goals)
    setInstruction(aiSettings.instruction)
    setRhythm(aiSettings.rhythm)
    setAutonomy(aiSettings.autonomyMode)
  }, [aiSettings])

  const handleSave = async () => {
    await saveAISettings({ goals, instruction, rhythm, autonomyMode: autonomy })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) { await importData(file); window.location.reload() }
    }
    input.click()
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-xl mx-auto w-full">
      <h1 className="text-xl font-semibold text-surface-800 dark:text-surface-100">{ru.aiSettings.title}</h1>

      {/* Статус API */}
      <div className="flex items-start gap-3 rounded-2xl bg-surface-50 dark:bg-surface-800/50 p-4">
        <KeyRound size={16} className="text-surface-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-surface-700 dark:text-surface-200">Anthropic API</p>
          <p className="text-xs text-surface-400">{ru.aiSettings.apiKeyHint}</p>
          <code className="text-xs bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded text-surface-600 dark:text-surface-300">
            ANTHROPIC_API_KEY=sk-...
          </code>
        </div>
      </div>

      {/* Цели для AI */}
      <Textarea
        label={ru.aiSettings.goalsLabel}
        placeholder="Хочу запустить YouTube-канал к августу. Пишу на русском и английском. Основная аудитория — разработчики..."
        value={goals}
        onChange={e => setGoals(e.target.value)}
        rows={4}
      />

      {/* Инструкция */}
      <Textarea
        label={ru.aiSettings.instruction}
        placeholder="Будь тёплым, напоминай о целях мягко. Если я застрял — предложи один маленький шаг..."
        value={instruction}
        onChange={e => setInstruction(e.target.value)}
        rows={3}
      />

      {/* Ритм */}
      <Textarea
        label={ru.aiSettings.rhythm}
        placeholder="Работаю с 10 до 18. По вечерам не снимаю видео. В пятницу — обзор недели..."
        value={rhythm}
        onChange={e => setRhythm(e.target.value)}
        rows={2}
      />

      {/* Режим автономии */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-surface-500">{ru.aiSettings.autonomy}</p>
        <div className="space-y-2">
          {autonomyOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setAutonomy(opt.id)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition-all ${
                autonomy === opt.id
                  ? 'border-accent-400 bg-accent-50 dark:bg-accent-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
              }`}
            >
              <p className={`text-sm font-medium ${autonomy === opt.id ? 'text-accent-700 dark:text-accent-300' : 'text-surface-700 dark:text-surface-200'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-surface-400 mt-0.5">{opt.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" size="lg" onClick={handleSave}>
        {saved ? '✓ Сохранено' : ru.aiSettings.save}
      </Button>

      {/* Тема */}
      <div className="pt-4 border-t border-surface-200 dark:border-surface-700 space-y-3">
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{ru.common.theme}</p>
        <div className="flex gap-2">
          <Button
            variant={theme === 'light' ? 'primary' : 'secondary'}
            onClick={() => theme !== 'light' && toggleTheme()}
          >
            ☀️ {ru.common.light}
          </Button>
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onClick={() => theme !== 'dark' && toggleTheme()}
          >
            🌙 {ru.common.dark}
          </Button>
        </div>
      </div>

      {/* Данные */}
      <div className="pt-4 border-t border-surface-200 dark:border-surface-700 space-y-3">
        <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Данные</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportData}>{ru.common.export}</Button>
          <Button variant="secondary" onClick={handleImport}>{ru.common.import}</Button>
        </div>
        <div className="flex items-start gap-2 text-xs text-surface-400">
          <Info size={12} className="mt-0.5 flex-shrink-0" />
          <p>Данные хранятся в браузере (IndexedDB). Экспортируй JSON для резервной копии.</p>
        </div>
      </div>
    </div>
  )
}
