"use client"

import { motion } from "framer-motion"
import {
  TrendingUp,
  FolderKanban,
  CalendarClock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

/* ── Animation helpers ───────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
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
      {/* Subtle gradient shimmer on hover */}
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

/* ── Empty projects list ─────────────────────────────────────────────────── */

function EmptyProjectsList() {
  return (
    <motion.div
      custom={4}
      variants={fadeUp}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-8 py-16 text-center"
    >
      <div className="relative mb-5">
        {/* Background glow */}
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative rounded-2xl border border-border bg-card p-5">
          <div className="rounded-xl bg-primary/10 p-3">
            <FolderKanban className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <h3 className="text-base font-semibold text-foreground">
        No projects yet
      </h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Register a handed-off project to start tracking its ongoing value.
        Jira and Confluence data will pull in automatically.
      </p>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Button size="sm" className="gap-2 font-medium" disabled>
          <Plus className="h-4 w-4" />
          Register project
          <Badge variant="secondary" className="ml-0.5 rounded px-1 py-0 text-[10px]">
            M2
          </Badge>
        </Button>
        <p className="text-xs text-muted-foreground">Coming in the next milestone</p>
      </div>
    </motion.div>
  )
}

/* ── Check-in preview panel ──────────────────────────────────────────────── */

function CheckInPreview() {
  const items = [
    {
      label: "Procurement AI — Cost savings",
      due: "Due today",
      status: "overdue",
    },
    {
      label: "Invoice OCR — Dev hours saved",
      due: "Due in 3 days",
      status: "due-soon",
    },
    {
      label: "Contract AI — Revenue impact",
      due: "Due in 8 days",
      status: "scheduled",
    },
  ]

  const statusConfig = {
    overdue: {
      dot: "bg-[var(--value-overdue)]",
      badge: "text-[var(--value-overdue)] bg-[var(--value-overdue)]/10",
    },
    "due-soon": {
      dot: "bg-[var(--value-warning)]",
      badge: "text-[var(--value-warning)] bg-[var(--value-warning)]/10",
    },
    scheduled: {
      dot: "bg-muted-foreground/30",
      badge: "text-muted-foreground bg-muted/50",
    },
  }

  return (
    <motion.div
      custom={5}
      variants={fadeUp}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Upcoming check-ins</span>
        </div>
        <Badge variant="secondary" className="rounded px-1.5 text-[10px]">
          Preview
        </Badge>
      </div>

      <div className="divide-y divide-border">
        {items.map((item) => {
          const config = statusConfig[item.status as keyof typeof statusConfig]
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 px-5 py-3 opacity-40"
            >
              <span
                className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {item.label}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${config.badge}`}
              >
                {item.due}
              </span>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border px-5 py-3">
        <p className="text-[11px] text-muted-foreground/50">
          Check-ins appear here once you register projects and define metrics.
        </p>
      </div>
    </motion.div>
  )
}

/* ── Getting started checklist ───────────────────────────────────────────── */

function GettingStarted() {
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
      done: false,
      milestone: "M2",
    },
    {
      icon: TrendingUp,
      label: "Define value metrics",
      desc: "Name the metrics you're tracking — revenue, cost savings, time saved.",
      done: false,
      milestone: "M2",
    },
    {
      icon: Clock,
      label: "Log your first entry",
      desc: "Record a realized value with evidence. Set a check-in cadence.",
      done: false,
      milestone: "M2",
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

export function HomeClient({ userName }: { userName: string }) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const stats = [
    {
      label: "Portfolio YTD",
      value: "--",
      sub: "No entries yet",
      icon: TrendingUp,
      accent: "positive" as const,
    },
    {
      label: "Active projects",
      value: "0",
      sub: "Register your first",
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
        {/* Stat cards row */}
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

        {/* Two-column layout: projects list + right panel */}
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
              <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" disabled>
                <Plus className="h-3.5 w-3.5" />
                Register project
              </Button>
            </motion.div>

            <EmptyProjectsList />
          </div>

          {/* Right: check-ins + getting started */}
          <div className="space-y-4">
            <CheckInPreview />
            <GettingStarted />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
