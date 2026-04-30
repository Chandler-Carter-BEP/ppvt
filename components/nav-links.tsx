"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard", label: "Leadership", icon: BarChart3, soon: true },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
              active
                ? "nav-active font-medium"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                active ? "text-primary" : "text-current opacity-70"
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
  )
}
