"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import {
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  KeyRound,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { saveAtlassianConfig, testAtlassianConfigConnection } from "@/lib/actions"

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const schema = z.object({
  baseUrl: z.string().min(1, "Required").max(200),
  accountEmail: z.string().email("Must be a valid email"),
  apiToken: z.string().min(1, "Required"),
})

type FormValues = z.infer<typeof schema>

const inputCls =
  "h-8 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"

const labelCls = "block text-xs font-medium text-muted-foreground mb-1"

interface SettingsClientProps {
  user: { name: string | null; email: string | null }
  atlassianConfig: {
    baseUrl: string
    accountEmail: string
    hasToken: boolean
    updatedAt: Date
  } | null
}

export function SettingsClient({ user, atlassianConfig }: SettingsClientProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle")
  const [testStatus, setTestStatus] = useState<{
    state: "idle" | "testing" | "ok" | "fail"
    message?: string
  }>({ state: "idle" })
  const [isSaving, startSave] = useTransition()
  const [isTesting, startTest] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      baseUrl: atlassianConfig?.baseUrl ?? "",
      accountEmail: atlassianConfig?.accountEmail ?? "",
      apiToken: "",
    },
  })

  function onSave(data: FormValues) {
    setSaveStatus("idle")
    startSave(async () => {
      try {
        await saveAtlassianConfig(data)
        setSaveStatus("saved")
        form.setValue("apiToken", "")
      } catch {
        setSaveStatus("error")
      }
    })
  }

  function onTest() {
    setTestStatus({ state: "testing" })
    startTest(async () => {
      try {
        const result = await testAtlassianConfigConnection()
        if (result.ok) {
          setTestStatus({
            state: "ok",
            message: result.displayName ? `Connected as ${result.displayName}` : "Connection successful",
          })
        } else {
          setTestStatus({ state: "fail", message: result.error })
        }
      } catch {
        setTestStatus({ state: "fail", message: "Something went wrong." })
      }
    })
  }

  return (
    <div className="min-h-full bg-background bg-noise">
      {/* Header */}
      <div className="border-b border-border/50 px-8 py-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your profile and integrations
          </p>
        </motion.div>
      </div>

      <div className="px-8 py-6 max-w-2xl space-y-8">

        {/* Profile section */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Profile</h2>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={labelCls}>Name</p>
                <p className="text-sm text-foreground">{user.name ?? "—"}</p>
              </div>
              <div>
                <p className={labelCls}>Email</p>
                <p className="text-sm text-foreground">{user.email ?? "—"}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/50">
              Profile is managed via your Auth.js magic-link provider.
            </p>
          </div>
        </motion.section>

        <Separator className="opacity-30" />

        {/* Atlassian section */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Atlassian integration</h2>
            </div>
            {atlassianConfig && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-md text-[11px] text-[var(--value-positive)] bg-[var(--value-positive)]/10"
              >
                <CheckCircle2 className="h-3 w-3" />
                Configured
              </Badge>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your Atlassian base URL and an API token to pull live Jira and
              Confluence data into your project pages. Your token is stored server-side
              and never exposed to the browser.{" "}
              <a
                href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                How to create a token
                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
              </a>
            </p>

            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
              <div>
                <label className={labelCls}>
                  Atlassian base URL <span className="text-destructive">*</span>
                </label>
                <input
                  {...form.register("baseUrl")}
                  className={inputCls}
                  placeholder="https://your-org.atlassian.net"
                />
                {form.formState.errors.baseUrl && (
                  <p className="mt-1 text-[11px] text-destructive">
                    {form.formState.errors.baseUrl.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Account email <span className="text-destructive">*</span>
                  </label>
                  <input
                    {...form.register("accountEmail")}
                    className={inputCls}
                    placeholder="you@company.com"
                    type="email"
                  />
                  {form.formState.errors.accountEmail && (
                    <p className="mt-1 text-[11px] text-destructive">
                      {form.formState.errors.accountEmail.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>
                    API token{" "}
                    {atlassianConfig?.hasToken && (
                      <span className="text-muted-foreground/50 font-normal">(leave blank to keep current)</span>
                    )}
                    {!atlassianConfig && <span className="text-destructive">*</span>}
                  </label>
                  <input
                    {...form.register("apiToken")}
                    className={inputCls}
                    type="password"
                    placeholder={atlassianConfig?.hasToken ? "••••••••" : "Paste token here"}
                    autoComplete="off"
                  />
                  {form.formState.errors.apiToken && (
                    <p className="mt-1 text-[11px] text-destructive">
                      {form.formState.errors.apiToken.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Status feedback */}
              {saveStatus === "saved" && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--value-positive)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved successfully
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Failed to save. Please try again.
                </div>
              )}
              {testStatus.state === "ok" && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--value-positive)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {testStatus.message}
                </div>
              )}
              {testStatus.state === "fail" && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {testStatus.message}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button type="submit" size="sm" disabled={isSaving} className="gap-1.5">
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isSaving ? "Saving…" : "Save"}
                </Button>
                {atlassianConfig && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isTesting}
                    onClick={onTest}
                    className="gap-1.5"
                  >
                    {isTesting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {isTesting ? "Testing…" : "Test connection"}
                  </Button>
                )}
              </div>
            </form>

            {atlassianConfig && (
              <p className="text-[11px] text-muted-foreground/40 border-t border-border pt-3">
                Last updated{" "}
                {new Date(atlassianConfig.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </motion.section>

      </div>
    </div>
  )
}
