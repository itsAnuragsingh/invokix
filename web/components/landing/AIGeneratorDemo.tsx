// components/landing/AIGeneratorDemo.tsx
"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useInView } from "react-intersection-observer"

// ── Types ─────────────────────────────────────────────────────────────────────
type Mode = "generate" | "extend"
type Phase = "idle" | "thinking" | "done"

// ── Config ────────────────────────────────────────────────────────────────────
const GENERATE_PROMPT = `Orders API — users can create orders, view history, cancel pending orders. Each order has line items, total price and status. JWT auth. Razorpay for payments.`

const EXTEND_PROMPT = `Add a reviews endpoint — users can leave a 1–5 star review on delivered orders. Include reviewer name, rating, and comment.`

const GENERATE_OUTPUTS = [
  { label: "OpenAPI 3.0 spec",     color: "indigo" },
  { label: "TypeScript types",     color: "violet" },
  { label: "React Query v5 hooks", color: "blue"   },
  { label: "Zod schemas",          color: "cyan"   },
  { label: "Mock server URL",      color: "emerald"},
]

const EXTEND_OUTPUTS = [
  { label: "POST /reviews added",      color: "emerald" },
  { label: "GET /reviews/:orderId",    color: "emerald" },
  { label: "ReviewSchema merged",      color: "violet"  },
  { label: "useCreateReview hook",     color: "blue"    },
  { label: "10 existing endpoints kept", color: "zinc" },
]

const GENERATE_CODE = `export type Order = {
  id: string
  price: number
  status: "pending" | "shipped" | "delivered"
  user: { name: string; email: string }
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}`

const EXTEND_CODE = `// Merged into existing spec — nothing deleted
export type Review = {
  id: string
  orderId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  reviewerName: string
  createdAt: string
}`

