import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { signOut } from "@/lib/auth"
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
  TrendingUp,
  LogOut,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: LayoutDashboard,
    active: true,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
    active: false,
    soon: true,
  },
  {
    href: "/dashboard",
    label: "Leadership",
    icon: BarChart3,
    active: false,
    soon: true,
  },
]

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
            <TrendingUp
              className="h-4 w-4 text-primary"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-sm font-semibold tracking-tight">PPVT</span>
        </div>

        <Separator className="opacity-50" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                  item.active
                    ? "nav-active font-medium"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    item.active ? "text-primary" : "text-current opacity-70"
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.soon && (
                  <Badge
                    variant="secondary"
                    className="h-4 rounded px-1 py-0 text-[10px] leading-4 opacity-60"
                  >
                    Soon
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

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
