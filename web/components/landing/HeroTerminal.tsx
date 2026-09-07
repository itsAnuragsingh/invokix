// components/landing/HeroTerminal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

// ── Act 1 config ─────────────────────────────────────────────────────────────
const PROMPT_FULL = "Orders API — users can create orders, view history, cancel pending orders. Each order has line items, total price and status. JWT auth."
const TYPING_SPEED = 28 // ms per char

const OUTPUT_CHIPS = [
  { label: "OpenAPI 3.0 spec",     color: "indigo",  delay: 0 },
  { label: "TypeScript types",     color: "violet",  delay: 180 },
  { label: "React Query v5 hooks", color: "blue",    delay: 360 },
  { label: "Zod schemas",          color: "cyan",    delay: 540 },
]

// ── Act 2 config ──────────────────────────────────────────────────────────────
const TERMINAL_STEPS = [
  { delay: 0,    type: "input",   text: "$ npx invokix pull" },
  { delay: 700,  type: "output",  text: "✔ Authenticated: anurag@startup.com" },
  { delay: 1200, type: "output",  text: "✔ Contract: Orders API (v1.0)" },
  { delay: 1700, type: "output",  text: "✔ Writing: src/types/orders.ts" },
  { delay: 2100, type: "output",  text: "✔ Writing: src/hooks/useOrders.ts" },
  { delay: 2500, type: "output",  text: "✔ Writing: src/schemas/orders.ts" },
  { delay: 3000, type: "success", text: "All outputs synced to v1.0 ✓" },
  { delay: 4000, type: "blank",   text: "" },
  { delay: 4200, type: "input",   text: "$ invokix publish" },
  { delay: 5000, type: "warning", text: "⚠  Breaking Change Detected" },
  { delay: 5500, type: "warning", text: "   totalAmount → price (3 teams affected)" },
  { delay: 6000, type: "warning", text: "   Cancel or force publish?" },
]

const ACT2_DURATION = 8000
const RESTART_PAUSE = 2500

function getTerminalColor(type: string) {
  if (type === "input")   return "text-white"
  if (type === "success") return "text-emerald-400"
  if (type === "warning") return "text-amber-400"
  return "text-zinc-400"
}

const CHIP_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-300", dot: "bg-indigo-400" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-300", dot: "bg-violet-400" },
  blue:   { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-300",   dot: "bg-blue-400" },
  cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-300",   dot: "bg-cyan-400" },
}

