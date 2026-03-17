// components/editor/ShareOutputCard.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  CopyIcon,
  DownloadIcon,
  CodeIcon,
  DeviceMobileIcon,
  ShieldIcon,
  CheckIcon,
 FileTsIcon 
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"

type ShareOutputCardProps = {
  title: string
  filename: string
  icon: "hooks" | "mobile" | "shield" | "types"
  content: string
  badge?: string
}

const ICON_MAP = {
  hooks: CodeIcon,
  mobile: DeviceMobileIcon,
  shield: ShieldIcon,
  types: FileTsIcon 
}

export function ShareOutputCard({ title, filename, icon, content, badge }: ShareOutputCardProps) {
  const [copied, setCopied] = useState(false)
  const Icon = ICON_MAP[icon]

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success(`${filename} copied!`)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  const preview = content.split("\n").slice(0, 8).join("\n")

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground">{title}</span>
          {badge && (
            <Badge variant="outline" className="text-[9px] border-primary/20 text-primary bg-primary/5">
              {badge}
            </Badge>
          )}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/40">{filename}</span>
      </div>

      {/* Preview */}
      <div className="flex-1 px-4 py-3 bg-[#22272e] overflow-hidden">
        <pre className="text-[10px] font-mono text-muted-foreground/70 leading-relaxed overflow-hidden whitespace-pre-wrap line-clamp-6">
          {preview}
        </pre>
      </div>

      {/* Actions */}
      <div className="px-3 py-2.5 border-t border-border/40 bg-muted/10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs border-border/50 gap-1.5"
          onClick={handleCopy}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1.5 text-emerald-400"
              >
                <CheckIcon weight="bold" className="h-3 w-3" />
                Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <CopyIcon className="h-3 w-3" />
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 border-border/50"
          onClick={handleDownload}
          aria-label="Download"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}