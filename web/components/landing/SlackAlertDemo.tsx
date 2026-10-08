// components/landing/SlackAlertDemo.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { BellIcon, ArrowRightIcon } from "@phosphor-icons/react"

const ALERT_LINES = [
  { delay: 0,   text: "⚠️  Orders API — Breaking Change — Alex", bold: true },
  { delay: 300, text: "v1.1 → v1.2", muted: true },
  { delay: 700, text: "" },
  { delay: 800, text: "Breaking changes:", bold: true },
  { delay: 1000, text: "  ❌ totalAmount: number  →  price: number" },
  { delay: 1300, text: "  ❌ userDetails object   →  user object" },
  { delay: 1700, text: "" },
  { delay: 1800, text: "Files that need updating:", bold: true },
  { delay: 2000, text: "  → components/OrderCard.tsx (line 24, 31)" },
  { delay: 2300, text: "  → pages/checkout.tsx (line 67)" },
  { delay: 2600, text: "  → hooks/useOrders.ts (line 12)" },
  { delay: 3000, text: "" },
  { delay: 3100, text: "Updated types ready ✅  |  View diff →  |  Rollback →", accent: true },
]

export function SlackAlertDemo() {
  const [playing, setPlaying] = useState(false)
  const [visibleCount, setVisibleCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  function play() {
    setPlaying(true)
    setVisibleCount(0)
    ALERT_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleCount(i + 1), line.delay)
    })
  }

  const visible = ALERT_LINES.slice(0, visibleCount)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-4xl mx-auto px-6"
    >
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">Team alerts</p>
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          Sarah knows in{" "}
          <span className="text-indigo-400">30 seconds.</span>
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm">
          Alex publishes → Invokix detects the exact diff → every affected consumer notified instantly.
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#1A1D21] overflow-hidden shadow-2xl shadow-black/30">
        {/* Slack-style header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-white/2">
          <div className="h-7 w-7 rounded-lg bg-[#4A154B] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">#</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">engineering-alerts</p>
            <p className="text-[10px] text-zinc-500">Invokix · just now</p>
          </div>
          <div className="ml-auto">
            {!playing ? (
              <Button
                onClick={play}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-7 px-3 shadow-lg shadow-indigo-500/20"
              >
                <BellIcon size={12} className="mr-1.5" />
                Simulate alert
              </Button>
            ) : (
              <button
                onClick={() => { setPlaying(false); setVisibleCount(0) }}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Message body */}
        <div className="p-5 font-mono text-xs leading-relaxed min-h-40 space-y-0.5">
          <AnimatePresence>
            {visible.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`${
                  line.bold ? "text-white font-semibold" :
                  line.muted ? "text-zinc-500" :
                  line.accent ? "text-indigo-400" :
                  "text-zinc-300"
                } ${line.text === "" ? "h-2" : ""}`}
              >
                {line.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {!playing && (
            <p className="text-zinc-600 text-[11px] mt-4">
              ↑ Click "Simulate alert" to see what your team receives
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}