// components/landing/ProblemStory.tsx
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useInView } from "react-intersection-observer"

const ROWS = [
  {
    time: "Tue 3pm",
    person: "Alex",
    action: "renames totalAmount → price in Orders API",
    personColor: "text-indigo-400",
    actionColor: "text-zinc-300",
    glow: "from-indigo-500/0",
  },
  {
    time: "Wed 9am",
    person: "Sarah",
    action: "spends 4 hours debugging broken checkout",
    personColor: "text-amber-400",
    actionColor: "text-amber-300/80",
    glow: "from-amber-500/5",
  },
  {
    time: "Wed 2pm",
    person: "Marcus",
    action: "rewrites fetch functions from scratch. Again.",
    personColor: "text-amber-400",
    actionColor: "text-amber-300/80",
    glow: "from-amber-500/8",
  },
  {
    time: "Fri demo",
    person: "David",
    action: "wonders why the client demo is broken. Again.",
    personColor: "text-red-400",
    actionColor: "text-red-300/80",
    glow: "from-red-500/10",
  },
]

export function ProblemStory() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [started, setStarted] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  useEffect(() => {
    if (!inView || started) return
    setStarted(true)
    ROWS.forEach((_, i) => {
      setTimeout(() => setVisibleCount(i + 1), i * 900)
    })
  }, [inView])

  return (
    <div
      ref={ref}
      className="max-w-2xl mx-auto rounded-2xl border border-white/8 bg-white/2 overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-white/5 bg-white/2 flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-mono">A story you know</span>
        <span className="text-[10px] text-zinc-600 font-mono">happens every week</span>
      </div>

      <div className="divide-y divide-white/4">
        <AnimatePresence>
          {ROWS.slice(0, visibleCount).map((row, i) => (
            <motion.div
              key={row.time}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`relative flex items-start gap-4 px-5 py-4 bg-gradient-to-r ${row.glow} to-transparent`}
            >
              {/* Animated left border */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                  i === 0 ? "bg-indigo-500/40" :
                  i === 3 ? "bg-red-500/40" :
                  "bg-amber-500/40"
                } origin-top`}
              />
              <span className="text-zinc-600 font-mono text-xs shrink-0 w-14 sm:w-16 pt-0.5">{row.time}</span>
              <span className={`font-mono text-xs font-semibold shrink-0 w-12 sm:w-14 pt-0.5 ${row.personColor}`}>
                {row.person}
              </span>
              <span className={`font-mono text-xs leading-relaxed ${row.actionColor}`}>
                {row.action}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Punch line — appears after all rows */}
        <AnimatePresence>
          {visibleCount >= ROWS.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="px-5 py-4 bg-red-500/5"
            >
              <p className="text-xs text-red-400/70 font-mono text-center">
                Root cause: <span className="text-red-400 font-semibold">your API has no home.</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}