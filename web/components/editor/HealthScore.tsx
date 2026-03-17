// components/editor/HealthScore.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ShieldCheckIcon,
  WarningIcon,
  XCircleIcon,
  ArrowsClockwiseIcon,
  CheckCircleIcon,
  ShieldIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import NumberFlow from "@number-flow/react"
import type { HealthResult } from "@/lib/analysis/health"

type HealthScoreProps = {
  projectId: string
  initialScore?: number
}

function scoreConfig(score: number) {
  if (score >= 80) return {
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    glow: "shadow-emerald-500/20",
    label: "Healthy",
    badgeClass: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    ringClass: "stroke-emerald-400",
  }
  if (score >= 50) return {
    color: "text-amber-400",
    bg: "bg-amber-500",
    glow: "shadow-amber-500/20",
    label: "Needs Work",
    badgeClass: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    ringClass: "stroke-amber-400",
  }
  return {
    color: "text-red-400",
    bg: "bg-red-500",
    glow: "shadow-red-500/20",
    label: "Critical",
    badgeClass: "border-red-500/30 text-red-400 bg-red-500/10",
    ringClass: "stroke-red-400",
  }
}

function ScoreRing({ score, config }: { score: number; config: ReturnType<typeof scoreConfig> }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
        {/* Background ring */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/40"
        />
        {/* Progress ring */}
        <motion.circle
          cx="48" cy="48" r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={config.ringClass}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      {/* Score number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <NumberFlow
          value={score}
          className={cn("text-2xl font-display font-bold tabular-nums", config.color)}
        />
        <span className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">/100</span>
      </div>
    </div>
  )
}

export function HealthScore({ projectId, initialScore }: HealthScoreProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HealthResult | null>(null)

  async function handleCheck() {
    setLoading(true)
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Health check failed"); return }
      setResult(json.data)
      toast.success(`Health score: ${json.data.score}/100`)
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const score = result?.score ?? initialScore ?? null
  const config = score !== null ? scoreConfig(score) : null

  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon weight="fill" className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Contract Health</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCheck}
            disabled={loading}
            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2.5"
          >
            <ArrowsClockwiseIcon className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} />
            {loading ? "Checking..." : "Run Check"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {score !== null && config ? (
            <motion.div
              key="score"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Score ring + label */}
              <div className="flex items-center gap-4">
                <ScoreRing score={score} config={config} />
                <div className="flex-1 space-y-2">
                  <Badge variant="outline" className={cn("text-[10px]", config.badgeClass)}>
                    {config.label}
                  </Badge>
                  {result && (
                    <p className="text-xs text-muted-foreground">
                      {result.issues.length === 0
                        ? "No issues found"
                        : `${result.issues.filter(i => i.severity === "error").length} errors · ${result.issues.filter(i => i.severity === "warning").length} warnings`
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Issues list */}
              <AnimatePresence>
                {result && result.issues.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      {result.issues.length} issues
                    </p>
                    <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                      {result.issues.map((issue, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={cn(
                            "flex items-start gap-2 text-[11px] p-2 rounded-lg border",
                            issue.severity === "error"
                              ? "bg-red-500/5 text-red-400 border-red-500/20"
                              : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                          )}
                        >
                          {issue.severity === "error"
                            ? <XCircleIcon weight="fill" className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            : <WarningIcon weight="fill" className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          }
                          <span className="leading-relaxed">{issue.message}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {result && result.issues.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-emerald-400 text-xs py-1"
                  >
                    <CheckCircleIcon weight="fill" className="h-4 w-4" />
                    Perfect contract — no issues found
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 text-center space-y-3"
            >
              <div className="relative mx-auto h-14 w-14">
                <div className="h-14 w-14 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center">
                  <ShieldIcon className="h-6 w-6 text-muted-foreground/30" />
                </div>
                {initialScore !== undefined && initialScore !== null && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-card border border-border/50 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-muted-foreground">{initialScore}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {initialScore !== undefined ? `Last score: ${initialScore}/100` : "Not checked yet"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Run a check to see issues
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}