"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import {
  FolderKanban,
  Plus,
  ArrowUpRight,
  ExternalLink,
  TrendingUp,
  CalendarClock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RegisterProjectDialog } from "@/components/register-project-dialog"
import { buildCheckInItems, getDaysLabel } from "@/lib/check-ins"
import type { getProjects } from "@/lib/actions"

type Projects = Awaited<ReturnType<typeof getProjects>>

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: EASE },
  }),
}

const statusBadge = {
  overdue: "text-[var(--value-overdue)] bg-[var(--value-overdue)]/10",
  "due-today": "text-[var(--value-overdue)] bg-[var(--value-overdue)]/10",
  "due-soon": "text-[var(--value-warning)] bg-[var(--value-warning)]/10",
  scheduled: "text-muted-foreground bg-muted/50",
}

function ProjectRow({ project, index }: { project: Projects[number]; index: number }) {
  const checkIns = buildCheckInItems([project])
  const nextCheckIn = checkIns[0] ?? null

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <Link
        href={`/projects/${project.id}`}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-all hover:border-border/80 hover:shadow-md hover:shadow-black/20"
      >
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FolderKanban className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>

        {/* Name + description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{project.name}</p>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-all group-hover:text-muted-foreground/60" />
          </div>
          {project.description ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{project.description}</p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground/40">No description</p>
          )}
        </div>

        {/* Metric count */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground/60 shrink-0 w-24">
          <TrendingUp className="h-3.5 w-3.5" />
          {project.metricCount} metric{project.metricCount !== 1 ? "s" : ""}
        </div>

        {/* Next check-in */}
        <div className="hidden md:block shrink-0 w-36">
          {nextCheckIn ? (
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${statusBadge[nextCheckIn.status]}`}
              >
                {getDaysLabel(nextCheckIn.status, nextCheckIn.daysUntilDue)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/30">No cadence set</span>
          )}
        </div>

        {/* External links */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {project.jiraUrl && (
            <span
              onClick={(e) => { e.preventDefault(); window.open(project.jiraUrl!, "_blank") }}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-border/80 transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Jira
            </span>
          )}
          {project.confluenceUrl && (
            <span
              onClick={(e) => { e.preventDefault(); window.open(project.confluenceUrl!, "_blank") }}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-border/80 transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Confluence
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function EmptyState() {
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
            <FolderKanban className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">No projects yet</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Register your first project to start tracking post-production value.
      </p>
      <div className="mt-6">
        <RegisterProjectDialog>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Register project
          </Button>
        </RegisterProjectDialog>
      </div>
    </motion.div>
  )
}

export function ProjectsClient({ projects }: { projects: Projects }) {
  const overdueCount = projects.reduce((acc, p) => {
    const items = buildCheckInItems([p])
    return acc + items.filter((i) => i.status === "overdue").length
  }, 0)

  return (
    <div className="min-h-full bg-background bg-noise">
      <div className="border-b border-border/50 px-8 py-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {projects.length === 0
                ? "No active projects"
                : `${projects.length} active project${projects.length !== 1 ? "s" : ""}${
                    overdueCount > 0
                      ? ` · ${overdueCount} overdue check-in${overdueCount !== 1 ? "s" : ""}`
                      : ""
                  }`}
            </p>
          </div>
          <RegisterProjectDialog>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Register project
            </Button>
          </RegisterProjectDialog>
        </motion.div>
      </div>

      <div className="px-8 py-6">
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {/* Column headers */}
            <div className="hidden md:flex items-center gap-4 px-5 pb-1 text-[11px] font-medium text-muted-foreground/50">
              <div className="w-10 shrink-0" />
              <div className="flex-1">Project</div>
              <div className="w-24 hidden sm:block">Metrics</div>
              <div className="w-36">Next check-in</div>
              <div className="hidden lg:block w-32">Links</div>
            </div>
            {projects.map((project, i) => (
              <ProjectRow key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
