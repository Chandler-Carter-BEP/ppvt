import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const proxy = auth((req: NextRequest & { auth: unknown }) => {
  const isAuthenticated = !!(req as { auth?: unknown }).auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login")

  if (!isAuthenticated && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
}
