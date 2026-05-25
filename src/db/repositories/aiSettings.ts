import { db } from '../schema'
import type { AISettings } from '../../types'

const DEFAULTS: AISettings = {
  id: 1,
  goals: '',
  instruction: 'Будь тёплым и поддерживающим. Напоминай мне о целях мягко, но настойчиво. Помогай дробить задачи на маленькие шаги.',
  rhythm: '',
  autonomyMode: 'suggest',
}

export const aiSettingsRepo = {
  async get(): Promise<AISettings> {
    const s = await db.aiSettings.get(1)
    return s ?? DEFAULTS
  },
  async save(data: Partial<AISettings>): Promise<void> {
    const existing = await db.aiSettings.get(1)
    if (existing) {
      await db.aiSettings.update(1, data)
    } else {
      await db.aiSettings.put({ ...DEFAULTS, ...data })
    }
  },
}
