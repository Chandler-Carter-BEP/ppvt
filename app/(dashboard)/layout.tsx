import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { signOut } from "@/lib/auth"
import { Settings, TrendingUp, LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { NavLinks } from "@/components/nav-links"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userInitials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.slice(0, 2).toUpperCase() ?? "??"

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-4">
          <div className="rounded-md bg-primary/15 p-1.5">
            <TrendingUp className="h-4 w-4 text-primary" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight">PPVT</span>
        </div>

        <Separator className="opacity-50" />

        <NavLinks />

        <Separator className="opacity-50" />

        {/* User + sign out */}
        <div className="p-3 space-y-1">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {session.user.name ?? "PM"}
              </p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">
                {session.user.email}
              </p>
            </div>
          </div>

          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </form>

          <div className="px-3 pb-1">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 rounded-lg py-2 text-sm text-sidebar-foreground/50 transition-all hover:text-sidebar-foreground"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
