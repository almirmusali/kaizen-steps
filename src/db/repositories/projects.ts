import { db } from '../schema'
import type { Project } from '../../types'
import { nanoid } from '../../utils/id'

export const projectsRepo = {
  async getAll(): Promise<Project[]> {
    return db.projects.toArray()
  },
  async getActive(): Promise<Project[]> {
    return db.projects.where('status').equals('active').toArray()
  },
  async get(id: string): Promise<Project | undefined> {
    return db.projects.get(id)
  },
  async add(data: Omit<Project, 'id' | 'createdAt' | 'totalTime'>): Promise<Project> {
    const project: Project = { ...data, id: nanoid(), totalTime: 0, createdAt: new Date() }
    await db.projects.add(project)
    return project
  },
  async update(id: string, data: Partial<Project>): Promise<void> {
    await db.projects.update(id, data)
  },
  async addTime(id: string, seconds: number): Promise<void> {
    const proj = await db.projects.get(id)
    if (proj) await db.projects.update(id, { totalTime: proj.totalTime + seconds })
  },
}
