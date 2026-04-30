"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import {
  TrendingUp,
  Plus,
  ArrowLeft,
  ExternalLink,
  Target,
  CalendarClock,
  PlusCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AddMetricDialog } from "@/components/add-metric-dialog"
import { LogEntryDialog } from "@/components/log-entry-dialog"
import { getNextDueDate, getCheckInStatus, getDaysLabel } from "@/lib/check-ins"
import type { getProjectDetail } from "@/lib/actions"

type Project = NonNullable<Awaited<ReturnType<typeof getProjectDetail>>>
type MetricWithEntries = Project["metrics"][number]

/* ── Animation ───────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: EASE },
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatValue(value: number, unit: string): string {
  const n = unit === "$"
    ? value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : value.toLocaleString("en-US", { maximumFractionDigits: 2 })
  return unit === "$" ? `$${n}` : `${n} ${unit}`
}

function totalValue(metric: MetricWithEntries): number {
  return metric.entries.reduce((acc, e) => acc + e.value, 0)
}

/* ── Empty metrics ───────────────────────────────────────────────────────── */

function EmptyMetrics({ projectId }: { projectId: string }) {
  return (
    <motion.div
      custom={1}
      variants={fadeUp}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-8 py-14 text-center"
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative rounded-xl border border-border bg-card p-4">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <TrendingUp className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground">No metrics yet</h3>
      <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">
        Define the value metrics you want to track — revenue impact, cost savings,
        developer hours saved, etc.
      </p>
      <div className="mt-5">
        <AddMetricDialog projectId={projectId}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add first metric
          </Button>
        </AddMetricDialog>
      </div>
    </motion.div>
  )
}

/* ── Entry row ───────────────────────────────────────────────────────────── */

function EntryRow({
  entry,
  unit,
}: {
  entry: MetricWithEntries["entries"][number]
  unit: string
}) {
  const dateStr = new Date(entry.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="flex items-start gap-3 py-2.5 border-t border-border/60 first:border-t-0">
      <div className="shrink-0 text-right">
        <p className="font-metric text-sm font-semibold text-foreground">
          {formatValue(entry.value, unit)}
        </p>
        <p className="text-[10px] text-muted-foreground/60">{dateStr}</p>
      </div>
      {entry.note && (
        <p className="flex-1 min-w-0 text-xs text-muted-foreground leading-relaxed">
          {entry.note}
        </p>
      )}
    </div>
  )
}

/* ── Metric card ─────────────────────────────────────────────────────────── */

function MetricCard({ metric, index }: { metric: MetricWithEntries; index: number }) {
  const total = totalValue(metric)
  const hasEntries = metric.entries.length > 0

  return (
    <motion.div
      custom={index + 1}
      variants={fadeUp}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{metric.name}</p>
            <Badge variant="secondary" className="rounded px-1.5 py-0 text-[10px] shrink-0">
              {metric.unit}
            </Badge>
          </div>
          {metric.description && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {metric.description}
            </p>
          )}
        </div>
        <LogEntryDialog
          metricId={metric.id}
          metricName={metric.name}
          unit={metric.unit}
        >
          <Button size="xs" variant="outline" className="gap-1 ml-3 shrink-0">
            <PlusCircle className="h-3 w-3" />
            Log entry
          </Button>
        </LogEntryDialog>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 border-b border-border/60 px-5 py-3 text-xs">
        <div>
          <p className="text-muted-foreground/60">Total</p>
          <p className="font-metric font-semibold text-foreground mt-0.5">
            {hasEntries ? formatValue(total, metric.unit) : "—"}
          </p>
        </div>
        {metric.target && (
          <div className="flex items-center gap-1.5">
            <Target className="h-3 w-3 text-muted-foreground/40" />
            <div>
              <p className="text-muted-foreground/60">Target</p>
              <p className="font-metric font-semibold text-foreground mt-0.5">
                {metric.target} {metric.unit}
              </p>
            </div>
          </div>
        )}
        {metric.checkInCadenceDays && (() => {
          const lastDate = metric.entries.length > 0
            ? metric.entries.reduce((l, e) => e.date > l ? e.date : l, metric.entries[0].date)
            : null
          const dueDate = getNextDueDate(metric, lastDate)
          const status = dueDate ? getCheckInStatus(dueDate, new Date()) : null
          const todayMs = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()
          const dueDayMs = dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime() : 0
          const daysUntil = dueDate ? Math.round((dueDayMs - todayMs) / 86400000) : 0
          const statusColor = status === "overdue" || status === "due-today"
            ? "text-[var(--value-overdue)]"
            : status === "due-soon"
            ? "text-[var(--value-warning)]"
            : "text-foreground"
          return (
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3 text-muted-foreground/40" />
            <div>
              <p className="text-muted-foreground/60">Next check-in</p>
              <p className={`font-semibold mt-0.5 ${statusColor}`}>
                {status ? getDaysLabel(status, daysUntil) : "—"}
              </p>
            </div>
          </div>
          )
        })()}
        <div className="ml-auto text-muted-foreground/50">
          {metric.entries.length} entr{metric.entries.length !== 1 ? "ies" : "y"}
        </div>
      </div>

      {/* Entries */}
      <div className="px-5 py-1">
        {hasEntries ? (
          metric.entries.slice(0, 5).map((entry) => (
            <EntryRow key={entry.id} entry={entry} unit={metric.unit} />
          ))
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground/50">
            No entries yet — click &ldquo;Log entry&rdquo; to record your first value.
          </p>
        )}
        {metric.entries.length > 5 && (
          <p className="py-2 text-center text-[11px] text-muted-foreground/50">
            +{metric.entries.length - 5} more entries
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function ProjectClient({
  project,
  atlassianSlot,
}: {
  project: Project
  atlassianSlot?: React.ReactNode
}) {
  return (
    <div className="min-h-full bg-background bg-noise">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight truncate">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {project.jiraUrl && (
                  <a
                    href={project.jiraUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Jira
                  </a>
                )}
                {project.confluenceUrl && (
                  <a
                    href={project.confluenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Confluence
                  </a>
                )}
                <span className="text-xs text-muted-foreground/40">
                  Registered{" "}
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {project.metrics.length > 0 && (
              <AddMetricDialog projectId={project.id}>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                  Add metric
                </Button>
              </AddMetricDialog>
            )}
          </div>
        </motion.div>
      </div>

      {/* Atlassian panels (streamed) */}
      {atlassianSlot && (
        <div className="px-8 pt-6">{atlassianSlot}</div>
      )}

      {/* Metrics section */}
      <div className="px-8 py-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-4"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-sm font-semibold">Value metrics</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {project.metrics.length === 0
                  ? "No metrics defined yet"
                  : `${project.metrics.length} metric${project.metrics.length !== 1 ? "s" : ""} tracked`}
              </p>
            </div>
          </motion.div>

          <Separator className="opacity-30" />

          {project.metrics.length === 0 ? (
            <EmptyMetrics projectId={project.id} />
          ) : (
            project.metrics.map((metric, i) => (
              <MetricCard key={metric.id} metric={metric} index={i} />
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
