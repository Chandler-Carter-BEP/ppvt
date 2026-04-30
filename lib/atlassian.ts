// Atlassian REST API helpers — Basic auth (email + API token)

export interface JiraIssueData {
  key: string
  summary: string
  statusName: string
  statusCategory: "new" | "indeterminate" | "done"
  issueTypeName: string
  assigneeDisplayName: string | null
  assigneeAvatarUrl: string | null
  priorityName: string | null
  updatedAt: string
  url: string
}

export interface ConfluencePageData {
  id: string
  title: string
  spaceName: string
  spaceKey: string
  authorDisplayName: string | null
  lastModified: string
  url: string
  excerpt: string | null
}

// ── URL parsers ───────────────────────────────────────────────────────────────

export function parseJiraKey(url: string): string | null {
  // /browse/PROJ-123
  const browseMatch = url.match(/\/browse\/([A-Z][A-Z0-9_]+-\d+)/i)
  if (browseMatch) return browseMatch[1].toUpperCase()

  // selectedIssue=PROJ-123 (board/backlog URLs)
  const qsMatch = url.match(/[?&]selectedIssue=([A-Z][A-Z0-9_]+-\d+)/i)
  if (qsMatch) return qsMatch[1].toUpperCase()

  // /issues/PROJ-123 or /issue/PROJ-123
  const issuePathMatch = url.match(/\/issues?\/([A-Z][A-Z0-9_]+-\d+)/i)
  if (issuePathMatch) return issuePathMatch[1].toUpperCase()

  // bare issue key (user pasted just the key)
  const bareKey = url.match(/^([A-Z][A-Z0-9_]+-\d+)$/i)
  if (bareKey) return bareKey[1].toUpperCase()

  return null
}

export function parseConfluencePageId(url: string): string | null {
  // /wiki/spaces/SPACE/pages/123456789/...
  const match = url.match(/\/pages\/(\d+)/)
  return match ? match[1] : null
}

// ── API client ────────────────────────────────────────────────────────────────

function basicAuth(email: string, token: string): string {
  return "Basic " + Buffer.from(`${email}:${token}`).toString("base64")
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "")
}

export async function fetchJiraIssue(
  baseUrl: string,
  email: string,
  token: string,
  issueUrl: string
): Promise<JiraIssueData | null> {
  const key = parseJiraKey(issueUrl)
  if (!key) return null

  const base = stripTrailingSlash(baseUrl)
  const endpoint = `${base}/rest/api/3/issue/${key}?fields=summary,status,assignee,priority,issuetype,updated`

  let res: Response
  try {
    res = await fetch(endpoint, {
      headers: {
        Authorization: basicAuth(email, token),
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    })
  } catch {
    return null
  }

  if (!res.ok) return null

  const data = await res.json()
  const fields = data.fields

  const catKey: string = fields.status?.statusCategory?.key ?? "new"
  const statusCategory: JiraIssueData["statusCategory"] =
    catKey === "done" ? "done" : catKey === "indeterminate" ? "indeterminate" : "new"

  return {
    key: data.key,
    summary: fields.summary ?? "(no summary)",
    statusName: fields.status?.name ?? "Unknown",
    statusCategory,
    issueTypeName: fields.issuetype?.name ?? "Issue",
    assigneeDisplayName: fields.assignee?.displayName ?? null,
    assigneeAvatarUrl: fields.assignee?.avatarUrls?.["24x24"] ?? null,
    priorityName: fields.priority?.name ?? null,
    updatedAt: fields.updated,
    url: `${base}/browse/${data.key}`,
  }
}

export async function fetchConfluencePage(
  baseUrl: string,
  email: string,
  token: string,
  pageUrl: string
): Promise<ConfluencePageData | null> {
  const pageId = parseConfluencePageId(pageUrl)
  if (!pageId) return null

  const base = stripTrailingSlash(baseUrl)
  const endpoint = `${base}/wiki/api/v2/pages/${pageId}?body-format=atlas_doc_format&version=true&space-id=true`

  let res: Response
  try {
    res = await fetch(endpoint, {
      headers: {
        Authorization: basicAuth(email, token),
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    })
  } catch {
    return null
  }

  if (!res.ok) {
    // fall back to v1 API which is more permissive
    return fetchConfluencePageV1(base, email, token, pageId)
  }

  const data = await res.json()

  // Also fetch space name
  const spaceId = data.spaceId
  let spaceName = ""
  let spaceKey = ""
  if (spaceId) {
    try {
      const spaceRes = await fetch(`${base}/wiki/api/v2/spaces/${spaceId}`, {
        headers: { Authorization: basicAuth(email, token), Accept: "application/json" },
        next: { revalidate: 3600 },
      })
      if (spaceRes.ok) {
        const spaceData = await spaceRes.json()
        spaceName = spaceData.name ?? ""
        spaceKey = spaceData.key ?? ""
      }
    } catch {}
  }

  return {
    id: String(data.id),
    title: data.title ?? "(untitled)",
    spaceName,
    spaceKey,
    authorDisplayName: data.version?.authorId ?? null,
    lastModified: data.version?.createdAt ?? data.updatedAt ?? "",
    url: `${base}/wiki${data._links?.webui ?? `/spaces/${spaceKey}/pages/${pageId}`}`,
    excerpt: null,
  }
}

async function fetchConfluencePageV1(
  base: string,
  email: string,
  token: string,
  pageId: string
): Promise<ConfluencePageData | null> {
  let res: Response
  try {
    res = await fetch(
      `${base}/wiki/rest/api/content/${pageId}?expand=version,space,body.view`,
      {
        headers: { Authorization: basicAuth(email, token), Accept: "application/json" },
        next: { revalidate: 300 },
      }
    )
  } catch {
    return null
  }

  if (!res.ok) return null

  const data = await res.json()
  const excerpt = data.body?.view?.value
    ? stripHtml(data.body.view.value).slice(0, 200).trim()
    : null

  return {
    id: String(data.id),
    title: data.title ?? "(untitled)",
    spaceName: data.space?.name ?? "",
    spaceKey: data.space?.key ?? "",
    authorDisplayName: data.version?.by?.displayName ?? null,
    lastModified: data.version?.when ?? "",
    url: `${base}/wiki${data._links?.webui ?? ""}`,
    excerpt: excerpt || null,
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")
}

export async function testAtlassianConnection(
  baseUrl: string,
  email: string,
  token: string
): Promise<{ ok: boolean; displayName?: string; error?: string }> {
  const base = stripTrailingSlash(baseUrl)
  try {
    const res = await fetch(`${base}/rest/api/3/myself`, {
      headers: { Authorization: basicAuth(email, token), Accept: "application/json" },
    })
    if (!res.ok) {
      return { ok: false, error: `Auth failed (${res.status})` }
    }
    const data = await res.json()
    return { ok: true, displayName: data.displayName }
  } catch (e) {
    return { ok: false, error: "Could not reach Atlassian. Check the base URL." }
  }
}
