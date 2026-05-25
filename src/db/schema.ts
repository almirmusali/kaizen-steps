import Dexie, { type Table } from 'dexie'
import type {
  InboxItem, Goal, Project, Task,
  TimeEntry, DailyReview, WeeklyReview, JournalNote, AISettings,
} from '../types'

export class KaizenDB extends Dexie {
  inbox!:         Table<InboxItem>
  goals!:         Table<Goal>
  projects!:      Table<Project>
  tasks!:         Table<Task>
  timeEntries!:   Table<TimeEntry>
  dailyReviews!:  Table<DailyReview>
  weeklyReviews!: Table<WeeklyReview>
  journalNotes!:  Table<JournalNote>
  aiSettings!:    Table<AISettings>

  constructor() {
    super('kaizen-steps')
    this.version(1).stores({
      inbox:         '&id, createdAt',
      goals:         '&id, createdAt, archivedAt',
      projects:      '&id, goalId, status, createdAt',
      tasks:         '&id, projectId, goalId, status, scheduledDate, isToday, createdAt',
      timeEntries:   '&id, taskId, projectId, startedAt',
      dailyReviews:  '&id, date',
      weeklyReviews: '&id, weekStart',
      journalNotes:  '&id, createdAt',
      aiSettings:    '&id',
    })
  }
}

export const db = new KaizenDB()
