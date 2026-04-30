"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createEntry } from "@/lib/actions"

const schema = z.object({
  value: z.string().min(1, "Value is required"),
  date: z.string().min(1, "Date is required"),
  note: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

const inputCls =
  "h-8 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors"

const labelCls = "block text-xs font-medium text-muted-foreground mb-1"

interface LogEntryDialogProps {
  metricId: string
  metricName: string
  unit: string
  children: React.ReactNode
}

export function LogEntryDialog({
  metricId,
  metricName,
  unit,
  children,
}: LogEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const todayIso = new Date().toISOString().slice(0, 10)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { value: "", date: todayIso, note: "" },
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset({ value: "", date: todayIso, note: "" })
      setError(null)
    }
    setOpen(next)
  }

  function onSubmit(data: FormValues) {
    const numVal = parseFloat(data.value)
    if (isNaN(numVal)) {
      form.setError("value", { message: "Must be a valid number" })
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        await createEntry({
          metricId,
          value: numVal,
          date: data.date,
          note: data.note || undefined,
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

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="rounded-lg bg-[var(--value-positive)]/10 p-2">
              <PlusCircle className="h-4 w-4 text-[var(--value-positive)]" strokeWidth={1.5} />
            </div>
            <DialogTitle>Log entry</DialogTitle>
          </div>
          <DialogDescription>
            Record a realized value for{" "}
            <span className="font-medium text-foreground">{metricName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <div>
              <label className={labelCls}>
                Value ({unit}) <span className="text-destructive">*</span>
              </label>
              <input
                {...form.register("value")}
                className={inputCls}
                placeholder="0"
                inputMode="decimal"
                autoFocus
              />
              {form.formState.errors.value && (
                <p className="mt-1 text-[11px] text-destructive">
                  {form.formState.errors.value.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>
                Date <span className="text-destructive">*</span>
              </label>
              <input
                {...form.register("date")}
                type="date"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Evidence / note</label>
            <textarea
              {...form.register("note")}
              className="min-h-[72px] w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-colors resize-none"
              placeholder="Source, calculation method, or supporting context"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? "Logging…" : "Log entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
