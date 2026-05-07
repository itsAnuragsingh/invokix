// app/(dashboard)/settings/api-keys/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getCliTokensByUserId } from "@/lib/db/queries/cli"
import { ApiKeysManager } from "@/components/settings/ApiKeysManager"
import { KeyIcon, TerminalIcon } from "@phosphor-icons/react/dist/ssr"

export default async function ApiKeysPage() {
  const session = await requireSession()
  if (!session) redirect("/login")

  const tokens = await getCliTokensByUserId(session.user.id)

  return (
    <div className="space-y-8 max-w-2xl animate-fade-up">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70 mb-2">
          Settings
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          API Keys
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Authenticate the Invokix CLI. Name each key so you know which machine or pipeline it belongs to.
        </p>
      </div>

      {/* ── CLI usage hint ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30 flex items-center gap-2.5">
          <TerminalIcon weight="fill" className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">CLI Usage</h2>
        </div>
        <div className="px-6 py-4 space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            After creating a key, authenticate once and your types will always be in sync.
          </p>
          <div className="rounded-lg bg-muted/40 border border-border/40 px-4 py-3 font-mono text-xs text-foreground/80 space-y-1.5">
            
            <p><span className="text-primary/60">$</span> npx invokix pull</p>
          </div>
        </div>
      </div>

      {/* ── Keys manager ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30 flex items-center gap-2.5">
          <KeyIcon weight="fill" className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Your Keys</h2>
          <span className="ml-auto text-[11px] font-semibold text-muted-foreground/50 bg-muted/40 border border-border/30 rounded-full px-2.5 py-0.5">
            {tokens.length} total
          </span>
        </div>
        <div className="px-6 py-5">
          <ApiKeysManager initialTokens={tokens} />
        </div>
      </div>
    </div>
  )
}