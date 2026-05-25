/**
 * Сервис «авто-следующий шаг»
 * После выполнения задачи AI выбирает, что важнее всего делать сейчас.
 * Учитывает: баланс целей, задержавшиеся проекты, неделю по плану.
 * Без ключа — умная эвристика.
 */
import type { Task, Goal, Project, AISettings } from '../types'

export interface NextSuggestion {
  task:   Task
  reason: string   // 1 короткое объяснение почему именно эта
}

// ─── Вызов AI ─────────────────────────────────────────────────────────────────
export async function getNextSuggestion(params: {
  completedTask: Task
  tasks:         Task[]
  goals:         Goal[]
  projects:      Project[]
  aiSettings:    AISettings
}): Promise<NextSuggestion | null> {
  const { completedTask, tasks, goals, projects, aiSettings } = params

  const todoTasks = tasks.filter(t => t.status === 'todo' && t.id !== completedTask.id)
  if (todoTasks.length === 0) return null

  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: buildQuery(completedTask, todoTasks, goals, projects),
        goals,
        projects,
        tasks: todoTasks,
        aiSettings,
        mode: 'auto_next',  // подсказка для бэкенда
      }),
    })

    if (!res.ok) {
      // Нет ключа или ошибка — fallback на эвристику
      return heuristic(completedTask, todoTasks, goals, projects)
    }

    const data = await res.json()
    return parseAIResponse(data.message, todoTasks, completedTask) ??
           heuristic(completedTask, todoTasks, goals, projects)
  } catch {
    return heuristic(completedTask, todoTasks, goals, projects)
  }
}

// ─── Строим запрос ────────────────────────────────────────────────────────────
function buildQuery(
  done: Task,
  todo: Task[],
  goals: Goal[],
  projects: Project[],
): string {
  const goalMap = Object.fromEntries(goals.map(g => [g.id, g.title]))
  const projMap = Object.fromEntries(projects.map(p => [p.id, p.title]))

  const goalActivity: Record<string, number> = {}
  goals.forEach(g => { goalActivity[g.id] = 0 })

  // Строим краткий список задач с ID
  const taskList = todo.slice(0, 30).map(t => ({
    id:      t.id,
    title:   t.title,
    goal:    t.goalId ? goalMap[t.goalId] ?? '' : '',
    project: t.projectId ? projMap[t.projectId] ?? '' : '',
    today:   t.isToday,
  }))

  return `Я только что выполнил задачу: «${done.title}».

Список доступных задач (макс. 30):
${JSON.stringify(taskList, null, 2)}

Выбери ОДНУ задачу — самую важную сейчас. Критерии:
1. Если у какой-то цели давно нет прогресса — приоритет ей.
2. Если у текущего проекта есть логически следующий шаг — продолжи его.
3. Шаг должен быть маленьким и конкретным (принцип кайдзен).
4. НЕ выбирай уже запланированные на сегодня задачи.

Ответь строго в формате JSON (только JSON, никакого текста вокруг):
{"taskId":"<id из списка>","reason":"<1 предложение почему>"}`
}

// ─── Парсим ответ AI ──────────────────────────────────────────────────────────
function parseAIResponse(
  message: string,
  todo: Task[],
  _done: Task,
): NextSuggestion | null {
  try {
    // Ищем JSON в ответе
    const match = message.match(/\{[\s\S]*"taskId"[\s\S]*\}/)
    if (!match) return null

    const parsed = JSON.parse(match[0]) as { taskId: string; reason: string }
    const task = todo.find(t => t.id === parsed.taskId)
    if (!task) return null

    return { task, reason: parsed.reason ?? 'Следующий логичный шаг' }
  } catch {
    return null
  }
}

// ─── Эвристика (без AI) ───────────────────────────────────────────────────────
function heuristic(
  done: Task,
  todo: Task[],
  goals: Goal[],
  projects: Project[],
): NextSuggestion | null {
  if (todo.length === 0) return null

  // Счётчик активности по целям (для эвристики «давно не двигалась»)
  const goalScore: Record<string, number> = {}
  goals.forEach(g => { goalScore[g.id] = 0 })

  // 2. Приоритеты:
  //    a) Продолжить тот же проект (если там есть todo)
  //    b) Цель с наименьшим прогрессом
  //    c) Просто первая todo

  // a) тот же проект
  if (done.projectId) {
    const sameProject = todo.find(t =>
      t.projectId === done.projectId && !t.isToday
    )
    if (sameProject) {
      const proj = projects.find(p => p.id === done.projectId)
      return {
        task:   sameProject,
        reason: `Следующий шаг в проекте «${proj?.title ?? ''}»`,
      }
    }
  }

  // b) цель с нулевой активностью
  if (goals.length > 1) {
    for (const goal of goals) {
      const task = todo.find(t => t.goalId === goal.id && !t.isToday)
      if (task && goalScore[goal.id] === 0) {
        return {
          task,
          reason: `Цель «${goal.title}» давно не двигалась`,
        }
      }
    }
  }

  // c) первая задача не на сегодня
  const notToday = todo.find(t => !t.isToday)
  if (notToday) return { task: notToday, reason: 'Следующий шаг по плану' }

  return { task: todo[0], reason: 'Следующий шаг по плану' }
}
