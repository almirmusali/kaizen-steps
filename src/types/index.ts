// ─── Инбокс ───────────────────────────────────────────────────────────────────
export interface InboxItem {
  id: string
  text: string
  createdAt: Date
}

// ─── Цели ─────────────────────────────────────────────────────────────────────
export interface Goal {
  id: string
  title: string
  description?: string
  color: string
  createdAt: Date
  archivedAt?: Date
}

// ─── Проекты ──────────────────────────────────────────────────────────────────
export type ProjectStatus = 'active' | 'done' | 'archived'

export interface Project {
  id: string
  title: string
  goalId?: string
  status: ProjectStatus
  nextActionId?: string
  totalTime: number   // секунды
  createdAt: Date
  completedAt?: Date
}

// ─── Задачи / шаги ────────────────────────────────────────────────────────────
export type TaskStatus = 'todo' | 'done' | 'skipped'

export interface Task {
  id: string
  title: string        // формулировка «делаю не думая»
  projectId?: string
  goalId?: string
  status: TaskStatus
  scheduledDate?: string   // YYYY-MM-DD
  isToday: boolean
  timeSpent: number        // секунды
  activeTimerStart?: number // timestamp ms, если таймер запущен
  createdAt: Date
  completedAt?: Date
}

// ─── Учёт времени ─────────────────────────────────────────────────────────────
export interface TimeEntry {
  id: string
  taskId: string
  projectId?: string
  duration: number    // секунды
  isManual: boolean
  startedAt: Date
  endedAt?: Date
}

// ─── Обзоры и журнал ──────────────────────────────────────────────────────────
export interface DailyReview {
  id: string
  date: string         // YYYY-MM-DD
  done: string
  blockers: string
  nextStep: string
  createdAt: Date
}

export interface WeeklyReview {
  id: string
  weekStart: string    // YYYY-MM-DD (понедельник)
  notes: string
  aiSummary?: string
  createdAt: Date
}

export interface JournalNote {
  id: string
  text: string
  aiInsight?: string
  tags?: string[]
  createdAt: Date
}

// ─── Настройки AI ─────────────────────────────────────────────────────────────
export type AutonomyMode = 'suggest' | 'auto' | 'adaptive'

export interface AISettings {
  id: 1
  goals: string
  instruction: string
  rhythm: string
  autonomyMode: AutonomyMode
}

// ─── AI actions (структурированный вывод) ─────────────────────────────────────
export type AIAction =
  | { type: 'create_task';    task: Partial<Task> }
  | { type: 'create_project'; project: Partial<Project> }
  | { type: 'schedule_today'; taskIds: string[] }
  | { type: 'decompose';      taskId: string; subtasks: Partial<Task>[] }
  | { type: 'link_goal';      entityType: 'task' | 'project'; entityId: string; goalId: string }
  | { type: 'complete_task';  taskId: string }

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  actions?: AIAction[]
  pending?: boolean   // ожидает подтверждения
}

export interface AIResponse {
  message: string
  actions?: AIAction[]
}
