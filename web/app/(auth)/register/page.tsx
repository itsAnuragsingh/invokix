// app/(auth)/register/page.tsx
import { RegisterForm } from "@/components/auth/RegisterForm"
import { Badge } from "@/components/ui/badge"
import {
  LightningIcon,
  RocketLaunchIcon,
  StarIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

const STEPS = [
  { step: "01", title: "Import or generate", desc: "Paste your spec or describe in plain English" },
  { step: "02", title: "Get code instantly", desc: "Types, hooks, Zod schemas — all generated" },
  { step: "03", title: "Share + protect", desc: "Gate breaking changes. Alert your team." },
]

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left — brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#0d1117] overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <LightningIcon weight="fill" className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">Invokix</span>
        </div>

        {/* Center */}
        <div className="relative space-y-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RocketLaunchIcon weight="fill" className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
                Free to start
              </Badge>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
              Your API.<br />
              Your team.<br />
              Always in sync.
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Join developers who stopped debugging silent API changes and started shipping faster.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold font-mono text-primary">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-muted/20">
            <div className="flex -space-x-2">
              {["A", "S", "R", "V"].map((letter) => (
                <div
                  key={letter}
                  className="h-7 w-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center"
                >
                  <span className="text-[10px] font-bold text-primary">{letter}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} weight="fill" className="h-3 w-3 text-amber-400" />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Loved by dev teams shipping fast
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-[11px] text-muted-foreground/40">
          © 2025 Invokix. Free forever for solo devs.
        </p>
      </div>

      {/* Right — form */}
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
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              Free forever for solo developers
            </p>
          </div>

          {/* Free plan callout */}
          <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <CheckCircleIcon weight="fill" className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-400">
              Free plan includes 1 project · No credit card required
            </p>
          </div>

          <RegisterForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-[11px] text-muted-foreground/40 leading-relaxed">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

    </div>
  )
}