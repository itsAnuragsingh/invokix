// components/cli/CliAuthConfirm.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import {
  TerminalIcon,
  ShieldCheckIcon,
  ArrowsClockwiseIcon,
} from "@phosphor-icons/react"

type CliAuthConfirmProps = {
  sessionId: string
  userName: string
  userEmail: string
}

export function CliAuthConfirm({ sessionId, userName, userEmail }: CliAuthConfirmProps) {
  const [state, setState] = useState<"idle" | "loading" | "confirmed">("idle")

  async function handleConfirm() {
    setState("loading")
    try {
      const res = await fetch("/api/cli/auth/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.error ?? "Something went wrong")
        setState("idle")
        return
      }

      setState("confirmed")
    } catch {
      toast.error("Something went wrong. Try again.")
      setState("idle")
    }
  }

  return (
    <AnimatePresence mode="wait">
      {state !== "confirmed" ? (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TerminalIcon size={24} weight="duotone" className="text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheckIcon size={11} className="text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h1 className="font-display text-xl font-bold text-foreground">
              Authorize CLI access
            </h1>
            <p className="text-sm text-muted-foreground">
              A terminal on your machine is requesting access to your Invokix account.
            </p>
          </div>

          {/* User info */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
              Authorizing as
            </p>
            <p className="text-sm font-semibold text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground/60">{userEmail}</p>
          </div>

          {/* What access means */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
              This will allow the CLI to
            </p>
            {[
              "Read your projects and contracts",
              "Pull generated types, hooks, and schemas",
              "Log pulls for consumer tracking",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={state === "loading"}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl
              bg-primary text-primary-foreground text-sm font-semibold
              hover:bg-primary/90 transition-all disabled:opacity-50
              shadow-lg shadow-primary/20"
          >
            {state === "loading" ? (
              <>
                <ArrowsClockwiseIcon size={15} className="animate-spin" />
                Authorizing...
              </>
            ) : (
              "Authorize CLI access"
            )}
          </button>

          <p className="text-[11px] text-muted-foreground/40 text-center">
            Only click confirm if you ran this from your own terminal.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 py-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"
          >
            <ShieldCheckIcon size={28} weight="duotone" className="text-emerald-400" />
          </motion.div>

          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-foreground">
              CLI authorized
            </h2>
            <p className="text-sm text-muted-foreground">
              You can close this tab. Your terminal is now authenticated.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-xs text-emerald-400/80 font-mono">
              ✔ Authenticated as {userEmail}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}