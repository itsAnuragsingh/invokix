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
    <div className="space-y-4">
      {/* Generate panel */}
      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Code Generation
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate production-ready code from your contract
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {OUTPUT_STATS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1 text-[10px] text-muted-foreground/60 bg-muted/40 border border-border/30 rounded-full px-2 py-0.5"
              >
                <Icon className="h-2.5 w-2.5" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground max-w-sm">
            One click generates TypeScript types, React Query v5 hooks, Zod schemas, and React Native hooks — all synced to your contract.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-6 shrink-0 ml-4"
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
                Generate Code
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
            <div className="rounded-xl border border-primary/20 bg-primary/3 p-1">
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <SparkleIcon weight="fill" className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Generated Output</span>
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 font-mono">
                    v{generated.version}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground/50">4 files ready</span>
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