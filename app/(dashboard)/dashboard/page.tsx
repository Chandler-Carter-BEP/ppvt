import { Metadata } from "next"
import { getDashboardData } from "@/lib/actions"
import { DashboardClient } from "./dashboard-client"

export const metadata: Metadata = { title: "Leadership Dashboard" }

export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient data={data} />
}
