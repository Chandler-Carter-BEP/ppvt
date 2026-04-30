"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FolderKanban, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createProject } from "@/lib/actions"

const schema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
  jiraUrl: z.string().max(500).optional(),
  confluenceUrl: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

const inputCls =
  "h-8 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"

const labelCls = "block text-xs font-medium text-muted-foreground mb-1"

interface RegisterProjectDialogProps {
  children: React.ReactNode
}

export function RegisterProjectDialog({ children }: RegisterProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", jiraUrl: "", confluenceUrl: "" },
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset()
      setError(null)
    }
    setOpen(next)
  }

  function onSubmit(data: FormValues) {
    setError(null)
    startTransition(async () => {
      try {
        const id = await createProject(data)
        setOpen(false)
        router.push(`/projects/${id}`)
      } catch {
        setError("Something went wrong. Please try again.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="contents"
      >
        {children}
      </button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="rounded-lg bg-primary/10 p-2">
              <FolderKanban className="h-4 w-4 text-primary" strokeWidth={1.5} />
            </div>
            <DialogTitle>Register project</DialogTitle>
          </div>
          <DialogDescription>
            Add a handed-off project you want to track post-production value for.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className={labelCls}>
              Project name <span className="text-destructive">*</span>
            </label>
            <input
              {...form.register("name")}
              className={inputCls}
              placeholder="e.g. Procurement AI"
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-[11px] text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              {...form.register("description")}
              className="min-h-[64px] w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors resize-none"
              placeholder="Brief summary of what this project delivered"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Jira URL</label>
              <input
                {...form.register("jiraUrl")}
                className={inputCls}
                placeholder="https://…"
              />
            </div>
            <div>
              <label className={labelCls}>Confluence URL</label>
              <input
                {...form.register("confluenceUrl")}
                className={inputCls}
                placeholder="https://…"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? "Registering…" : "Register project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
