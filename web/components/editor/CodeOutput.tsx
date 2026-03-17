// components/editor/CodeOutput.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CopyIcon, DownloadSimpleIcon, CheckIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { codeToHtml } from "shiki"

type Stack = "nextjs" | "react-native" | "express" | "angular" | "other"

type Tab = {
  id: string
  label: string
  filename: string
  content: string
  language: "typescript" | "json"
  stacks: Stack[] // which stacks show this tab
}

type CodeOutputProps = {
  types: string
  hooks: string
  nativeHooks: string
  zod: string
  stack?: Stack
}

const ALL_TABS: Tab[] = [
  {
    id: "types",
    label: "TS Types",
    filename: "types.ts",
    content: "",
    language: "typescript",
    stacks: ["nextjs", "react-native", "express", "angular", "other"],
  },
  {
    id: "hooks",
    label: "React Query",
    filename: "useApi.ts",
    content: "",
    language: "typescript",
    stacks: ["nextjs"],
  },
  {
    id: "native",
    label: "React Native",
    filename: "useApiNative.ts",
    content: "",
    language: "typescript",
    stacks: ["react-native"],
  },
  {
    id: "zod",
    label: "Zod Schemas",
    filename: "schemas.ts",
    content: "",
    language: "typescript",
    stacks: ["nextjs", "react-native", "express", "angular", "other"],
  },
]

function getDefaultTab(stack: Stack): string {
  if (stack === "nextjs") return "hooks"
  if (stack === "react-native") return "native"
  return "types"
}

export function CodeOutput({ types, hooks, nativeHooks, zod, stack = "nextjs" }: CodeOutputProps) {
  const tabs: Tab[] = ALL_TABS.filter((t) => t.stacks.includes(stack)).map((t) => ({
    ...t,
    content:
      t.id === "types" ? types
      : t.id === "hooks" ? hooks
      : t.id === "native" ? nativeHooks
      : zod,
  }))

  const [active, setActive] = useState(() => getDefaultTab(stack))
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState<Record<string, string>>({})

  // If stack changes and active tab no longer exists, reset
  useEffect(() => {
    const ids = tabs.map((t) => t.id)
    if (!ids.includes(active)) setActive(getDefaultTab(stack))
  }, [stack])

  useEffect(() => {
    async function highlight() {
      const results: Record<string, string> = {}
      for (const tab of tabs) {
        try {
          results[tab.id] = await codeToHtml(tab.content || "// No output yet", {
            lang: tab.language,
            theme: "github-dark-dimmed",
          })
        } catch {
          results[tab.id] = `<pre><code>${tab.content}</code></pre>`
        }
      }
      setHighlighted(results)
    }
    highlight()
  }, [types, hooks, nativeHooks, zod, stack])

  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  function handleCopy() {
    navigator.clipboard.writeText(current.content)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([current.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = current.filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${current.filename}`)
  }

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card/50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-1">
          {/* Mac dots */}
          <div className="flex items-center gap-1.5 mr-4">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          </div>
          {/* Tabs */}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 font-mono",
                active === tab.id
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/50 font-mono mr-2">
            {current.filename}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            {copied
              ? <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
              : <CopyIcon className="h-3.5 w-3.5" />
            }
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <DownloadSimpleIcon className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>

      {/* Code panel */}
      <div className="relative overflow-auto max-h-96 bg-[#22272e]">
        {highlighted[active] ? (
          <div
            className="p-4 text-xs leading-relaxed [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:overflow-visible"
            dangerouslySetInnerHTML={{ __html: highlighted[active] }}
          />
        ) : (
          <div className="p-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-3 w-3 rounded-full border-2 border-primary/50 border-t-primary animate-spin" />
            Highlighting...
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/50 font-mono">
          {current.content.split("\n").length} lines · TypeScript
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          Generated by Invokix
        </span>
      </div>
    </div>
  )
}