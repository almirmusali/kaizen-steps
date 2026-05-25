// Локальный сервер для разработки — проксирует /api/claude к Anthropic
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { config } from 'dotenv'

config()

const app  = express()
const PORT = 3001
const MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6'

app.use(cors())
app.use(express.json())

app.post('/api/claude', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({ message: 'ANTHROPIC_API_KEY не задан в .env' })
  }

  const { message, goals, projects, tasks, aiSettings } = req.body ?? {}

  const systemPrompt = buildSystem(aiSettings)
  const userContent  = buildUserMessage(message, goals, projects, tasks)

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    })

    const text = response.content.find((b: { type: string }) => b.type === 'text') as { text: string } | undefined
    const rawText = text?.text ?? ''

    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/)
    let actions = undefined
    let message_out = rawText

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])
        actions = parsed.actions
        message_out = rawText.replace(/```json[\s\S]*?```/g, '').trim()
      } catch { /* игнорируем ошибку парсинга */ }
    }

    return res.json({ message: message_out, actions })
  } catch (err) {
    console.error('Claude API error:', err)
    return res.status(500).json({ message: 'Ошибка запроса к AI' })
  }
})

app.listen(PORT, () => console.log(`API dev server: http://localhost:${PORT}`))

function buildSystem(settings: Record<string, string> | undefined): string {
  const goals       = settings?.goals       ?? ''
  const instruction = settings?.instruction ?? ''
  const rhythm      = settings?.rhythm      ?? ''

  return `Ты — AI-помощник в приложении «Кайдзен — система маленьких шагов». Твоя философия основана на методике Максима Дорофеева (Джедайские техники) и принципе кайдзен.

КЛЮЧЕВЫЕ ПРИНЦИПЫ:
1. Мыслетопливо: прокрастинация — истощение умственной энергии, не лень. Экономь её.
2. Критерий задачи: идеальная формулировка — действие, в ходе которого НЕ НАДО ДУМАТЬ. «Открыть телефон и снять один дубль» вместо «сделать видео».
3. Правило 2 минут: дело < 2 минут — сделать сразу без записи.
4. Шаги должны быть маленькими. Если большой — предложи раздробить.
5. Баланс между целями: замечай, если одна цель давно не двигается.

${goals       ? `\nМОИ ЦЕЛИ:\n${goals}`       : ''}
${instruction ? `\nКАК СЕБЯ ВЕСТИ:\n${instruction}` : ''}
${rhythm      ? `\nМОЙ РИТМ:\n${rhythm}`      : ''}

ФОРМАТ ОТВЕТА:
- Пиши тепло, коротко, без пафоса.
- Если создаёшь/изменяешь задачи — добавь JSON-блок в конце:
\`\`\`json
{"actions": [{"type":"create_task","task":{"title":"...","goalId":"..."}}]}
\`\`\`
- Допустимые типы actions: create_task, create_project, schedule_today, decompose, link_goal, complete_task.
- Поля task: title, projectId, goalId, scheduledDate, isToday.
- Поля project: title, goalId.
- Всегда формулируй задачи по критерию Дорофеева.`
}

function buildUserMessage(message: string, goals: unknown[], projects: unknown[], tasks: unknown[]): string {
  return `КОНТЕКСТ:
Цели: ${JSON.stringify(goals)}
Проекты (активные): ${JSON.stringify((projects as Array<Record<string,unknown>>)?.filter(p => p.status === 'active'))}
Задачи (todo): ${JSON.stringify(tasks)}

ЗАПРОС ПОЛЬЗОВАТЕЛЯ: ${message}`
}
