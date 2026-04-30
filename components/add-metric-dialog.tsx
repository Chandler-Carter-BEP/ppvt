"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { TrendingUp, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createMetric } from "@/lib/actions"

const CADENCE_OPTIONS = [
  { label: "None", value: "" },
  { label: "Weekly", value: "7" },
  { label: "Bi-weekly", value: "14" },
  { label: "Monthly", value: "30" },
  { label: "Quarterly", value: "90" },
]

const schema = z.object({
  name: z.string().min(1, "Metric name is required").max(100),
  unit: z.string().min(1, "Unit is required").max(20),
  target: z.string().max(50).optional(),
  checkInCadenceDays: z.string().optional(),
  description: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

const inputCls =
  "h-8 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"

const labelCls = "block text-xs font-medium text-muted-foreground mb-1"

interface AddMetricDialogProps {
  projectId: string
  children: React.ReactNode
}

export function AddMetricDialog({ projectId, children }: AddMetricDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", unit: "", target: "", checkInCadenceDays: "", description: "" },
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
        await createMetric({
          projectId,
          name: data.name,
          unit: data.unit,
          target: data.target || undefined,
          checkInCadenceDays: data.checkInCadenceDays
            ? Number(data.checkInCadenceDays)
            : undefined,
          description: data.description || undefined,
        })
        setOpen(false)
        router.refresh()
      } catch {
        setError("Something went wrong. Please try again.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {children}
      </button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.5} />
            </div>
            <DialogTitle>Add metric</DialogTitle>
          </div>
          <DialogDescription>
            Define a value metric to track for this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div>
              <label className={labelCls}>
                Metric name <span className="text-destructive">*</span>
              </label>
              <input
                {...form.register("name")}
                className={inputCls}
                placeholder="e.g. Cost savings"
                autoFocus
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-[11px] text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>
                Unit <span className="text-destructive">*</span>
              </label>
              <input
                {...form.register("unit")}
                className={inputCls}
                placeholder="$, hrs, %"
              />
              {form.formState.errors.unit && (
                <p className="mt-1 text-[11px] text-destructive">
                  {form.formState.errors.unit.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Target (optional)</label>
              <input
                {...form.register("target")}
                className={inputCls}
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <label className={labelCls}>Check-in cadence</label>
              <select
                {...form.register("checkInCadenceDays")}
                className="h-8 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"
              >
                {CADENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              {...form.register("description")}
              className="min-h-[56px] w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors resize-none"
              placeholder="What does this metric measure?"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? "Adding…" : "Add metric"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
