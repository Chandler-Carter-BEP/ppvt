import type { AdapterAccountType } from "@auth/core/adapters"
import {
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ── Auth tables (Auth.js / next-auth v5 compatible) ─────────────────────────

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  // PPVT-specific fields (Phase 2: entra_object_id used for Teams/Outlook)
  role: text("role", { enum: ["pm", "lead"] }).default("pm").notNull(),
  entraObjectId: text("entra_object_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

// ── PPVT domain tables ───────────────────────────────────────────────────────

export const atlassianConfigs = pgTable("atlassian_config", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  baseUrl: text("base_url").notNull(),
  accountEmail: text("account_email").notNull(),
  // TODO: encrypt at rest before production deployment
  apiToken: text("api_token").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const projects = pgTable("project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  jiraUrl: text("jira_url"),
  confluenceUrl: text("confluence_url"),
  status: text("status", { enum: ["active", "archived"] })
    .default("active")
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const metrics = pgTable("metric", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  target: text("target"),
  checkInCadenceDays: integer("check_in_cadence_days"),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

export const entries = pgTable("entry", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  metricId: text("metric_id")
    .notNull()
    .references(() => metrics.id, { onDelete: "cascade" }),
  value: doublePrecision("value").notNull(),
  note: text("note"),
  date: timestamp("date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
})

// ── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  projects: many(projects),
  atlassianConfig: one(atlassianConfigs, {
    fields: [users.id],
    references: [atlassianConfigs.userId],
  }),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  metrics: many(metrics),
}))

export const metricsRelations = relations(metrics, ({ one, many }) => ({
  project: one(projects, { fields: [metrics.projectId], references: [projects.id] }),
  entries: many(entries),
}))

export const entriesRelations = relations(entries, ({ one }) => ({
  metric: one(metrics, { fields: [entries.metricId], references: [metrics.id] }),
}))

// ── Types ────────────────────────────────────────────────────────────────────

export type AtlassianConfig = typeof atlassianConfigs.$inferSelect
export type NewAtlassianConfig = typeof atlassianConfigs.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Metric = typeof metrics.$inferSelect
export type NewMetric = typeof metrics.$inferInsert
export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert
