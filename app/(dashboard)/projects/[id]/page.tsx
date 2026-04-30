import { Suspense } from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProjectDetail } from "@/lib/actions"
import { ProjectClient } from "./project-client"
import {
  AtlassianPanels,
  AtlassianPanelsSkeleton,
} from "@/components/atlassian-panels"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const project = await getProjectDetail(id)
  return { title: project?.name ?? "Project" }
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const project = await getProjectDetail(id)
  if (!project) notFound()

  const hasLinks = !!(project.jiraUrl || project.confluenceUrl)

  return (
    <ProjectClient
      project={project}
      atlassianSlot={
        hasLinks ? (
          <Suspense fallback={<AtlassianPanelsSkeleton />}>
            <AtlassianPanels projectId={id} />
          </Suspense>
        ) : null
      }
    />
  )
}
