// components/dashboard/ConsumerTable.tsx
"use client"

import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Badge } from "@/components/ui/badge"
import {
  GlobeIcon,
  TerminalIcon,
  LinkIcon,
  ClockIcon,
  UsersIcon,
  WarningIcon,
  CheckCircleIcon,
  PlugIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"
import type { consumers } from "@/lib/db/schema"

type Consumer = InferSelectModel<typeof consumers>

type ConsumerTableProps = {
  consumers: Consumer[]
  currentVersion: string
}

const SOURCE_CONFIG = {
  web: { icon: GlobeIcon, label: "Web", color: "text-[#56B6C2]", bg: "bg-[#56B6C2]/10 border-[#56B6C2]/30" },
  cli: { icon: TerminalIcon, label: "CLI", color: "text-[#B7FF3C]", bg: "bg-[#B7FF3C]/10 border-[#B7FF3C]/30" },
  api: { icon: PlugIcon, label: "API", color: "text-[#AE8CFF]", bg: "bg-[#AE8CFF]/10 border-[#AE8CFF]/30" },
  postman: { icon: LinkIcon, label: "Postman", color: "text-[#FFD15C]", bg: "bg-[#FFD15C]/10 border-[#FFD15C]/30" },
}

function isOutdated(version: string, current: string): boolean {
  const v = version.split(".").map(Number)
  const c = current.split(".").map(Number)
  for (let i = 0; i < Math.max(v.length, c.length); i++) {
    if ((v[i] ?? 0) < (c[i] ?? 0)) return true
  }
  return false
}

export function ConsumerTable({ consumers, currentVersion }: ConsumerTableProps) {
  const [parent] = useAutoAnimate()

  const outdated = consumers.filter(c => isOutdated(c.version, currentVersion))
  const upToDate = consumers.filter(c => !isOutdated(c.version, currentVersion))

  if (consumers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center">
            <UsersIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-[9px] font-bold text-primary">0</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">No consumers yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Every time someone generates code or runs{" "}
            <code className="font-mono text-primary bg-primary/10 px-1 rounded">npx invokix pull</code>
            {" "}they appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total consumers", value: consumers.length, color: "text-foreground" },
          { label: "Up to date", value: upToDate.length, color: "text-[#B7FF3C]" },
          { label: "Outdated", value: outdated.length, color: "text-[#F15A3C]" },
          { label: "Current version", value: `v${currentVersion}`, color: "text-[#AE8CFF]" },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="border border-border/60 bg-card/50 px-4 py-3 space-y-1 shadow-[2px_2px_0_rgba(0,0,0,0.6)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">{label}</p>
            <p className={cn("text-xl font-display font-bold", color)}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Outdated warning */}
      {outdated.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 border border-[#F15A3C]/30 bg-[#F15A3C]/10 shadow-[2px_2px_0_rgba(241,90,60,0.2)]"
        >
          <WarningIcon weight="fill" className="h-4 w-4 text-[#F15A3C] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#F15A3C]">
              {outdated.length} consumer{outdated.length !== 1 ? "s" : ""} on an older version
            </p>
            <p className="text-xs text-[#F15A3C]/80 mt-0.5">
              They may be affected by recent changes. Consider notifying them.
            </p>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="border border-border/60 bg-card/50 overflow-hidden shadow-[3px_3px_0_rgba(0,0,0,0.7)]">
        {/* Table header */}
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20 grid grid-cols-12 gap-4">
          {["Consumer", "Source", "Version", "Status", "Last seen"].map((h) => (
            <p key={h} className={cn(
              "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50",
              h === "Consumer" ? "col-span-4" :
              h === "Last seen" ? "col-span-3" : "col-span-2"
            )}>
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        <div ref={parent} className="divide-y divide-border/30">
          {consumers.map((consumer, i) => {
            const sourceKey = consumer.source as keyof typeof SOURCE_CONFIG
            const src = SOURCE_CONFIG[sourceKey] ?? SOURCE_CONFIG.web
            const SrcIcon = src.icon
            const outdatedConsumer = isOutdated(consumer.version, currentVersion)

            return (
              <motion.div
                key={consumer.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-4 py-3.5 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.03] transition-colors"
              >
                {/* Consumer ID */}
                <div className="col-span-4 flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-muted/50 border border-border/40 flex items-center justify-center shrink-0">
                    <SrcIcon className={cn("h-4 w-4", src.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-foreground truncate">
                      {consumer.userId ?? "Anonymous"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 truncate">
                      {consumer.teamId ?? "No team"}
                    </p>
                  </div>
                </div>

                {/* Source */}
                <div className="col-span-2">
                  <Badge variant="outline" className={cn("text-[10px] font-mono gap-1 rounded-none border shadow-[1px_1px_0_rgba(0,0,0,0.5)]", src.bg, src.color)}>
                    <SrcIcon className="h-2.5 w-2.5" />
                    {src.label}
                  </Badge>
                </div>

                {/* Version */}
                <div className="col-span-2">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-mono rounded-none border shadow-[1px_1px_0_rgba(0,0,0,0.5)]",
                    outdatedConsumer
                      ? "border-[#F15A3C]/30 text-[#F15A3C] bg-[#F15A3C]/10"
                      : "border-[#B7FF3C]/30 text-[#B7FF3C] bg-[#B7FF3C]/10"
                  )}>
                    v{consumer.version}
                  </Badge>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center gap-1.5 font-mono text-xs font-bold">
                  {outdatedConsumer ? (
                    <>
                      <WarningIcon weight="fill" className="h-3 w-3 text-[#F15A3C]" />
                      <span className="text-[11px] text-[#F15A3C]">Outdated</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon weight="fill" className="h-3 w-3 text-[#B7FF3C]" />
                      <span className="text-[11px] text-[#B7FF3C]">Current</span>
                    </>
                  )}
                </div>

                {/* Last seen */}
                <div className="col-span-2 flex items-center gap-1 text-[11px] text-muted-foreground/50">
                  <ClockIcon className="h-3 w-3" />
                  {formatDistanceToNow(new Date(consumer.lastPulledAt), { addSuffix: true })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}