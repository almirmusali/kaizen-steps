import { db } from '../db/schema'

export async function exportData(): Promise<void> {
  const [inbox, goals, projects, tasks, timeEntries, dailyReviews, weeklyReviews, journalNotes, aiSettings] =
    await Promise.all([
      db.inbox.toArray(),
      db.goals.toArray(),
      db.projects.toArray(),
      db.tasks.toArray(),
      db.timeEntries.toArray(),
      db.dailyReviews.toArray(),
      db.weeklyReviews.toArray(),
      db.journalNotes.toArray(),
      db.aiSettings.toArray(),
    ])
  const data = { inbox, goals, projects, tasks, timeEntries, dailyReviews, weeklyReviews, journalNotes, aiSettings }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kaizen-backup-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text)
  const tables = [db.inbox, db.goals, db.projects, db.tasks, db.timeEntries, db.dailyReviews, db.weeklyReviews, db.journalNotes, db.aiSettings]
  await db.transaction('rw', tables, async () => {
    if (data.inbox)         await db.inbox.bulkPut(data.inbox)
    if (data.goals)         await db.goals.bulkPut(data.goals)
    if (data.projects)      await db.projects.bulkPut(data.projects)
    if (data.tasks)         await db.tasks.bulkPut(data.tasks)
    if (data.timeEntries)   await db.timeEntries.bulkPut(data.timeEntries)
    if (data.dailyReviews)  await db.dailyReviews.bulkPut(data.dailyReviews)
    if (data.weeklyReviews) await db.weeklyReviews.bulkPut(data.weeklyReviews)
    if (data.journalNotes)  await db.journalNotes.bulkPut(data.journalNotes)
    if (data.aiSettings)    await db.aiSettings.bulkPut(data.aiSettings)
  })
}
