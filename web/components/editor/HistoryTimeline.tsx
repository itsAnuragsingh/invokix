// components/editor/HistoryTimeline.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  GitBranchIcon,
  WarningIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockCounterClockwiseIcon,
  CaretDownIcon,
  CaretRightIcon,
  RocketLaunchIcon,
  UserIcon,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"
import type { contractVersions } from "@/lib/db/schema"

type Version = InferSelectModel<typeof contractVersions>

type HistoryTimelineProps = {
  versions: Version[]
  contractId: string
  projectId: string
}

export function HistoryTimeline({ versions, contractId, projectId }: HistoryTimelineProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(versions[0]?.id ?? null)
  const [rollingBack, setRollingBack] = useState<string | null>(null)

  async function handleRollback(versionId: string, version: string) {
    setRollingBack(versionId)
    try {
      const res = await fetch("/api/versions/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId, projectId }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Rollback failed"); return }
      toast.success(`Rolled back to v${version}`)
      router.refresh()
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setRollingBack(null)
    }
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center">
          <GitBranchIcon className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">No versions yet</p>
          <p className="text-xs text-muted-foreground">Publish your contract to create the first snapshot</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-primary/40 via-border/40 to-transparent" />

      <div className="space-y-3">
        {versions.map((v, index) => {
          const isOpen = expanded === v.id
          const isLatest = index === 0
          const breakingFields = v.breakingFields ?? []
          const changeSummary = v.changeSummary ?? ""
          const changes = changeSummary
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)

          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="relative pl-10"
            >
              {/* Timeline node */}
              <div className={cn(
                "absolute left-0 top-4 h-10 w-10 rounded-xl border-2 flex items-center justify-center z-10",
                isLatest
                  ? "bg-primary/15 border-primary/40 shadow-lg shadow-primary/10"
                  : v.isBreaking
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              )}>
                {isLatest
                  ? <RocketLaunchIcon weight="fill" className="h-4 w-4 text-primary" />
                  : v.isBreaking
                  ? <WarningIcon weight="fill" className="h-4 w-4 text-red-400" />
                  : <CheckCircleIcon weight="fill" className="h-4 w-4 text-emerald-400" />
                }
              </div>

              {/* Card */}
              <div className={cn(
                "rounded-xl border overflow-hidden transition-colors",
                isOpen
                  ? "border-primary/30 bg-card shadow-lg shadow-primary/5"
                  : "border-border/40 bg-card/50 hover:border-border/70"
              )}>
                {/* Header row */}
                <button
                  type="button"
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                  onClick={() => setExpanded(isOpen ? null : v.id)}
                >
                  {/* Version badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs shrink-0",
                      isLatest
                        ? "border-primary/30 text-primary bg-primary/5"
                        : v.isBreaking
                        ? "border-red-500/30 text-red-400 bg-red-500/5"
                        : "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                    )}
                  >
                    v{v.version}
                  </Badge>

                  {/* Latest badge */}
                  {isLatest && (
                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 shrink-0">
                      Latest
                    </Badge>
                  )}

                  {/* Breaking badge */}
                  {v.isBreaking && (
                    <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-400 bg-red-500/5 shrink-0">
                      Breaking
                    </Badge>
                  )}

                  {/* Summary preview */}
                  <span className="text-xs text-muted-foreground truncate flex-1 hidden sm:block">
                    {changes[0] ?? "No change summary"}
                  </span>

                  {/* Meta */}
                  <div className="flex items-center gap-3 shrink-0 ml-auto">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
                      <ClockCounterClockwiseIcon className="h-3 w-3" />
                      {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                    </span>
                    <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
                      <CaretRightIcon className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/40 px-4 py-4 space-y-4 bg-muted/10">

                        {/* Changes list */}
                        {changes.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                              Changes ({changes.length})
                            </p>
                            <div className="space-y-1.5">
                              {changes.map((change, i) => {
                                const isBreaking = breakingFields.some(f =>
                                  change.toLowerCase().includes(f.toLowerCase().split(" ")[0])
                                )
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className={cn(
                                      "flex items-start gap-2 text-[11px] p-2.5 rounded-lg border leading-relaxed",
                                      isBreaking
                                        ? "bg-red-500/5 text-red-400 border-red-500/20"
                                        : "bg-muted/30 text-muted-foreground border-border/30"
                                    )}
                                  >
                                    {isBreaking
                                      ? <XCircleIcon weight="fill" className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                      : <CheckCircleIcon weight="fill" className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400/60" />
                                    }
                                    {change}
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Footer — author + rollback */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                            <UserIcon className="h-3 w-3" />
                            Published {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                          </div>
                          {!isLatest && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-border/50 text-muted-foreground hover:text-foreground gap-1.5"
                              onClick={() => handleRollback(v.id, v.version)}
                              disabled={rollingBack === v.id}
                            >
                              <ClockCounterClockwiseIcon className={cn("h-3 w-3", rollingBack === v.id && "animate-spin")} />
                              {rollingBack === v.id ? "Rolling back..." : "Rollback to this"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}