const CHIP_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  indigo:  { bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  text: "text-indigo-300",  dot: "bg-indigo-400"  },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-300",  dot: "bg-violet-400"  },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-300",    dot: "bg-blue-400"    },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    text: "text-cyan-300",    dot: "bg-cyan-400"    },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-300", dot: "bg-emerald-400" },
  zinc:    { bg: "bg-white/5",        border: "border-white/10",       text: "text-zinc-400",    dot: "bg-zinc-500"    },
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AIGeneratorDemo() {
  const [mode, setMode] = useState<Mode>("generate")
  const [phase, setPhase] = useState<Phase>("idle")
  const [chipsVisible, setChipsVisible] = useState(0)
  const [codeVisible, setCodeVisible] = useState(false)
  const [scoreVisible, setScoreVisible] = useState(false)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  function clearAll() {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }

  function push(fn: () => void, ms: number) {
    timeouts.current.push(setTimeout(fn, ms))
  }

  function handleGenerate() {
    if (phase === "thinking") return
    clearAll()
    setPhase("thinking")
    setChipsVisible(0)
    setCodeVisible(false)
    setScoreVisible(false)

    const outputs = mode === "generate" ? GENERATE_OUTPUTS : EXTEND_OUTPUTS

    // After thinking delay — reveal outputs
    push(() => setPhase("done"), 1600)

    outputs.forEach((_, i) => {
      push(() => setChipsVisible(i + 1), 1600 + i * 200)
    })

    push(() => setCodeVisible(true), 1600 + outputs.length * 200 + 100)
    push(() => setScoreVisible(true), 1600 + outputs.length * 200 + 400)
  }

  function handleModeSwitch(m: Mode) {
    if (m === mode) return
    clearAll()
    setMode(m)
    setPhase("idle")
    setChipsVisible(0)
    setCodeVisible(false)
    setScoreVisible(false)
  }

  const outputs = mode === "generate" ? GENERATE_OUTPUTS : EXTEND_OUTPUTS
  const prompt  = mode === "generate" ? GENERATE_PROMPT  : EXTEND_PROMPT
  const code    = mode === "generate" ? GENERATE_CODE    : EXTEND_CODE

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-6"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">Only tool that does this</span>
        </div>
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          Plain English.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            Full contract.
          </span>{" "}
          <span className="text-zinc-500">3 seconds.</span>
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm">
          Type what your API does. Invokix generates the entire contract — spec, types, hooks, schemas — instantly.
          Already have a contract? Extend it without losing anything.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-white/4 border border-white/8 rounded-xl p-1 gap-1">
          {(["generate", "extend"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === m
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {m === "generate" ? "✦ Generate" : "⊕ Extend existing"}
            </button>
          ))}
        </div>
      </div>

      {/* Mode description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-center text-xs text-zinc-500 mb-8 max-w-md mx-auto"
        >
          {mode === "generate"
            ? "Start from scratch — describe your API in plain English and get a full contract in seconds."
            : "AI reads your existing contract and adds new endpoints — never overwrites or deletes what you have."
          }
        </motion.p>
      </AnimatePresence>

      {/* Main card */}
      <div className="rounded-2xl border border-white/8 bg-[#0D1117] overflow-hidden shadow-2xl shadow-black/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">

          {/* Left — input */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-[9px] text-indigo-400 font-bold">AI</span>
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                {mode === "generate" ? "Describe your API" : "Describe what to add"}
              </span>
              {mode === "extend" && (
                <span className="ml-auto text-[10px] text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                  merges safely
                </span>
              )}
            </div>

            {/* Textarea */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`rounded-xl border p-4 min-h-32 transition-colors duration-300 ${
                  phase === "thinking"
                    ? "border-indigo-500/30 bg-indigo-500/5"
                    : "border-white/8 bg-white/2"
                }`}
              >
                <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                  {prompt}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Extend note */}
            {mode === "extend" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3"
              >
                <span className="text-emerald-400 text-sm shrink-0">⊕</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  AI has read your <span className="text-white font-medium">existing 10 endpoints</span>.
                  New endpoints will be merged in — nothing deleted.
                </p>
              </motion.div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={phase === "thinking"}
              className={`w-full h-10 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                phase === "thinking"
                  ? "bg-indigo-600/50 text-indigo-300/70 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
              }`}
            >
              {phase === "thinking" ? (
                <>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                  Generating...
                </>
              ) : (
                <>
                  {mode === "generate" ? "✦ Generate contract" : "⊕ Extend contract"}
                </>
              )}
            </button>

            {phase === "idle" && (
              <p className="text-center text-[11px] text-zinc-600">
                Click to see what Invokix generates ↑
              </p>
            )}
          </div>

          {/* Right — output */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-zinc-500 font-medium">Output</span>
              {phase === "done" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5"
                >
                  {mode === "generate" ? "Ready in 2.8s" : "Merged in 1.9s"}
                </motion.span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-48 rounded-xl border border-dashed border-white/8 gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-white/3 border border-white/8 flex items-center justify-center">
                    <span className="text-zinc-600 text-lg">✦</span>
                  </div>
                  <p className="text-xs text-zinc-600 text-center max-w-40">
                    Your generated contract will appear here
                  </p>
                </motion.div>
              )}

              {(phase === "thinking" || phase === "done") && (
                <motion.div
                  key="output"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-8">
                    {outputs.slice(0, chipsVisible).map((out) => {
                      const c = CHIP_COLORS[out.color]
                      return (
                        <motion.div
                          key={out.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium ${c.bg} ${c.border} ${c.text}`}
                        >
                          <div className={`h-1 w-1 rounded-full ${c.dot}`} />
                          {out.label}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Code preview */}
                  {codeVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-xl border border-white/6 bg-[#22272e] p-4 overflow-x-auto"
                    >
                      <pre className="font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre">
                        {code}
                      </pre>
                    </motion.div>
                  )}

                  {/* Health score */}
                  {scoreVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500">Contract health</span>
                        <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                          {mode === "generate" ? "91" : "94"} / 100
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: mode === "generate" ? "91%" : "94%" }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer bar */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/1 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-zinc-600">
              Free plan: Groq Llama 4 · Team plan: Claude Haiku · BYOK: your own key
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] text-indigo-400/60">No competitor does this</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}