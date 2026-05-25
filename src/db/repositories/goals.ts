import { db } from '../schema'
import type { Goal } from '../../types'
import { nanoid } from '../../utils/id'

export const goalsRepo = {
  async getAll(): Promise<Goal[]> {
    return db.goals.where('archivedAt').equals('').or('archivedAt').equals(undefined as unknown as string)
      .sortBy('createdAt').then(r => r.reverse())
      .catch(() => db.goals.toArray())
  },
  async getActive(): Promise<Goal[]> {
    const all = await db.goals.toArray()
    return all.filter(g => !g.archivedAt).reverse()
  },
  async add(data: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    const goal: Goal = { ...data, id: nanoid(), createdAt: new Date() }
    await db.goals.add(goal)
    return goal
  },
  async update(id: string, data: Partial<Goal>): Promise<void> {
    await db.goals.update(id, data)
  },
  async archive(id: string): Promise<void> {
    await db.goals.update(id, { archivedAt: new Date() })
  },
}
