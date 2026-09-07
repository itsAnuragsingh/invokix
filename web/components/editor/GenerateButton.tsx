// components/editor/GenerateButton.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { SparkleIcon, CodeIcon, DeviceMobileIcon, ShieldIcon, ArrowRightIcon } from "@phosphor-icons/react"
import { CodeOutput } from "@/components/editor/CodeOutput"
import { motion, AnimatePresence } from "motion/react"

type GeneratedCode = {
  types: string
  hooks: string
  nativeHooks: string
  zod: string
  contractId: string
  version: string
  stack:"nextjs" | "react-native" | "express" | "angular" | "other"
}

type GenerateButtonProps = {
  projectId: string
}

const OUTPUT_STATS = [
  { icon: CodeIcon, label: "TS Types" },
  { icon: SparkleIcon, label: "React Query" },
  { icon: DeviceMobileIcon, label: "React Native" },
  { icon: ShieldIcon, label: "Zod Schemas" },
]

function getStorageKey(projectId: string) {
  return `codegen:${projectId}`
}

export function GenerateButton({ projectId }: GenerateButtonProps) {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<GeneratedCode | null>(null)

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(projectId))
      if (saved) {
        setGenerated(JSON.parse(saved) as GeneratedCode)
      }
    } catch {
      // ignore parse errors
    }
  }, [projectId])

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch("/api/generate/codegen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Generation failed"); return }

      setGenerated(json.data)
      // Persist to localStorage so it survives page reloads
      try {
        localStorage.setItem(getStorageKey(projectId), JSON.stringify(json.data))
      } catch {
        // quota exceeded or SSR — silently ignore
      }
      toast.success("Code generated!")

      await fetch("/api/consumers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: json.data.contractId,
          version: json.data.version,
          source: "web",
        }),
      }).catch(() => {})
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Generate panel */}
      <div className="relative overflow-hidden border border-primary/30 bg-[linear-gradient(110deg,rgba(99,102,241,.13),rgba(10,12,18,.65)_42%,rgba(183,255,60,.06))]">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border-[24px] border-primary/15" />
        <div className="relative px-5 py-5 border-b border-primary/20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Contract artifacts</p>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">Generate code your team can ship.</h2>
            <p className="mt-1 text-xs text-muted-foreground">Typed artifacts, always aligned with the current contract version.</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {OUTPUT_STATS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1 text-[10px] text-muted-foreground/70 bg-background/50 border border-border/30 px-2 py-1"
              >
                <Icon className="h-2.5 w-2.5" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative px-5 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="grid h-8 w-8 place-items-center border border-[#B7FF3C]/25 bg-[#B7FF3C]/10 text-[#B7FF3C]"><CodeIcon size={16} /></span><span>4 production-ready outputs<br /><span className="text-muted-foreground/60">generated from the exact schema above</span></span></div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="relative overflow-hidden bg-[#B7FF3C] hover:bg-[#C8FF64] text-[#10100B] shadow-[5px_5px_0_rgba(99,102,241,.65)] px-6 h-11 shrink-0 font-bold"
          >
            {loading ? (
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <SparkleIcon className="h-4 w-4" />
                Generating...
              </motion.div>
            ) : (
              <>
                <SparkleIcon className="h-4 w-4 mr-2" />
                Generate artifacts
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Output */}
      <AnimatePresence>
        {generated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="overflow-hidden border border-primary/30 bg-[#0D1117] p-1 shadow-xl shadow-black/15">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <SparkleIcon weight="fill" className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Generated artifact bundle</span>
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 font-mono rounded-none">
                    v{generated.version}
                  </Badge>
                </div>
                <span className="text-[10px] text-[#B7FF3C] font-mono">4 files ready</span>
              </div>
              <CodeOutput
                types={generated.types}
                hooks={generated.hooks}
                nativeHooks={generated.nativeHooks}
                zod={generated.zod}
                stack={generated.stack}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
