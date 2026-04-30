"use client"

import { motion, type Variants } from "framer-motion"
import {
  TrendingUp,
  FolderKanban,
  CalendarClock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RegisterProjectDialog } from "@/components/register-project-dialog"
import type { getProjects } from "@/lib/actions"

type Projects = Awaited<ReturnType<typeof getProjects>>

/* ── Animation helpers ───────────────────────────────────────────────────── */

const EASE_EXPO_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: EASE_EXPO_OUT },
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

/* ── Stat card ───────────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent?: "primary" | "positive" | "warning" | "overdue"
  index: number
}

const accentClasses = {
  primary: "bg-primary/10 text-primary",
  positive: "bg-[var(--value-positive)]/10 text-[var(--value-positive)]",
  warning: "bg-[var(--value-warning)]/10 text-[var(--value-warning)]",
  overdue: "bg-[var(--value-overdue)]/10 text-[var(--value-overdue)]",
}

function StatCard({ label, value, sub, icon: Icon, accent = "primary", index }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-2 ${accentClasses[accent]}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 transition-all group-hover:text-muted-foreground/60" />
        </div>
        <div className="space-y-0.5">
          <p className="font-metric text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground/50">{sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Project card ────────────────────────────────────────────────────────── */

function ProjectCard({ project, index }: { project: Projects[number]; index: number }) {
  return (
    <motion.div custom={index + 4} variants={fadeUp}>
      <Link
        href={`/projects/${project.id}`}
        className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:shadow-md hover:shadow-black/20"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FolderKanban className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {project.name}
            </p>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-all group-hover:text-muted-foreground/60" />
          </div>
          {project.description && (
            <p className="truncate text-xs text-muted-foreground">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-3 pt-0.5">
            <span className="text-[11px] text-muted-foreground/60">
              {project.metricCount} metric{project.metricCount !== 1 ? "s" : ""}
            </span>
            {project.jiraUrl && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/40">
                <ExternalLink className="h-2.5 w-2.5" />
                Jira
              </span>
            )}
            {project.confluenceUrl && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/40">
                <ExternalLink className="h-2.5 w-2.5" />
                Confluence
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Empty projects list ─────────────────────────────────────────────────── */

function EmptyProjectsList() {
  return (
    <motion.div
      custom={4}
      variants={fadeUp}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-8 py-16 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative rounded-2xl border border-border bg-card p-5">
          <div className="rounded-xl bg-primary/10 p-3">
            <FolderKanban className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground">No projects yet</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Register a handed-off project to start tracking its ongoing value. Jira and
        Confluence data will pull in automatically.
      </p>
    </motion.div>
  )
}

/* ── Getting started checklist ───────────────────────────────────────────── */

function GettingStarted({ hasProjects }: { hasProjects: boolean }) {
  const steps = [
    {
      icon: CheckCircle2,
      label: "Sign in",
      desc: "You're in.",
      done: true,
    },
    {
      icon: FolderKanban,
      label: "Register a project",
      desc: "Add a handed-off project, link its Jira issue and Confluence charter.",
      done: hasProjects,
    },
    {
      icon: TrendingUp,
      label: "Define value metrics",
      desc: "Name the metrics you're tracking — revenue, cost savings, time saved.",
      done: false,
    },
    {
      icon: Clock,
      label: "Log your first entry",
      desc: "Record a realized value with evidence. Set a check-in cadence.",
      done: false,
    },
    {
      icon: Sparkles,
      label: "View the leadership dashboard",
      desc: "See portfolio-level value visualization with drill-down.",
      done: false,
      milestone: "M5",
    },
  ]

  return (
    <motion.div
      custom={6}
      variants={fadeUp}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Getting started</span>
      </div>

      <div className="divide-y divide-border">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div key={i} className="flex items-start gap-3.5 px-5 py-3.5">
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  step.done
                    ? "border-[var(--value-positive)]/40 bg-[var(--value-positive)]/10"
                    : "border-border bg-muted/30"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    step.done
                      ? "text-[var(--value-positive)]"
                      : "text-muted-foreground/40"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium ${
                      step.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.milestone && (
                    <Badge
                      variant="secondary"
                      className="rounded px-1 py-0 text-[10px] opacity-50"
                    >
                      {step.milestone}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground/60">
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

interface HomeClientProps {
  userName: string
  projects: Projects
  portfolioYtd: number
}

function formatYtd(value: number): string {
  if (value === 0) return "--"
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

export function HomeClient({ userName, projects, portfolioYtd }: HomeClientProps) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const stats = [
    {
      label: "Portfolio YTD",
      value: formatYtd(portfolioYtd),
      sub: portfolioYtd === 0 ? "No entries yet" : "Realized value this year",
      icon: TrendingUp,
      accent: "positive" as const,
    },
    {
      label: "Active projects",
      value: String(projects.length),
      sub: projects.length === 0 ? "Register your first" : `${projects.length} tracked`,
      icon: FolderKanban,
      accent: "primary" as const,
    },
    {
      label: "Due this week",
      value: "0",
      sub: "Check-ins",
      icon: CalendarClock,
      accent: "warning" as const,
    },
    {
      label: "Overdue",
      value: "0",
      sub: "Check-ins",
      icon: AlertCircle,
      accent: "overdue" as const,
    },
  ]

  return (
    <div className="min-h-full bg-background bg-noise">
      {/* Page header */}
      <div className="border-b border-border/50 px-8 py-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your value tracking workspace
          </p>
        </motion.div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Stat cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} />
          ))}
        </motion.div>

        <Separator className="opacity-30" />

        {/* Two-column layout */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]"
        >
          {/* Left: projects */}
          <div className="space-y-4">
            <motion.div
              custom={3}
              variants={fadeUp}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-sm font-semibold">My projects</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Handed-off projects you're tracking
                </p>
              </div>
              <RegisterProjectDialog>
                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Register project
                </Button>
              </RegisterProjectDialog>
            </motion.div>

            {projects.length === 0 ? (
              <EmptyProjectsList />
            ) : (
              <div className="space-y-2">
                {projects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Right: getting started */}
          <div className="space-y-4">
            <GettingStarted hasProjects={projects.length > 0} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
