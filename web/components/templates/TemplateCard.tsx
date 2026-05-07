// components/templates/TemplateCard.tsx
"use client"

import { GitForkIcon, LightningIcon, ShieldCheckIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type Template = {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  forkCount: number
  healthScore: number
  endpointCount: number
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  payments:  { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  auth:      { bg: "bg-primary/10",     text: "text-primary",     border: "border-primary/20"     },
  storage:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20"   },
  messaging: { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20"  },
  ecommerce: { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20"    },
  analytics: { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/20"    },
  other:     { bg: "bg-muted/30",       text: "text-muted-foreground", border: "border-border/50" },
}

const healthColor = (score: number) =>
  score >= 90 ? "text-emerald-400" :
  score >= 70 ? "text-amber-400" :
  "text-red-400"

export function TemplateCard({
  template,
  onFork,
}: {
  template: Template
  onFork: () => void
}) {
  const style = CATEGORY_STYLES[template.category] ?? CATEGORY_STYLES.other

  return (
    <div className="group flex flex-col rounded-xl border border-border/50 bg-card/30
      hover:border-primary/30 hover:bg-card/50 transition-all duration-150 overflow-hidden">

      {/* Header */}
      <div className="p-4 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground leading-tight">
            {template.title}
          </h3>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
            style.bg, style.text, style.border
          )}>
            {template.category}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-muted-foreground/50 bg-muted/20 border border-border/30 px-1.5 py-0.5 rounded font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-t border-border/40 bg-muted/10 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <LightningIcon size={12} className="text-muted-foreground/40" />
          <span className="text-[11px] text-muted-foreground/60 font-mono">
            {template.endpointCount} endpoints
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheckIcon size={12} className={healthColor(template.healthScore)} />
          <span className={cn("text-[11px] font-mono font-medium", healthColor(template.healthScore))}>
            {template.healthScore}/100
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <GitForkIcon size={12} className="text-muted-foreground/40" />
          <span className="text-[11px] text-muted-foreground/50 font-mono">
            {template.forkCount}
          </span>
        </div>
      </div>

      {/* Fork button */}
      <button
        onClick={onFork}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold
          bg-primary/5 border-t border-primary/10 text-primary
          hover:bg-primary/10 transition-colors"
      >
        <GitForkIcon size={13} weight="duotone" />
        Fork into project
      </button>
    </div>
  )
}