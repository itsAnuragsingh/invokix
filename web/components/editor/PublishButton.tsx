// components/editor/PublishButton.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  UploadSimpleIcon,
  WarningIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import type { DiffItem } from "@/lib/analysis/diff"

type PublishButtonProps = {
  projectId: string
}

export function PublishButton({ projectId }: PublishButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const [diff, setDiff] = useState<DiffItem[]>([])
  const [forceLoading, setForceLoading] = useState(false)

  async function handlePublish(force = false) {
    if (force) {
      setForceLoading(true)
    } else {
      setLoading(true)
    }

    try {
      const res = await fetch("/api/contract/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, force }),
      })

      const json = await res.json()
      if (!json.success) {
        toast.error(json.error ?? "Publish failed")
        return
      }

      if (json.data.blocked) {
        setDiff(json.data.diff)
        setShowGate(true)
        return
      }

      toast.success(`Published v${json.data.version}!`)
      setShowGate(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
      setForceLoading(false)
    }
  }

  const breakingItems = diff.filter((i) => i.breaking)
  const safeItems = diff.filter((i) => !i.breaking)

  return (
    <>
      {/* Publish button */}
      <Button
        onClick={() => handlePublish(false)}
        disabled={loading}
        size="sm"
        className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-4 gap-1.5"
      >
        {loading ? (
          <motion.div
            className="flex items-center gap-1.5"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <UploadSimpleIcon className="h-3.5 w-3.5" />
            Publishing...
          </motion.div>
        ) : (
          <>
            <RocketLaunchIcon weight="fill" className="h-3.5 w-3.5" />
            Publish
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </>
        )}
      </Button>

      {/* Breaking change gate modal */}
      <Dialog open={showGate} onOpenChange={(v) => { if (!v) setShowGate(false) }}>
        <DialogContent className="!max-w-lg w-full bg-card border-border/50 p-0 overflow-hidden flex flex-col gap-0 max-h-[80vh]">

          {/* Header */}
          <div className="px-5 py-4 border-b border-border/40 bg-destructive/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                <WarningIcon weight="fill" className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle className="font-display font-bold text-base text-foreground leading-none">
                  Breaking Changes Detected
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  {breakingItems.length} breaking · {safeItems.length} safe · Review before publishing
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Diff list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">

            {breakingItems.length > 0 && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400/70 flex items-center gap-1.5">
                    <XCircleIcon weight="fill" className="h-3 w-3 text-red-400" />
                    Breaking ({breakingItems.length})
                  </p>
                  <div className="space-y-1.5">
                    {breakingItems.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2.5 text-[11px] p-3 rounded-xl bg-red-500/5 text-red-400 border border-red-500/20 leading-relaxed"
                      >
                        <XCircleIcon weight="fill" className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {item.message}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {safeItems.length > 0 && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/70 flex items-center gap-1.5">
                    <CheckCircleIcon weight="fill" className="h-3 w-3 text-emerald-400" />
                    Safe ({safeItems.length})
                  </p>
                  <div className="space-y-1.5">
                    {safeItems.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="flex items-start gap-2.5 text-[11px] p-3 rounded-xl bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 leading-relaxed"
                      >
                        <CheckCircleIcon weight="fill" className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {item.message}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer buttons */}
          <div className="px-5 py-4 border-t border-border/40 bg-muted/10 shrink-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border/50 h-9 text-sm"
                onClick={() => setShowGate(false)}
                disabled={forceLoading}
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "flex-1 h-9 text-sm font-semibold shadow-lg gap-2",
                  "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/25"
                )}
                onClick={() => handlePublish(true)}
                disabled={forceLoading}
              >
                {forceLoading ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Publishing...
                  </motion.span>
                ) : (
                  <>
                    <RocketLaunchIcon weight="fill" className="h-4 w-4" />
                    Force Publish
                  </>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
              Force publishing will notify all consumers of breaking changes
            </p>
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}