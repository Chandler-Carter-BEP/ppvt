import type { Metric, Entry } from "@/lib/db/schema"

export type CheckInStatus = "overdue" | "due-soon" | "due-today" | "scheduled"

export interface CheckInItem {
  metricId: string
  metricName: string
  projectId: string
  projectName: string
  dueDate: Date
  status: CheckInStatus
  daysUntilDue: number
}

export function getNextDueDate(
  metric: Pick<Metric, "checkInCadenceDays" | "createdAt">,
  lastEntryDate: Date | null
): Date | null {
  if (!metric.checkInCadenceDays) return null
  const base = lastEntryDate ?? metric.createdAt
  const due = new Date(base)
  due.setDate(due.getDate() + metric.checkInCadenceDays)
  return due
}

export function getCheckInStatus(dueDate: Date, today: Date): CheckInStatus {
  const msPerDay = 1000 * 60 * 60 * 24
  // Compare at day granularity
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
  const days = Math.round((dueStart.getTime() - todayStart.getTime()) / msPerDay)

  if (days < 0) return "overdue"
  if (days === 0) return "due-today"
  if (days <= 7) return "due-soon"
  return "scheduled"
}

export function getDaysLabel(status: CheckInStatus, daysUntilDue: number): string {
  if (status === "overdue") {
    const abs = Math.abs(daysUntilDue)
    return abs === 1 ? "1 day overdue" : `${abs} days overdue`
  }
  if (status === "due-today") return "Due today"
  if (daysUntilDue === 1) return "Due tomorrow"
  return `Due in ${daysUntilDue} days`
}

export function buildCheckInItems(
  projectsWithMetrics: Array<{
    id: string
    name: string
    metrics: Array<
      Pick<Metric, "id" | "name" | "checkInCadenceDays" | "createdAt"> & {
        entries: Pick<Entry, "date">[]
      }
    >
  }>,
  today = new Date()
): CheckInItem[] {
  const items: CheckInItem[] = []

  for (const project of projectsWithMetrics) {
    for (const metric of project.metrics) {
      if (!metric.checkInCadenceDays) continue

      const lastEntryDate =
        metric.entries.length > 0
          ? metric.entries.reduce((latest, e) =>
              e.date > latest ? e.date : latest,
              metric.entries[0].date
            )
          : null

      const dueDate = getNextDueDate(metric, lastEntryDate)
      if (!dueDate) continue

      const status = getCheckInStatus(dueDate, today)
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
      const daysUntilDue = Math.round(
        (dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
      )

      items.push({
        metricId: metric.id,
        metricName: metric.name,
        projectId: project.id,
        projectName: project.name,
        dueDate,
        status,
        daysUntilDue,
      })
    }
  }

  return items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}
