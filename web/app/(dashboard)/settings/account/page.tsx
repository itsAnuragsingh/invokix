// app/(dashboard)/settings/account/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { UserCircleIcon, EnvelopeIcon, ShieldCheckIcon, GithubLogoIcon } from "@phosphor-icons/react/dist/ssr"

export default async function AccountSettingsPage() {
  const session = await requireSession()
  if (!session) redirect("/login")

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?"

  return (
    <div className="space-y-8 max-w-2xl animate-fade-up">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70 mb-2">
          Settings
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Account
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile and connected services.
        </p>
      </div>

      {/* ── Profile card ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden">
        {/* Card header bar */}
        <div className="px-6 py-4 border-b border-border/30 flex items-center gap-2.5">
          <UserCircleIcon weight="fill" className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        </div>

        <div className="px-6 py-6 flex items-center gap-5">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-xl text-primary">{initials}</span>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Name
                </p>
                <p className="text-sm text-foreground font-medium">{session.user.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
                  Email
                </p>
                <p className="text-sm text-foreground font-medium truncate">{session.user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Connected accounts ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30 flex items-center gap-2.5">
          <ShieldCheckIcon weight="fill" className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Connected Accounts</h2>
          <p className="text-xs text-muted-foreground ml-1">Sign in with any connected method.</p>
        </div>

        <div className="px-6 py-4 space-y-3">
          {/* Email/password */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center">
                <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email / Password</p>
                <p className="text-[11px] text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              Active
            </span>
          </div>

          {/* GitHub — not connected */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/10 border border-dashed border-border/30 opacity-60">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted/40 border border-border/30 flex items-center justify-center">
                <GithubLogoIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">GitHub</p>
                <p className="text-[11px] text-muted-foreground">Not connected</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}