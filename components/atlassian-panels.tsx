import Link from "next/link"
import {
  ExternalLink,
  GitBranch,
  FileText,
  CircleDot,
  CheckCircle2,
  Clock,
  Settings,
} from "lucide-react"
import { getProjectAtlassianData, getAtlassianConfig } from "@/lib/actions"
import type { JiraIssueData, ConfluencePageData } from "@/lib/atlassian"

/* ── Status chip ─────────────────────────────────────────────────────────── */

const statusCategoryStyle = {
  new: "text-muted-foreground bg-muted/60",
  indeterminate: "text-[var(--value-warning)] bg-[var(--value-warning)]/10",
  done: "text-[var(--value-positive)] bg-[var(--value-positive)]/10",
}

const statusCategoryIcon = {
  new: CircleDot,
  indeterminate: Clock,
  done: CheckCircle2,
}

function JiraStatusChip({ status, category }: { status: string; category: JiraIssueData["statusCategory"] }) {
  const Icon = statusCategoryIcon[category]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${statusCategoryStyle[category]}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  )
}

/* ── Jira panel ──────────────────────────────────────────────────────────── */

function JiraPanel({ data }: { data: JiraIssueData }) {
  const updatedDate = new Date(data.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Jira</span>
          <span className="font-metric text-xs text-muted-foreground/60">{data.key}</span>
        </div>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-sm font-medium text-foreground leading-snug">{data.summary}</p>

        <div className="flex flex-wrap items-center gap-2">
          <JiraStatusChip status={data.statusName} category={data.statusCategory} />
          {data.issueTypeName && (
            <span className="text-[11px] text-muted-foreground/60 bg-muted/40 rounded-md px-1.5 py-0.5">
              {data.issueTypeName}
            </span>
          )}
          {data.priorityName && (
            <span className="text-[11px] text-muted-foreground/60 bg-muted/40 rounded-md px-1.5 py-0.5">
              {data.priorityName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
          {data.assigneeDisplayName && (
            <div className="flex items-center gap-1.5">
              {data.assigneeAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.assigneeAvatarUrl}
                  alt={data.assigneeDisplayName}
                  className="h-4 w-4 rounded-full"
                />
              ) : (
                <div className="h-4 w-4 rounded-full bg-muted" />
              )}
              {data.assigneeDisplayName}
            </div>
          )}
          <span>Updated {updatedDate}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Confluence panel ────────────────────────────────────────────────────── */

function ConfluencePanel({ data }: { data: ConfluencePageData }) {
  const modifiedDate = data.lastModified
    ? new Date(data.lastModified).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Confluence</span>
          {data.spaceKey && (
            <span className="font-metric text-xs text-muted-foreground/60">{data.spaceKey}</span>
          )}
        </div>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </div>

      <div className="px-5 py-4 space-y-2">
        <p className="text-sm font-medium text-foreground">{data.title}</p>
        {data.spaceName && (
          <p className="text-xs text-muted-foreground/60">{data.spaceName}</p>
        )}
        {data.excerpt && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {data.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground/50 pt-1">
          {data.authorDisplayName && <span>By {data.authorDisplayName}</span>}
          {modifiedDate && <span>Updated {modifiedDate}</span>}
        </div>
      </div>
    </div>
  )
}

/* ── No config prompt ────────────────────────────────────────────────────── */

function NoConfigPrompt() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">Connect Atlassian</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Add your Atlassian credentials in Settings to pull live Jira and Confluence
          data into this page.
        </p>
      </div>
      <Link
        href="/settings"
        className="shrink-0 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
      >
        <Settings className="h-3.5 w-3.5" />
        Settings
      </Link>
    </div>
  )
}

/* ── Main export (async server component) ────────────────────────────────── */

export async function AtlassianPanels({ projectId }: { projectId: string }) {
  const config = await getAtlassianConfig()
  if (!config) return <NoConfigPrompt />

  const { jira, confluence } = await getProjectAtlassianData(projectId)

  if (!jira && !confluence) return null

  return (
    <div className="space-y-3">
      {jira && <JiraPanel data={jira} />}
      {confluence && <ConfluencePanel data={confluence} />}
    </div>
  )
}

/* ── Skeleton for Suspense fallback ──────────────────────────────────────── */

export function AtlassianPanelsSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3.5">
            <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted/40 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
