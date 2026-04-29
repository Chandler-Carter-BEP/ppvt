import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthRoute = nextUrl.pathname.startsWith("/login")
      if (!isLoggedIn && !isAuthRoute) return false
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
