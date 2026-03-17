// components/dashboard/StackSelector.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  StackIcon,
  DeviceMobileIcon,
  TerminalIcon,
  CirclesThreeIcon,
  AngularLogoIcon,
} from "@phosphor-icons/react"

type Stack = "nextjs" | "react-native" | "express" | "angular" | "other"

const STACK_OPTIONS: {
  value: Stack
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    value: "nextjs",
    label: "Next.js / React",
    description: "Types + React Query v5 + Zod",
    icon: <StackIcon size={18} />,
  },
  {
    value: "react-native",
    label: "React Native",
    description: "Types + Native hooks + Zod",
    icon: <DeviceMobileIcon size={18} />,
  },
  {
    value: "express",
    label: "Express / Node",
    description: "Types + Zod only",
    icon: <TerminalIcon size={18} />,
  },
  {
    value: "angular",
    label: "Angular",
    description: "Types + Zod only",
    icon: <AngularLogoIcon size={18} />,
  },
  {
    value: "other",
    label: "Other",
    description: "Types + Zod only",
    icon: <CirclesThreeIcon size={18} />,
  },
]

type Props = {
  projectId: string
  currentStack: Stack
}

export function StackSelector({ projectId, currentStack }: Props) {
  const [stack, setStack] = useState<Stack>(currentStack)
  const [loading, setLoading] = useState(false)

  async function handleChange(value: Stack) {
    if (value === stack) return
    setStack(value)
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/stack`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stack: value }),
      })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error ?? "Failed to update stack")
        setStack(stack)
        return
      }
      toast.success("Stack updated")
    } catch {
      toast.error("Something went wrong. Try again.")
      setStack(stack)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
        <p className="text-sm font-semibold text-foreground">Stack</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Controls which code outputs are generated and shown on the share page
        </p>
      </div>
      <div className="p-4 grid grid-cols-1 gap-2">
        {STACK_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={loading}
            onClick={() => handleChange(option.value)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all disabled:opacity-60 ${
              stack === option.value
                ? "border-indigo-500 bg-indigo-500/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
            }`}
          >
            <span className={stack === option.value ? "text-indigo-400" : "text-muted-foreground"}>
              {option.icon}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="block text-xs text-muted-foreground">{option.description}</span>
            </span>
            {stack === option.value && (
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}