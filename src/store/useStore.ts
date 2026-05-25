import { create } from 'zustand'
import type { Goal, Project, Task, InboxItem, AIMessage, AISettings, JournalNote } from '../types'
import { goalsRepo }      from '../db/repositories/goals'
import { projectsRepo }   from '../db/repositories/projects'
import { tasksRepo }      from '../db/repositories/tasks'
import { inboxRepo }      from '../db/repositories/inbox'
import { aiSettingsRepo } from '../db/repositories/aiSettings'
import { reviewsRepo }    from '../db/repositories/reviews'
import { timeRepo }       from '../db/repositories/time'
import { todayStr }       from '../utils/date'
import { getNextSuggestion, type NextSuggestion } from '../services/autoNext'

type Screen = 'home' | 'inbox' | 'projects' | 'goals' | 'review' | 'journal' | 'aiSettings'
type Theme  = 'light' | 'dark'

interface State {
  // Навигация
  screen:   Screen
  setScreen: (s: Screen) => void

  // Тема
  theme: Theme
  toggleTheme: () => void

  // Данные
  goals:     Goal[]
  projects:  Project[]
  tasks:     Task[]
  inbox:     InboxItem[]
  aiSettings: AISettings
  journalNotes: JournalNote[]

  // AI чат
  aiMessages: AIMessage[]
  aiLoading:  boolean

  // Авто-следующий шаг
  nextSuggestion:        NextSuggestion | null
  nextSuggestionLoading: boolean
  dismissSuggestion:     () => void

  // Загрузка всех данных
  loadAll: () => Promise<void>

