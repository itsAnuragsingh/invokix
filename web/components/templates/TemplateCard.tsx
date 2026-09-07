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
  payments:  { bg: "bg-[#B7FF3C]/10", text: "text-[#B7FF3C]", border: "border-[#B7FF3C]/30" },
  auth:      { bg: "bg-[#AE8CFF]/10", text: "text-[#AE8CFF]", border: "border-[#AE8CFF]/30" },
  storage:   { bg: "bg-[#FFD15C]/10", text: "text-[#FFD15C]", border: "border-[#FFD15C]/30" },
  messaging: { bg: "bg-[#56B6C2]/10", text: "text-[#56B6C2]", border: "border-[#56B6C2]/30" },
  ecommerce: { bg: "bg-[#F15A3C]/10", text: "text-[#F15A3C]", border: "border-[#F15A3C]/30" },
  analytics: { bg: "bg-[#D19A66]/10", text: "text-[#D19A66]", border: "border-[#D19A66]/30" },
  other:     { bg: "bg-muted/30",    text: "text-muted-foreground", border: "border-border/50" },
}

const healthColor = (score: number) =>
  score >= 90 ? "text-[#B7FF3C]" :
  score >= 70 ? "text-[#FFD15C]" :
  "text-[#F15A3C]"

export function TemplateCard({
  template,
  onFork,
}: {
  template: Template
  onFork: () => void
}) {
  const style = CATEGORY_STYLES[template.category] ?? CATEGORY_STYLES.other

  return (
    <div className="group flex flex-col rounded-2xl border border-white/10 bg-[#0E1017] shadow-[3px_3px_0_rgba(0,0,0,0.6)] hover:border-[#FFD15C]/40 hover:shadow-[4px_4px_0_rgba(255,209,92,0.15)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">

      {/* Header & Body */}
      <div className="p-5 flex-1 space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground group-hover:text-white transition-colors leading-tight">
            {template.title}
          </h3>
          <span className={cn(
            "text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 shadow-sm",
            style.bg, style.text, style.border
          )}>
            {template.category}
          </span>
        </div>

        <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-muted-foreground/70 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-5 py-2.5 border-t border-white/10 bg-white/[0.02] flex items-center gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <LightningIcon size={13} className="text-[#FFD15C]" />
          <span>{template.endpointCount} endpoints</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ShieldCheckIcon size={13} className={healthColor(template.healthScore)} />
          <span className={cn("font-medium", healthColor(template.healthScore))}>
            {template.healthScore}/100
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto text-muted-foreground/60">
          <GitForkIcon size={13} />
          <span>{template.forkCount} forks</span>
        </div>
      </div>

      {/* Tactile Fork Button */}
      <button
        onClick={onFork}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold
          bg-[#FFD15C]/10 border-t border-[#FFD15C]/30 text-[#FFD15C]
          hover:bg-[#FFD15C]/20 hover:text-white active:scale-[0.99] transition-all duration-150 shadow-[1px_1px_0_rgba(0,0,0,0.4)]"
      >
        <GitForkIcon size={14} weight="bold" />
        Fork Contract Template
      </button>
    </div>
  )
}