import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { getAtlassianConfig } from "@/lib/actions"
import { SettingsClient } from "./settings-client"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const [session, atlassianConfig] = await Promise.all([
    auth(),
    getAtlassianConfig(),
  ])

  return (
    <SettingsClient
      user={{
        name: session?.user?.name ?? null,
        email: session?.user?.email ?? null,
      }}
      atlassianConfig={atlassianConfig}
    />
  )
}
