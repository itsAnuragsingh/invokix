// components/editor/ProjectStatBar.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
  SparkleIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import NumberFlow from "@number-flow/react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import type { HealthIssue } from "@/lib/analysis/health"

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
}: ProjectStatBarProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [healthScore, setHealthScore] = useState(initialHealthScore)
  const [issues, setIssues] = useState<HealthIssue[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [fixingWithAi, setFixingWithAi] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const config = healthConfig(healthScore)

  function handleCopy() {
    navigator.clipboard.writeText(mockUrl)
    setCopied(true)
    toast.success("Mock URL copied")
    setTimeout(() => setCopied(false), 2000)
  }

  async function fetchHealthDetails() {
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
      setIssues(json.data.issues ?? [])
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setRefreshing(false)
    }
  }

  async function handleFixIssues(singleIssue?: HealthIssue) {
    const targetIssues = singleIssue ? [singleIssue] : issues
    if (targetIssues.length === 0) return

    setFixingWithAi(true)
    try {
      const issueText = targetIssues
        .map((i) => `- Issue: "${i.message}" on Endpoint Path: "${i.path || "global"}"`)
        .join("\n")

      const prompt = `FIX THE FOLLOWING HEALTH SCORE ISSUES IN THE EXISTING SPECIFICATION:
${issueText}

CRITICAL INSTRUCTIONS:
- For every endpoint path referenced above, include a full method definition with summary and COMPLETE responses object.
- Always include success (200/201) AND error status codes ("401": { "description": "Unauthorized — invalid authentication credentials" }, "500": { "description": "Internal server error" }).
- Add concise description strings for any requestBody fields or parameters.`

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, plainEnglish: prompt }),
      })

      const json = await res.json()
      if (!json.success) {
        toast.error(json.error ?? "AI Fix failed")
        return
      }

      toast.success(singleIssue ? "Issue fixed with AI!" : "All health issues fixed with AI!")
      await fetchHealthDetails()
      router.refresh()
    } catch {
      toast.error("Failed to fix issues with AI. Try again.")
    } finally {
      setFixingWithAi(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-border/45">

        {/* Health Score Card */}
        <div className={cn(
          "group flex items-center gap-3 bg-background p-4 transition-all duration-150 relative",
          config.bg, config.border
        )}>
          <MiniHealthRing score={healthScore} config={config} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">Health</p>
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(true)
                  fetchHealthDetails()
                }}
                title="View Health Score basis & breakdown"
                className="h-4 w-4 rounded-full bg-muted/40 hover:bg-muted border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all ml-0.5"
              >
                <InfoIcon className="h-2.5 w-2.5" />
              </button>
            </div>
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
            onClick={fetchHealthDetails}
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

      {/* Health Score Basis Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border shadow-xl p-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon size={20} className={config.color} weight="duotone" />
                <DialogTitle className="text-base font-semibold">Health Score Calculation</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                How Invokix calculates contract quality and structural integrity.
              </DialogDescription>
            </div>

            {/* Current Score Summary */}
            <div className={cn("p-4 rounded-xl border flex items-center justify-between", config.bg, config.border)}>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Current Score</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={cn("text-2xl font-bold font-display", config.color)}>{healthScore}</span>
                  <span className="text-xs text-muted-foreground font-mono">/ 100</span>
                </div>
              </div>
              <Badge variant="outline" className={cn("capitalize px-2.5 py-1 text-xs font-semibold", config.color, config.border)}>
                {healthScore >= 80 ? "Healthy" : healthScore >= 50 ? "Needs Review" : "Critical Issues"}
              </Badge>
            </div>

            {/* Scoring Basis Rules */}
            <div className="space-y-2 text-xs">
              <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">Scoring Rules</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-center">
                  <span className="block text-[10px] text-muted-foreground">Base</span>
                  <span className="font-bold text-sm text-foreground font-mono">100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <span className="block text-[10px] text-red-400/80">Critical Error</span>
                  <span className="font-bold text-sm text-red-400 font-mono">-15 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <span className="block text-[10px] text-amber-400/80">Warning</span>
                  <span className="font-bold text-sm text-amber-400 font-mono">-5 pts</span>
                </div>
              </div>
            </div>

            {/* Issues Breakdown List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground tracking-wide uppercase">
                  Detected Issues ({issues.length})
                </h4>
                {issues.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleFixIssues()}
                    disabled={fixingWithAi}
                    className="text-[10px] text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <SparkleIcon className={cn("h-3 w-3", fixingWithAi && "animate-spin")} />
                    Fix All with AI
                  </button>
                )}
              </div>
              {issues.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-400">
                  <CheckCircleIcon size={18} weight="bold" />
                  <span>No errors or warnings found. Contract structure is 100% compliant!</span>
                </div>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg border text-xs space-y-1.5",
                          issue.severity === "error"
                            ? "bg-red-500/10 border-red-500/20 text-red-300"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium flex items-center gap-1.5 capitalize">
                            {issue.severity === "error" ? (
                              <WarningIcon className="h-3.5 w-3.5 text-red-400 shrink-0" weight="bold" />
                            ) : (
                              <InfoIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            )}
                            {issue.severity}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-background/50 border border-current opacity-80">
                            {issue.severity === "error" ? "-15 pts" : "-5 pts"}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-90">{issue.message}</p>
                        <div className="flex items-center justify-between pt-0.5 border-t border-current/10 mt-1">
                          {issue.path ? (
                            <p className="text-[10px] font-mono text-muted-foreground/80 truncate max-w-[200px]">
                              Path: {issue.path}
                            </p>
                          ) : <span />}
                          <button
                            type="button"
                            onClick={() => handleFixIssues(issue)}
                            disabled={fixingWithAi}
                            className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 ml-auto"
                          >
                            <SparkleIcon className="h-2.5 w-2.5" />
                            Fix with AI
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleFixIssues()}
                    disabled={fixingWithAi}
                    className="w-full bg-gradient-to-r from-primary via-[#B7FF3C] to-emerald-400 text-black font-bold h-10 rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-3"
                  >
                    {fixingWithAi ? (
                      <>
                        <SparkleIcon className="h-4 w-4 animate-spin" />
                        <span>Fixing {issues.length} Issue{issues.length > 1 ? "s" : ""} with AI...</span>
                      </>
                    ) : (
                      <>
                        <SparkleIcon className="h-4 w-4 fill-current" />
                        <span>Auto-Fix All {issues.length} Issue{issues.length > 1 ? "s" : ""} with AI</span>
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