  // Goals
  addGoal:    (data: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>
  archiveGoal:(id: string) => Promise<void>

  // Projects
  addProject:    (data: Omit<Project, 'id' | 'createdAt' | 'totalTime'>) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>

  // Tasks
  addTask:      (data: Partial<Task>) => Promise<Task>
  updateTask:   (id: string, data: Partial<Task>) => Promise<void>
  completeTask: (id: string) => Promise<void>
  scheduleToday:(id: string) => Promise<void>

  // Inbox
  addInbox:    (text: string) => Promise<void>
  removeInbox: (id: string) => Promise<void>

  // Timer helpers
  startTimer:  (taskId: string) => Promise<void>
  stopTimer:   (taskId: string) => Promise<void>
  addManualTime:(taskId: string, seconds: number) => Promise<void>

  // AI
  setAIMessages:  (msgs: AIMessage[]) => void
  setAILoading:   (v: boolean) => void
  saveAISettings: (data: Partial<AISettings>) => Promise<void>

  // Journal
  addJournalNote:    (text: string) => Promise<void>
  updateJournalNote: (id: string, data: Partial<JournalNote>) => Promise<void>
  loadJournalNotes:  () => Promise<void>
}

export const useStore = create<State>((set, get) => ({
  screen: 'home',
  setScreen: (screen) => set({ screen }),

  theme: (localStorage.getItem('theme') as Theme) ?? 'light',
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    set({ theme: next })
  },

  goals:        [],
  projects:     [],
  tasks:        [],
  inbox:        [],
  aiSettings:   { id: 1, goals: '', instruction: '', rhythm: '', autonomyMode: 'suggest' },
  journalNotes: [],
  aiMessages:   [],
  aiLoading:    false,

  nextSuggestion:        null,
  nextSuggestionLoading: false,
  dismissSuggestion:     () => set({ nextSuggestion: null }),

  loadAll: async () => {
    const [goals, projects, tasks, inbox, aiSettings, journalNotes] = await Promise.all([
      goalsRepo.getActive(),
      projectsRepo.getAll(),
      tasksRepo.getAll(),
      inboxRepo.getAll(),
      aiSettingsRepo.get(),
      reviewsRepo.getJournalNotes(),
    ])
    set({ goals, projects, tasks, inbox, aiSettings, journalNotes })
  },

  addGoal: async (data) => {
    const goal = await goalsRepo.add(data)
    set(s => ({ goals: [goal, ...s.goals] }))
  },
  updateGoal: async (id, data) => {
    await goalsRepo.update(id, data)
    set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...data } : g) }))
  },
  archiveGoal: async (id) => {
    await goalsRepo.archive(id)
    set(s => ({ goals: s.goals.filter(g => g.id !== id) }))
  },

  addProject: async (data) => {
    const project = await projectsRepo.add(data)
    set(s => ({ projects: [project, ...s.projects] }))
  },
  updateProject: async (id, data) => {
    await projectsRepo.update(id, data)
    set(s => ({ projects: s.projects.map(p => p.id === id ? { ...p, ...data } : p) }))
  },

  addTask: async (data) => {
    const task = await tasksRepo.add(data)
    set(s => ({ tasks: [task, ...s.tasks] }))
    return task
  },
  updateTask: async (id, data) => {
    await tasksRepo.update(id, data)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...data } : t) }))
  },
  completeTask: async (id) => {
    await tasksRepo.complete(id)
    const { tasks, goals, projects, aiSettings } = get()
    const task = tasks.find(t => t.id === id)
    if (task?.projectId) {
      await projectsRepo.addTime(task.projectId, task.timeSpent)
    }

    // Обновляем статус в сторе
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: 'done' as const, completedAt: new Date() } : t)
    set({ tasks: updatedTasks, nextSuggestion: null, nextSuggestionLoading: true })

    // Запускаем AI-выбор следующего шага асинхронно
    if (task) {
      getNextSuggestion({
        completedTask: task,
        tasks:         updatedTasks,
        goals,
        projects,
        aiSettings,
      }).then(suggestion => {
        set({ nextSuggestion: suggestion, nextSuggestionLoading: false })
      }).catch(() => {
        set({ nextSuggestionLoading: false })
      })
    } else {
      set({ nextSuggestionLoading: false })
    }
  },
  scheduleToday: async (id) => {
    const today = todayStr()
    await tasksRepo.update(id, { isToday: true, scheduledDate: today })
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, isToday: true, scheduledDate: today } : t) }))
  },

  addInbox: async (text) => {
    const item = await inboxRepo.add(text)
    set(s => ({ inbox: [item, ...s.inbox] }))
  },
  removeInbox: async (id) => {
    await inboxRepo.remove(id)
    set(s => ({ inbox: s.inbox.filter(i => i.id !== id) }))
  },

  startTimer: async (taskId) => {
    const now = Date.now()
    await tasksRepo.update(taskId, { activeTimerStart: now })
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, activeTimerStart: now } : t) }))
  },
  stopTimer: async (taskId) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task?.activeTimerStart) return
    const elapsed = Math.round((Date.now() - task.activeTimerStart) / 1000)
    await tasksRepo.update(taskId, { activeTimerStart: undefined, timeSpent: task.timeSpent + elapsed })
    await timeRepo.add({ taskId, projectId: task.projectId, duration: elapsed, isManual: false, startedAt: new Date(task.activeTimerStart), endedAt: new Date() })
    set(s => ({
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, activeTimerStart: undefined, timeSpent: t.timeSpent + elapsed } : t),
    }))
  },
  addManualTime: async (taskId, seconds) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    await tasksRepo.update(taskId, { timeSpent: task.timeSpent + seconds })
    await timeRepo.add({ taskId, projectId: task.projectId, duration: seconds, isManual: true, startedAt: new Date(), endedAt: new Date() })
    set(s => ({
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, timeSpent: t.timeSpent + seconds } : t),
    }))
  },

  setAIMessages: (msgs) => set({ aiMessages: msgs }),
  setAILoading:  (v)    => set({ aiLoading: v }),

  saveAISettings: async (data) => {
    await aiSettingsRepo.save(data)
    set(s => ({ aiSettings: { ...s.aiSettings, ...data } }))
  },

  addJournalNote: async (text) => {
    const note = await reviewsRepo.addJournalNote(text)
    set(s => ({ journalNotes: [note, ...s.journalNotes] }))
  },
  updateJournalNote: async (id, data) => {
    await reviewsRepo.updateJournalNote(id, data)
    set(s => ({ journalNotes: s.journalNotes.map(n => n.id === id ? { ...n, ...data } : n) }))
  },
  loadJournalNotes: async () => {
    const journalNotes = await reviewsRepo.getJournalNotes()
    set({ journalNotes })
  },
}))
