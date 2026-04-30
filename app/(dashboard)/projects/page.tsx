import { Metadata } from "next"
import { getProjects } from "@/lib/actions"
import { ProjectsClient } from "./projects-client"

export const metadata: Metadata = { title: "Projects" }

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectsClient projects={projects} />
}
