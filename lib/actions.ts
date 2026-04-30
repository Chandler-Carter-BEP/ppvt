"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projects, metrics, entries } from "@/lib/db/schema"
import { and, eq, gte, sum } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { buildCheckInItems } from "@/lib/check-ins"
import {
  fetchJiraIssue,
  fetchConfluencePage,
  testAtlassianConnection,
} from "@/lib/atlassian"
import { atlassianConfigs } from "@/lib/db/schema"

// ── Helpers ──────────────────────────────────────────────────────────────────

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

// ── Projects ─────────────────────────────────────────────────────────────────

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  jiraUrl: z.string().max(500).optional(),
  confluenceUrl: z.string().max(500).optional(),
})

export async function createProject(
  input: z.infer<typeof createProjectSchema>
): Promise<string> {
  const userId = await requireUser()
  const data = createProjectSchema.parse(input)

  const [project] = await db
    .insert(projects)
    .values({
      userId,
      name: data.name,
      description: data.description || null,
      jiraUrl: data.jiraUrl || null,
      confluenceUrl: data.confluenceUrl || null,
    })
    .returning({ id: projects.id })

  revalidatePath("/")
  return project.id
}

export async function getProjects() {
  const userId = await requireUser()

  const rows = await db.query.projects.findMany({
    where: and(eq(projects.userId, userId), eq(projects.status, "active")),
    with: {
      metrics: {
        columns: { id: true, name: true, checkInCadenceDays: true, createdAt: true },
        with: { entries: { columns: { date: true } } },
      },
    },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  })

  return rows.map((p) => ({ ...p, metricCount: p.metrics.length }))
}

export async function getCheckInSummary() {
  const userId = await requireUser()

  const rows = await db.query.projects.findMany({
    where: and(eq(projects.userId, userId), eq(projects.status, "active")),
    columns: { id: true, name: true },
    with: {
      metrics: {
        columns: { id: true, name: true, checkInCadenceDays: true, createdAt: true },
        with: { entries: { columns: { date: true } } },
      },
    },
  })

  const items = buildCheckInItems(rows)

  return {
    items: items.slice(0, 10),
    overdueCount: items.filter((i) => i.status === "overdue").length,
    dueThisWeekCount: items.filter(
      (i) => i.status === "due-today" || i.status === "due-soon"
    ).length,
  }
}

export async function getPortfolioYtd() {
  const userId = await requireUser()
  const yearStart = new Date(new Date().getFullYear(), 0, 1)

  const result = await db
    .select({ total: sum(entries.value) })
    .from(entries)
    .innerJoin(metrics, eq(entries.metricId, metrics.id))
    .innerJoin(projects, eq(metrics.projectId, projects.id))
    .where(and(eq(projects.userId, userId), gte(entries.date, yearStart)))

  return Number(result[0]?.total ?? 0)
}

// ── Metrics ──────────────────────────────────────────────────────────────────

const createMetricSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(100),
  unit: z.string().min(1).max(20),
  target: z.string().max(50).optional(),
  checkInCadenceDays: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
})

export async function createMetric(
  input: z.infer<typeof createMetricSchema>
): Promise<string> {
  const userId = await requireUser()
  const data = createMetricSchema.parse(input)

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, data.projectId), eq(projects.userId, userId)))

  if (!project) throw new Error("Project not found")

  const [metric] = await db
    .insert(metrics)
    .values({
      projectId: data.projectId,
      name: data.name,
      unit: data.unit,
      target: data.target || null,
      checkInCadenceDays: data.checkInCadenceDays ?? null,
      description: data.description || null,
    })
    .returning({ id: metrics.id })

  revalidatePath(`/projects/${data.projectId}`)
  return metric.id
}

// ── Entries ──────────────────────────────────────────────────────────────────

const createEntrySchema = z.object({
  metricId: z.string().min(1),
  value: z.number(),
  note: z.string().max(1000).optional(),
  date: z.string().min(1),
})

export async function createEntry(
  input: z.infer<typeof createEntrySchema>
): Promise<void> {
  const userId = await requireUser()
  const data = createEntrySchema.parse(input)

  const [row] = await db
    .select({ projectId: metrics.projectId })
    .from(metrics)
    .innerJoin(projects, eq(projects.id, metrics.projectId))
    .where(and(eq(metrics.id, data.metricId), eq(projects.userId, userId)))

  if (!row) throw new Error("Metric not found")

  await db.insert(entries).values({
    metricId: data.metricId,
    value: data.value,
    note: data.note || null,
    date: new Date(data.date),
  })

  revalidatePath(`/projects/${row.projectId}`)
  revalidatePath("/")
}

// ── Project detail ────────────────────────────────────────────────────────────

export async function getProjectDetail(id: string) {
  const userId = await requireUser()

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, userId)),
    with: {
      metrics: {
        orderBy: (m, { asc }) => [asc(m.createdAt)],
        with: {
          entries: {
            orderBy: (e, { desc }) => [desc(e.date)],
          },
        },
      },
    },
  })

  return project ?? null
}

// ── Atlassian ─────────────────────────────────────────────────────────────────

const atlassianConfigSchema = z.object({
  baseUrl: z.string().min(1).max(200),
  accountEmail: z.string().email(),
  apiToken: z.string().min(1),
})

export async function saveAtlassianConfig(
  input: z.infer<typeof atlassianConfigSchema>
) {
  const userId = await requireUser()
  const data = atlassianConfigSchema.parse(input)

  await db
    .insert(atlassianConfigs)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: atlassianConfigs.userId,
      set: {
        baseUrl: data.baseUrl,
        accountEmail: data.accountEmail,
        apiToken: data.apiToken,
        updatedAt: new Date(),
      },
    })

  revalidatePath("/settings")
}

export async function getAtlassianConfig() {
  const userId = await requireUser()
  const row = await db.query.atlassianConfigs.findFirst({
    where: eq(atlassianConfigs.userId, userId),
  })
  // Never expose the raw token to the client
  if (!row) return null
  return {
    baseUrl: row.baseUrl,
    accountEmail: row.accountEmail,
    hasToken: true,
    updatedAt: row.updatedAt,
  }
}

export async function testAtlassianConfigConnection() {
  const userId = await requireUser()
  const row = await db.query.atlassianConfigs.findFirst({
    where: eq(atlassianConfigs.userId, userId),
  })
  if (!row) return { ok: false, error: "No Atlassian config saved." }
  return testAtlassianConnection(row.baseUrl, row.accountEmail, row.apiToken)
}

export async function getProjectAtlassianData(projectId: string) {
  const userId = await requireUser()

  const [project, config] = await Promise.all([
    db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
      columns: { jiraUrl: true, confluenceUrl: true },
    }),
    db.query.atlassianConfigs.findFirst({
      where: eq(atlassianConfigs.userId, userId),
    }),
  ])

  if (!project || !config) return { jira: null, confluence: null }

  const [jira, confluence] = await Promise.all([
    project.jiraUrl
      ? fetchJiraIssue(config.baseUrl, config.accountEmail, config.apiToken, project.jiraUrl)
      : Promise.resolve(null),
    project.confluenceUrl
      ? fetchConfluencePage(config.baseUrl, config.accountEmail, config.apiToken, project.confluenceUrl)
      : Promise.resolve(null),
  ])

  return { jira, confluence }
}
