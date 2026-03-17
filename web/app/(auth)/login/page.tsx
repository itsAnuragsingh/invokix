// app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/LoginForm"
import { Badge } from "@/components/ui/badge"
import {
  LightningIcon,
  ShieldCheckIcon,
  GitBranchIcon,
  BellIcon,
  UsersIcon,
  CodeIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

const FEATURES = [
  { icon: LightningIcon, text: "Generate TS types + React Query hooks instantly" },
  { icon: ShieldCheckIcon, text: "Breaking change gate — blocks dangerous publishes" },
  { icon: BellIcon, text: "Slack alerts the moment anything changes" },
  { icon: GitBranchIcon, text: "Full version history with one-click rollback" },
  { icon: UsersIcon, text: "Consumer tracking — know exactly who is on what version" },
  { icon: CodeIcon, text: "npx invokix pull — types in every project, always" },
]

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left — brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#0d1117] overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        {/* Top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <LightningIcon weight="fill" className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-foreground">Invokix</span>
            <Badge variant="outline" className="ml-2 text-[10px] border-primary/20 text-primary bg-primary/5">
              Beta
            </Badge>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">
              Your API's home
            </p>
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
              One contract.<br />
              Your whole team<br />
              in sync. Forever.
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Design, generate, sync, and protect your entire API contract in one place.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground/40">
            © 2025 Invokix. Built for developers.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-muted-foreground/50">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col items-center justify-center px-6 py-12 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <LightningIcon weight="fill" className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">Invokix</span>
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}