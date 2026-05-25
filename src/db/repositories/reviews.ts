import { db } from '../schema'
import type { DailyReview, WeeklyReview, JournalNote } from '../../types'
import { nanoid } from '../../utils/id'

export const reviewsRepo = {
  async getDailyReview(date: string): Promise<DailyReview | undefined> {
    return db.dailyReviews.where('date').equals(date).first()
  },
  async saveDailyReview(data: Omit<DailyReview, 'id' | 'createdAt'>): Promise<DailyReview> {
    const existing = await db.dailyReviews.where('date').equals(data.date).first()
    if (existing) {
      await db.dailyReviews.update(existing.id, data)
      return { ...existing, ...data }
    }
    const review: DailyReview = { ...data, id: nanoid(), createdAt: new Date() }
    await db.dailyReviews.add(review)
    return review
  },
  async getWeeklyReview(weekStart: string): Promise<WeeklyReview | undefined> {
    return db.weeklyReviews.where('weekStart').equals(weekStart).first()
  },
  async saveWeeklyReview(data: Omit<WeeklyReview, 'id' | 'createdAt'>): Promise<WeeklyReview> {
    const existing = await db.weeklyReviews.where('weekStart').equals(data.weekStart).first()
    if (existing) {
      await db.weeklyReviews.update(existing.id, data)
      return { ...existing, ...data }
    }
    const review: WeeklyReview = { ...data, id: nanoid(), createdAt: new Date() }
    await db.weeklyReviews.add(review)
    return review
  },
  async getJournalNotes(): Promise<JournalNote[]> {
    return db.journalNotes.orderBy('createdAt').reverse().toArray()
  },
  async addJournalNote(text: string): Promise<JournalNote> {
    const note: JournalNote = { id: nanoid(), text, createdAt: new Date() }
    await db.journalNotes.add(note)
    return note
  },
  async updateJournalNote(id: string, data: Partial<JournalNote>): Promise<void> {
    await db.journalNotes.update(id, data)
  },
}
