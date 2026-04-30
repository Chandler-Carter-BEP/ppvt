import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { HomeClient } from "./home-client"
import { getProjects, getPortfolioYtd } from "@/lib/actions"

export const metadata: Metadata = { title: "Home" }

export default async function HomePage() {
  const session = await auth()
  const userName = session?.user?.name?.split(" ")[0] ?? "there"

  const [projects, portfolioYtd] = await Promise.all([
    getProjects(),
    getPortfolioYtd(),
  ])

  return (
    <HomeClient
      userName={userName}
      projects={projects}
      portfolioYtd={portfolioYtd}
    />
  )
}
