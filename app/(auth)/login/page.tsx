"use client"

import { signIn } from "next-auth/react"
import { useActionState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Loader2, TrendingUp } from "lucide-react"

const schema = z.object({ email: z.email("Please enter a valid email.") })

type State = { error?: string; email?: string } | undefined

async function requestMagicLink(
  _prev: State,
  formData: FormData
): Promise<State> {
  const parsed = schema.safeParse({ email: formData.get("email") })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }
  await signIn("resend", {
    email: parsed.data.email,
    redirect: false,
    callbackUrl: "/",
  })
  return { email: parsed.data.email }
}

export default function LoginPage() {
  const [state, action, isPending] = useActionState(requestMagicLink, undefined)

  if (state?.email) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="rounded-xl bg-primary/10 p-3">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Check your inbox</h2>
          <p className="text-sm text-muted-foreground">
            A sign-in link was sent to{" "}
            <span className="font-medium text-foreground">{state.email}</span>.
            Click the link to continue.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Link expires in 24 hours. No account needed — one will be created on
          first sign-in.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Logo */}
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <div className="rounded-lg bg-primary/15 p-2">
            <TrendingUp className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight">PPVT</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll email you a magic link — no password required.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/20">
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@buyersedge.com"
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {state?.error && (
              <p className="text-xs text-destructive">{state.error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full gap-2 font-medium"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isPending ? "Sending link…" : "Send magic link"}
          </Button>
        </form>
      </div>

      <Separator className="opacity-30" />

      <p className="text-center text-xs text-muted-foreground">
        Internal tool — Buyers Edge AI team only.
      </p>
    </div>
  )
}