export function HeroTerminal() {
  const [act, setAct] = useState<"act1" | "act2">("act1")

  // Act 1 state
  const [typedText, setTypedText] = useState("")
  const [act1Phase, setAct1Phase] = useState<"typing" | "thinking" | "done" | "idle">("idle")
  const [chipsVisible, setChipsVisible] = useState(0)
  const [scoreVisible, setScoreVisible] = useState(false)

  // Act 2 state
  const [terminalCount, setTerminalCount] = useState(0)
  const [cursor, setCursor] = useState(true)

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  function push(fn: () => void, ms: number) {
    timeouts.current.push(setTimeout(fn, ms))
  }

  function clearAll() {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }

  function startAct1() {
    setAct("act1")
    setTypedText("")
    setAct1Phase("typing")
    setChipsVisible(0)
    setScoreVisible(false)
    setTerminalCount(0)

    const chars = PROMPT_FULL.split("")
    chars.forEach((_, i) => {
      push(() => setTypedText(PROMPT_FULL.slice(0, i + 1)), i * TYPING_SPEED)
    })

    const typingDone = chars.length * TYPING_SPEED

    push(() => setAct1Phase("thinking"), typingDone + 200)

    const thinkingDuration = 1400
    push(() => setAct1Phase("done"), typingDone + 200 + thinkingDuration)

    OUTPUT_CHIPS.forEach((chip, i) => {
      push(
        () => setChipsVisible(i + 1),
        typingDone + 200 + thinkingDuration + 200 + chip.delay
      )
    })

    const lastChipDelay = OUTPUT_CHIPS[OUTPUT_CHIPS.length - 1].delay
    push(() => setScoreVisible(true), typingDone + 200 + thinkingDuration + 200 + lastChipDelay + 400)

    const act1Total = typingDone + 200 + thinkingDuration + 200 + lastChipDelay + 2200
    push(() => startAct2(), act1Total)
  }

  function startAct2() {
    setAct("act2")
    setTerminalCount(0)

    TERMINAL_STEPS.forEach((step, i) => {
      push(() => setTerminalCount(i + 1), step.delay)
    })

    push(() => {
      push(() => startAct1(), RESTART_PAUSE)
    }, ACT2_DURATION)
  }

  useEffect(() => {
    const init = setTimeout(() => startAct1(), 600)
    const cursorInterval = setInterval(() => setCursor((c) => !c), 530)
    return () => {
      clearAll()
      clearTimeout(init)
      clearInterval(cursorInterval)
    }
  }, [])

  const terminalVisible = TERMINAL_STEPS.slice(0, terminalCount)

  return (
    <div className="relative rounded-none border border-[#B7FF3C]/55 bg-[#0D1117] overflow-hidden shadow-2xl shadow-black/50">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-white/2">
        <div className="h-3 w-3 rounded-full bg-red-500/70" />
        <div className="h-3 w-3 rounded-full bg-amber-500/70" />
        <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
        <span className="ml-3 text-[11px] text-zinc-500 font-mono">invokix</span>
        <div className="ml-auto">
          <AnimatePresence mode="wait">
            <motion.span
              key={act}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                act === "act1"
                  ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/10"
                  : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
              }`}
            >
              {act === "act1" ? "✦ AI generate" : "$ CLI sync"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-64 relative">
        <AnimatePresence mode="wait">

          {/* ACT 1 — UI card */}
          {act === "act1" && (
            <motion.div
              key="act1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-5 space-y-4"
            >
              {/* Label */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-[9px] text-indigo-400 font-bold">AI</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-medium">Generate from plain English</span>
              </div>

              {/* Input box */}
              <div className={`rounded-xl border transition-all duration-300 ${
                act1Phase === "thinking"
                  ? "border-indigo-500/40 bg-indigo-500/5"
                  : "border-white/10 bg-white/3"
              } p-3`}>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans min-h-[3rem]">
                  {typedText}
                  {act1Phase === "typing" && (
                    <span
                      className="inline-block w-[6px] h-[12px] bg-indigo-400 rounded-sm ml-0.5 align-middle"
                      style={{ opacity: cursor ? 1 : 0, transition: "opacity 0.1s" }}
                    />
                  )}
                </p>
              </div>

              {/* Phase indicator */}
              <AnimatePresence mode="wait">
                {act1Phase === "typing" && (
                  <motion.div
                    key="btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="h-7 rounded-lg bg-indigo-600/40 border border-indigo-500/30 px-3 flex items-center gap-1.5">
                      <span className="text-[10px] text-indigo-300 font-medium">Generate contract</span>
                    </div>
                    <span className="text-[10px] text-zinc-600">← typing...</span>
                  </motion.div>
                )}

                {act1Phase === "thinking" && (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-indigo-400/70">AI is generating your contract...</span>
                  </motion.div>
                )}

                {act1Phase === "done" && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-medium">Contract ready — 2.8s</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {OUTPUT_CHIPS.slice(0, chipsVisible).map((chip) => {
                        const c = CHIP_COLORS[chip.color]
                        return (
                          <motion.div
                            key={chip.label}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium ${c.bg} ${c.border} ${c.text}`}
                          >
                            <div className={`h-1 w-1 rounded-full ${c.dot}`} />
                            {chip.label}
                          </motion.div>
                        )
                      })}
                    </div>

                    {scoreVisible && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2 pt-0.5"
                      >
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "91%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                          />
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono font-semibold shrink-0">
                          Health 91/100
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ACT 2 — terminal */}
          {act === "act2" && (
            <motion.div
              key="act2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-5 font-mono text-xs leading-relaxed space-y-1"
            >
              <AnimatePresence mode="popLayout">
                {terminalVisible.map((step, i) => (
                  step.type !== "blank" && (
                    <motion.div
                      key={`${i}-${step.text}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className={getTerminalColor(step.type)}
                    >
                      {step.text}
                    </motion.div>
                  )
                ))}
              </AnimatePresence>

              <div className="flex items-center gap-1.5 text-zinc-500 mt-1">
                <span>$</span>
                <span
                  className="inline-block w-[7px] h-[13px] bg-indigo-400 rounded-sm"
                  style={{ opacity: cursor ? 1 : 0, transition: "opacity 0.1s" }}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-indigo-500/6 to-transparent pointer-events-none" />
    </div>
  )
}
