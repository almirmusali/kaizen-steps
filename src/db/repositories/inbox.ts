import { db } from '../schema'
import type { InboxItem } from '../../types'
import { nanoid } from '../../utils/id'

export const inboxRepo = {
  async getAll(): Promise<InboxItem[]> {
    return db.inbox.orderBy('createdAt').reverse().toArray()
  },
  async add(text: string): Promise<InboxItem> {
    const item: InboxItem = { id: nanoid(), text, createdAt: new Date() }
    await db.inbox.add(item)
    return item
  },
  async remove(id: string): Promise<void> {
    await db.inbox.delete(id)
  },
  async clear(): Promise<void> {
    await db.inbox.clear()
  },
}
