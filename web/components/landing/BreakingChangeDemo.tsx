// components/landing/BreakingChangeDemo.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import {
  WarningIcon,
  ArrowRightIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"

type State = "idle" | "warning" | "cancelled" | "forced"

export function BreakingChangeDemo() {
  const [state, setState] = useState<State>("idle")
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  function reset() {
    setState("idle")
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-4xl mx-auto px-4 sm:px-6"
    >
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">Breaking change gate</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
          Stop damage{" "}
          <span className="text-zinc-500">before it ships.</span>
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm">
          Click publish and see what Anurag sees before his change reaches Shruti's frontend.
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0D1117] overflow-hidden shadow-2xl shadow-black/30">
        {/* Editor header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-amber-500/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-xs text-zinc-500 font-mono">orders-api — contract editor</span>
          </div>
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="publish"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={() => setState("warning")}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-7 px-4 shadow-lg shadow-indigo-500/25"
                >
                  Publish v1.2
                  <ArrowRightIcon size={12} className="ml-1.5" />
                </Button>
              </motion.div>
            )}
            {(state === "cancelled" || state === "forced") && (
              <motion.button
                key="reset"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={reset}
                className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-2"
              >
                Reset demo →
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Diff view */}
        <div className="p-5 font-mono text-xs space-y-1 min-h-36">
          <div className="text-zinc-500 mb-3">// Order schema — v1.1 → v1.2</div>
          <div className="flex items-center gap-3">
            <span className="text-red-400/70 bg-red-500/10 px-2 py-0.5 rounded w-full line-through">
              totalAmount: number
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded w-full">
              price: number
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-red-400/70 bg-red-500/10 px-2 py-0.5 rounded w-full line-through">
              userDetails: UserDetails
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded w-full">
              user: User
            </span>
          </div>
        </div>

        {/* Warning gate */}
        <AnimatePresence>
          {state === "warning" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="border-t border-amber-500/20 bg-amber-500/5 p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-amber-400">
                <WarningIcon size={16} weight="fill" />
                <span className="font-semibold text-sm">Breaking Changes Detected — Review Before Publishing</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {[
                  "totalAmount: number  →  price: number",
                  "userDetails object   →  user object",
                ].map((change) => (
                  <div key={change} className="flex items-center gap-2 text-red-400">
                    <XCircleIcon size={12} weight="fill" />
                    {change}
                  </div>
                ))}
              </div>

              <div className="text-xs text-zinc-400 space-y-1">
                <p className="text-zinc-500 font-mono mb-2">Teams affected:</p>
                {[
                  "Shruti — Frontend Team (pulled 3 days ago)",
                  "Rahul — Mobile Team (pulled 1 day ago)",
                  "PayCo — External Partner (on v1.0)",
                ].map((team) => (
                  <div key={team} className="flex items-center gap-2 font-mono">
                    <span className="text-amber-400/60">→</span>
                    <span>{team}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  onClick={() => setState("cancelled")}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-zinc-300 hover:bg-white/5 text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setState("forced")}
                  size="sm"
                  className="bg-red-600/80 hover:bg-red-600 text-white text-xs h-8 border-0"
                >
                  Force Publish — I know what I'm doing
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result states */}
        <AnimatePresence>
          {state === "cancelled" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-2 text-emerald-400 text-sm"
            >
              <CheckCircleIcon size={16} weight="fill" />
              Publish cancelled — Shruti's checkout is safe. Talk to Anurag first.
            </motion.div>
          )}
          {state === "forced" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-red-500/20 bg-red-500/5 px-5 py-4 space-y-1"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                <WarningIcon size={16} weight="fill" />
                Published. Slack alerts sent to 3 teams.
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                → Shruti — components/OrderCard.tsx (line 24, 31) needs update
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}