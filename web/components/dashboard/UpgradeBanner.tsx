"use client"

import Link from "next/link"
import { Lock, ArrowRight, Sparkle } from "lucide-react"
import type { PlanName } from "@/lib/plans/limits"

type Props = {
  /** Feature name being gated, e.g. "Mock Server" */
  feature: string
  /** Minimum plan required */
  requiredPlan: "pro" | "team"
  /** Current user plan */
  currentPlan: PlanName
  /** Optional description */
  description?: string
  /** If true, renders inline (small) instead of full-page overlay */
  inline?: boolean
}

export function UpgradeBanner({
  feature,
  requiredPlan,
  currentPlan,
  description,
  inline = false,
}: Props) {
  const planLabel = requiredPlan === "pro" ? "Pro" : "Team"

  if (inline) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          <Lock className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {feature} requires {planLabel}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          )}
        </div>
        <Link
          href="/upgrade"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
        >
          Upgrade
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-20 px-6">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 max-w-md text-center">
        {/* Icon */}
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary/70" />
          </div>
          <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Sparkle className="h-3 w-3 text-amber-500" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-foreground">
            {feature}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description ||
              `This feature is available on the ${planLabel} plan and above. Upgrade to unlock ${feature.toLowerCase()} and accelerate your API workflow.`}
          </p>
        </div>

        {/* Plan badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Current plan:</span>
          <span className="inline-flex items-center rounded-full border border-border/50 bg-card/50 px-2.5 py-0.5 font-semibold text-foreground capitalize">
            {currentPlan}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 font-semibold text-primary">
            {planLabel}
          </span>
        </div>

        {/* CTA */}
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
        >
          Upgrade to {planLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
