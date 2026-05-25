import type { AIResponse, Task, Goal, Project, AISettings } from '../types'

interface AIContext {
  tasks:      Task[]
  goals:      Goal[]
  projects:   Project[]
  aiSettings: AISettings
  message:    string
}

export async function askAI(ctx: AIContext): Promise<AIResponse> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message:    ctx.message,
      goals:      ctx.goals,
      projects:   ctx.projects,
      tasks:      ctx.tasks.filter(t => t.status === 'todo'),
      aiSettings: ctx.aiSettings,
    }),
  })

  if (!res.ok) {
    if (res.status === 503) {
      return { message: 'Подключи ANTHROPIC_API_KEY в .env, чтобы AI заработал.' }
    }
    throw new Error(`AI error: ${res.status}`)
  }

  return res.json()
}
