import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { HomeClient } from "./home-client"
import { getProjects, getPortfolioYtd, getCheckInSummary } from "@/lib/actions"

export const metadata: Metadata = { title: "Home" }

export default async function HomePage() {
  const session = await auth()
  const userName = session?.user?.name?.split(" ")[0] ?? "there"

  const [projects, portfolioYtd, checkIns] = await Promise.all([
    getProjects(),
    getPortfolioYtd(),
    getCheckInSummary(),
  ])

  return (
    <HomeClient
      userName={userName}
      projects={projects}
      portfolioYtd={portfolioYtd}
      checkIns={checkIns}
    />
  )
}
