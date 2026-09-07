// components/editor/ProjectStatBar.tsx
"use client"

import { useState } from "react"
import { motion } from "motion/react"
import {
  ShieldCheckIcon,
  LightningIcon,
  TagIcon,
  ClockIcon,
  CopyIcon,
  CheckIcon,
  ArrowSquareOutIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import NumberFlow from "@number-flow/react"
import Link from "next/link"

type ProjectStatBarProps = {
  healthScore: number
  endpointCount: number
  version: string
  updatedAt: string
  mockUrl: string
  projectId: string
  contractId: string
}

function healthConfig(score: number) {
  if (score >= 80) return { color: "text-emerald-400", ring: "stroke-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  if (score >= 50) return { color: "text-amber-400", ring: "stroke-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
  return { color: "text-red-400", ring: "stroke-red-400", bg: "bg-red-500/10", border: "border-red-500/20" }
}

function MiniHealthRing({ score, config }: { score: number; config: ReturnType<typeof healthConfig> }) {
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative h-9 w-9 shrink-0">
      <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
        <motion.circle
          cx="18" cy="18" r={radius}
          fill="none" strokeWidth="3" strokeLinecap="round"
          className={config.ring}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[9px] font-bold font-mono tabular-nums", config.color)}>
          {score}
        </span>
      </div>
    </div>
  )
}

export function ProjectStatBar({
  healthScore: initialHealthScore,
  endpointCount,
  version,
  updatedAt,
  mockUrl,
  projectId,
  contractId,
}: ProjectStatBarProps) {
  const [copied, setCopied] = useState(false)
  const [healthScore, setHealthScore] = useState(initialHealthScore)
  const [refreshing, setRefreshing] = useState(false)
  const config = healthConfig(healthScore)

  function handleCopy() {
    navigator.clipboard.writeText(mockUrl)
    setCopied(true)
    toast.success("Mock URL copied")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRefreshHealth() {
    setRefreshing(true)
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Health check failed"); return }
      setHealthScore(json.data.score)
      toast.success(`Health score updated: ${json.data.score}/100`)
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-border/45">

      {/* Health Score */}
      <div className={cn(
        "group flex items-center gap-3 bg-background p-4 transition-all duration-150 relative",
        config.bg, config.border
      )}>
        <MiniHealthRing score={healthScore} config={config} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">Health</p>
          <div className="flex items-baseline gap-1">
            <NumberFlow
              value={healthScore}
              className={cn("text-lg font-display font-bold tabular-nums", config.color)}
            />
            <span className="text-[10px] text-muted-foreground/40 font-mono">/100</span>
          </div>
        </div>
        {/* Refresh button */}
        <button
          onClick={handleRefreshHealth}
          disabled={refreshing}
          title="Refresh health score"
          className={cn(
            "absolute top-2 right-2 h-6 w-6 rounded-md flex items-center justify-center transition-all",
            "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <ArrowsClockwiseIcon className={cn("h-3 w-3", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Endpoints */}
      <div className="flex items-center gap-3 bg-background p-4 hover:bg-card/60 transition-all duration-150">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <LightningIcon size={16} weight="duotone" className="text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">Endpoints</p>
          <NumberFlow value={endpointCount} className="text-lg font-display font-bold text-foreground tabular-nums" />
        </div>
      </div>

      {/* Version */}
      <div className="flex items-center gap-3 bg-background p-4 hover:bg-card/60 transition-all duration-150">
        <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
          <TagIcon size={16} weight="duotone" className="text-violet-400" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">Version</p>
          <p className="text-lg font-display font-bold text-foreground font-mono">v{version}</p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-3 bg-background p-4 hover:bg-card/60 transition-all duration-150">
        <div className="h-9 w-9 rounded-lg bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center shrink-0">
          <ClockIcon size={16} weight="duotone" className="text-zinc-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">Updated</p>
          <p className="text-sm font-semibold text-foreground truncate">{updatedAt}</p>
        </div>
      </div>

      {/* Mock Server */}
      <div className="col-span-2 lg:col-span-1 flex items-center gap-3 bg-emerald-500/5 p-4 hover:bg-emerald-500/10 transition-all duration-150 group">
        <div className="relative shrink-0">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="absolute inset-0 rounded-lg border border-emerald-500/30 animate-ping opacity-30" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest font-medium">Mock Server</p>
          <p className="text-[11px] font-mono text-emerald-300/80 truncate">{mockUrl}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            title="Copy mock URL"
          >
            {copied ? <CheckIcon size={12} weight="bold" /> : <CopyIcon size={12} />}
          </button>
          <Link
            href={`/project/${projectId}/mock`}
            className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            title="Open mock server"
          >
            <ArrowSquareOutIcon size={12} />
          </Link>
        </div>
      </div>

    </div>
  )
}
