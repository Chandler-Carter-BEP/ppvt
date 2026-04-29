import { Mail, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function VerifyPage() {
  return (
    <div className="w-full max-w-sm space-y-8 text-center">
      <div className="flex items-center justify-center gap-2.5">
        <div className="rounded-lg bg-primary/15 p-2">
          <TrendingUp className="h-5 w-5 text-primary" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-semibold tracking-tight">PPVT</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-lg shadow-black/20">
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              A sign-in link is on its way. Click it to access your workspace.
            </p>
          </div>
          <ul className="space-y-1.5 rounded-lg bg-muted/50 px-4 py-3 text-left text-xs text-muted-foreground">
            <li>• Link expires in 24 hours</li>
            <li>• Check your spam folder if it doesn&apos;t arrive</li>
            <li>• You can only use the link once</li>
          </ul>
        </div>
      </div>

      <Link
        href="/login"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
      >
        ← Use a different email
      </Link>
    </div>
  )
}
