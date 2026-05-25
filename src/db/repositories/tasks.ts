import { db } from '../schema'
import type { Task } from '../../types'
import { nanoid } from '../../utils/id'
import { todayStr } from '../../utils/date'

export const tasksRepo = {
  async getAll(): Promise<Task[]> {
    return db.tasks.toArray()
  },
  async getToday(): Promise<Task[]> {
    const today = todayStr()
    const all = await db.tasks.toArray()
    return all.filter(t =>
      t.status === 'todo' && (t.isToday || t.scheduledDate === today)
    )
  },
  async getByProject(projectId: string): Promise<Task[]> {
    return db.tasks.where('projectId').equals(projectId).toArray()
  },
  async getByGoal(goalId: string): Promise<Task[]> {
    return db.tasks.where('goalId').equals(goalId).toArray()
  },
  async get(id: string): Promise<Task | undefined> {
    return db.tasks.get(id)
  },
  async add(data: Partial<Task>): Promise<Task> {
    const task: Task = {
      id: nanoid(),
      title: '',
      status: 'todo',
      isToday: false,
      timeSpent: 0,
      createdAt: new Date(),
      ...data,
    }
    await db.tasks.add(task)
    return task
  },
  async update(id: string, data: Partial<Task>): Promise<void> {
    await db.tasks.update(id, data)
  },
  async complete(id: string): Promise<void> {
    await db.tasks.update(id, { status: 'done', completedAt: new Date() })
  },
  async addTime(id: string, seconds: number): Promise<void> {
    const task = await db.tasks.get(id)
    if (task) await db.tasks.update(id, { timeSpent: task.timeSpent + seconds })
  },
}
