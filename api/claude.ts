import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'

// ─── Надёжное извлечение JSON из ответа Claude ────────────────────────────────
function extractActions(text: string): { actions: unknown; cleanText: string } {
  // 1. ```json ... ```
  let m = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (m) {
    try {
      const p = JSON.parse(m[1])
      if (p.actions) return { actions: p.actions, cleanText: text.replace(/```json[\s\S]*?```/g, '').trim() }
    } catch { /* fall through */ }
  }

  // 2. ``` ... ``` (без тега языка, но с "actions")
  m = text.match(/```\s*(\{[\s\S]*?"actions"[\s\S]*?\})\s*```/)
  if (m) {
    try {
      const p = JSON.parse(m[1])
      if (p.actions) return { actions: p.actions, cleanText: text.replace(/```[\s\S]*?```/g, '').trim() }
    } catch { /* fall through */ }
  }

  // 3. Голый JSON-объект с "actions" в конце текста
  const last = text.lastIndexOf('{"actions"')
  if (last !== -1) {
    try {
      const p = JSON.parse(text.slice(last))
      if (p.actions) return { actions: p.actions, cleanText: text.slice(0, last).trim() }
    } catch { /* fall through */ }
  }

  return { actions: undefined, cleanText: text }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({ message: 'ANTHROPIC_API_KEY не настроен' })
  }

  const { message, goals, projects, tasks, aiSettings } = req.body ?? {}

  const systemPrompt = buildSystem(aiSettings)
  const userContent  = buildUserMessage(message, goals, projects, tasks)

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    const { actions, cleanText } = extractActions(text)

    return res.json({ message: cleanText, actions })
  } catch (err) {
    console.error('Claude API error:', err)
    return res.status(500).json({ message: 'Ошибка запроса к AI' })
  }
}

function buildSystem(settings: Record<string, string> | undefined): string {
  const goals      = settings?.goals      ?? ''
  const instruction= settings?.instruction ?? ''
  const rhythm     = settings?.rhythm     ?? ''

  return `Ты — AI-помощник в приложении «Кайдзен — система маленьких шагов». Твоя философия основана на методике Максима Дорофеева (Джедайские техники) и принципе кайдзен.

КЛЮЧЕВЫЕ ПРИНЦИПЫ:
1. Мыслетопливо: прокрастинация — истощение умственной энергии, не лень. Экономь её.
2. Критерий задачи: идеальная формулировка — действие, в ходе которого НЕ НАДО ДУМАТЬ. «Открыть телефон и снять один дубль» вместо «сделать видео».
3. Правило 2 минут: дело < 2 минут — сделать сразу без записи.
4. Шаги должны быть маленькими. Если большой — предложи раздробить.
5. Баланс между целями: замечай, если одна цель давно не двигается.

${goals      ? `\nМОИ ЦЕЛИ:\n${goals}` : ''}
${instruction? `\nКАК СЕБЯ ВЕСТИ:\n${instruction}` : ''}
${rhythm     ? `\nМОЙ РИТМ:\n${rhythm}` : ''}

ФОРМАТ ОТВЕТА:
- Пиши тепло, коротко, без пафоса.
- ОБЯЗАТЕЛЬНО: если ты предлагаешь задачи, создаёшь план или перечисляешь шаги — ВСЕГДА добавляй JSON-блок в самом конце ответа. Даже если пользователь не просил явно «создать задачи» — если ты даёшь конкретный список действий, добавь JSON.
- Формат JSON-блока (строго):
\`\`\`json
{"actions": [{"type":"create_task","task":{"title":"...","goalId":"..."}}]}
\`\`\`
- Допустимые типы actions: create_task, create_project, schedule_today, decompose, link_goal, complete_task.
- Поля task: title, projectId (опционально), goalId (опционально), isToday (true/false).
- Поля project: title, goalId (опционально).
- Всегда формулируй задачи по критерию Дорофеева: глагол + конкретное действие, выполнимое за 15–60 минут.
- JSON-блок должен идти ПОСЛЕДНИМ в ответе, после всего текста.`
}

function buildUserMessage(
  message: string,
  goals: unknown[],
  projects: unknown[],
  tasks: unknown[]
): string {
  return `КОНТЕКСТ:
Цели: ${JSON.stringify(goals)}
Проекты (активные): ${JSON.stringify(projects?.filter((p: Record<string,unknown>) => p.status === 'active'))}
Задачи (todo): ${JSON.stringify(tasks)}

ЗАПРОС ПОЛЬЗОВАТЕЛЯ: ${message}`
}
