"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import {
  TrendingUp,
  FolderKanban,
  BarChart3,
  AlertCircle,
  CalendarClock,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Hash,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Separator } from "@/components/ui/separator"
import type { getDashboardData } from "@/lib/actions"

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

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

/* ── Formatters ──────────────────────────────────────────────────────────── */

function fmtValue(v: number, compact = false): string {
  if (compact) {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
    return `$${v.toFixed(0)}`
  }
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
}

function fmtDate(dateVal: Date | string): string {
  return new Date(dateVal).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

/* ── Stat card ───────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  index,
  href,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent: "primary" | "positive" | "warning" | "overdue" | "muted"
  index: number
  href?: string
}) {
  const accentCls = {
    primary: "bg-primary/10 text-primary",
    positive: "bg-[var(--value-positive)]/10 text-[var(--value-positive)]",
    warning: "bg-[var(--value-warning)]/10 text-[var(--value-warning)]",
    overdue: "bg-[var(--value-overdue)]/10 text-[var(--value-overdue)]",
    muted: "bg-muted text-muted-foreground",
  }[accent]

  const inner = (
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
          <div className={`rounded-lg p-2 ${accentCls}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
          {href && (
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 transition-all group-hover:text-muted-foreground/60" />
          )}
        </div>
        <div className="space-y-0.5">
          <p className="font-metric text-3xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground/50">{sub}</p>}
        </div>
      </div>
    </motion.div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}

/* ── Custom tooltip ──────────────────────────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (v: number) => fmtValue(v, true),
}: {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
  valueFormatter?: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          {valueFormatter(p.value)}
        </p>
      ))}
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

function EmptyDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-8 py-20 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative rounded-2xl border border-border bg-card p-5">
          <div className="rounded-xl bg-primary/10 p-3">
            <BarChart3 className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">No data yet</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Register projects, define metrics, and log entries to see portfolio
        visualizations here.
      </p>
      <Link
        href="/projects"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Go to Projects
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function DashboardClient({ data }: { data: DashboardData }) {
  const hasEntries = data.entryCount > 0

  const stats = [
    {
      label: "All-time value",
      value: data.totalAllTime > 0 ? fmtValue(data.totalAllTime, true) : "--",
      sub: "Across all projects",
      icon: TrendingUp,
      accent: "positive" as const,
    },
    {
      label: "YTD value",
      value: data.totalYtd > 0 ? fmtValue(data.totalYtd, true) : "--",
      sub: `${new Date().getFullYear()} realized`,
      icon: BarChart3,
      accent: "primary" as const,
    },
    {
      label: "Active projects",
      value: String(data.activeProjectCount),
      sub: `${data.metricCount} metric${data.metricCount !== 1 ? "s" : ""} defined`,
      icon: FolderKanban,
      accent: "muted" as const,
      href: "/projects",
    },
    {
      label: "Entries logged",
      value: String(data.entryCount),
      sub: "Total value records",
      icon: Hash,
      accent: "muted" as const,
    },
    {
      label: "Due this week",
      value: String(data.dueThisWeekCount),
      sub: "Check-ins",
      icon: CalendarClock,
      accent: "warning" as const,
    },
    {
      label: "Overdue",
      value: String(data.overdueCount),
      sub: "Check-ins",
      icon: AlertCircle,
      accent: "overdue" as const,
    },
  ]

  // Chart theme colours (matching CSS vars, hardcoded for recharts)
  const chartPrimary = "oklch(0.605 0.215 265)"
  const chartPositive = "oklch(0.72 0.165 155)"
  const chartColors = [
    "oklch(0.605 0.215 265)",
    "oklch(0.72 0.165 155)",
    "oklch(0.80 0.165 85)",
    "oklch(0.65 0.220 18)",
    "oklch(0.63 0.230 295)",
  ]

  const maxProjectValue = Math.max(...data.projectBreakdown.map((p) => p.value), 1)

  return (
    <div className="min-h-full bg-background bg-noise">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <h1 className="text-xl font-semibold tracking-tight">Leadership Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Portfolio value at a glance
          </p>
        </motion.div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Stats row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6"
        >
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </motion.div>

        <Separator className="opacity-30" />

        {!hasEntries ? (
          <EmptyDashboard />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-6"
          >
            {/* Trend chart */}
            <motion.div custom={0} variants={fadeUp} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold">Value trend</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Realized value logged per month — last 12 months
                  </p>
                </div>
                <span className="font-metric text-xs text-muted-foreground/60">
                  {fmtValue(data.totalYtd, true)} YTD
                </span>
              </div>
              <div className="px-2 py-4">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.monthlyTrend} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartPrimary} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={chartPrimary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="oklch(0.21 0.025 258)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "oklch(0.52 0.030 260)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "oklch(0.52 0.030 260)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmtValue(v, true)}
                      width={52}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartPrimary}
                      strokeWidth={2}
                      fill="url(#trendGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: chartPrimary, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Two columns: project breakdown + recent entries */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

              {/* Project breakdown */}
              <motion.div custom={1} variants={fadeUp} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold">Value by project</p>
                    <p className="text-xs text-muted-foreground mt-0.5">All-time totals</p>
                  </div>
                  <Link
                    href="/projects"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    All projects
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {data.projectBreakdown.length > 0 ? (
                  <div className="px-2 py-4">
                    <ResponsiveContainer width="100%" height={Math.max(180, data.projectBreakdown.length * 44)}>
                      <BarChart
                        data={data.projectBreakdown}
                        layout="vertical"
                        margin={{ top: 0, right: 48, bottom: 0, left: 8 }}
                        barSize={20}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="oklch(0.21 0.025 258)"
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10, fill: "oklch(0.52 0.030 260)" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => fmtValue(v, true)}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "oklch(0.85 0.015 258)" }}
                          axisLine={false}
                          tickLine={false}
                          width={130}
                          tickFormatter={(v: string) =>
                            v.length > 18 ? v.slice(0, 17) + "…" : v
                          }
                        />
                        <Tooltip
                          content={<ChartTooltip />}
                          cursor={{ fill: "oklch(0.18 0.030 260 / 0.5)" }}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                          {data.projectBreakdown.map((_, i) => (
                            <Cell
                              key={i}
                              fill={chartColors[i % chartColors.length]}
                              fillOpacity={0.85}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-xs text-muted-foreground/50">No entries logged yet.</p>
                  </div>
                )}

                {/* Unit breakdown chips */}
                {data.unitBreakdown.length > 0 && (
                  <div className="border-t border-border/60 px-5 py-3 flex flex-wrap gap-2">
                    {data.unitBreakdown.map((u) => (
                      <span
                        key={u.unit}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px]"
                      >
                        <span className="font-metric font-semibold text-foreground">
                          {u.value >= 1000
                            ? `${(u.value / 1000).toFixed(1)}K`
                            : u.value.toFixed(0)}
                        </span>
                        <span className="text-muted-foreground/60">{u.unit}</span>
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Recent entries */}
              <motion.div custom={2} variants={fadeUp} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Recent entries</p>
                </div>

                <div className="divide-y divide-border">
                  {data.recentEntries.map((entry) => (
                    <Link
                      key={entry.entryId}
                      href={`/projects/${entry.projectId}`}
                      className="group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {entry.metricName}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground/60">
                          {entry.projectName}
                        </p>
                        {entry.note && (
                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground/40">
                            {entry.note}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-metric text-xs font-semibold text-[var(--value-positive)]">
                          {entry.value >= 1000
                            ? `${(entry.value / 1000).toFixed(1)}K`
                            : entry.value.toFixed(0)}{" "}
                          {entry.unit}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50">
                          {fmtDate(entry.date)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Project progress bars */}
            {data.projectBreakdown.some((p) => p.value > 0) && (
              <motion.div custom={3} variants={fadeUp} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-5 py-3.5">
                  <p className="text-sm font-semibold">Portfolio share</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Each project's share of total realized value
                  </p>
                </div>
                <div className="px-5 py-4 space-y-3.5">
                  {data.projectBreakdown
                    .filter((p) => p.value > 0)
                    .map((p, i) => {
                      const pct = data.totalAllTime > 0
                        ? (p.value / data.totalAllTime) * 100
                        : 0
                      return (
                        <div key={p.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <Link
                              href={`/projects/${p.id}`}
                              className="text-xs font-medium text-foreground hover:text-primary transition-colors truncate max-w-[60%]"
                            >
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-metric text-xs text-muted-foreground/60">
                                {fmtValue(p.value, true)}
                              </span>
                              <span className="font-metric text-xs font-semibold text-foreground w-10 text-right">
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted/50">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: chartColors[i % chartColors.length],
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
