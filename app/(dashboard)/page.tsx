import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { HomeClient } from "./home-client"

export const metadata: Metadata = { title: "Home" }

export default async function HomePage() {
  const session = await auth()
  const userName = session?.user?.name?.split(" ")[0] ?? "there"
  return <HomeClient userName={userName} />
}
