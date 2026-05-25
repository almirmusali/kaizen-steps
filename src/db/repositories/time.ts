import { db } from '../schema'
import type { TimeEntry } from '../../types'
import { nanoid } from '../../utils/id'

export const timeRepo = {
  async getByTask(taskId: string): Promise<TimeEntry[]> {
    return db.timeEntries.where('taskId').equals(taskId).toArray()
  },
  async getByProject(projectId: string): Promise<TimeEntry[]> {
    return db.timeEntries.where('projectId').equals(projectId).toArray()
  },
  async getByWeek(weekStart: Date, weekEnd: Date): Promise<TimeEntry[]> {
    return db.timeEntries
      .where('startedAt').between(weekStart, weekEnd)
      .toArray()
  },
  async add(data: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
    const entry: TimeEntry = { ...data, id: nanoid() }
    await db.timeEntries.add(entry)
    return entry
  },
}
