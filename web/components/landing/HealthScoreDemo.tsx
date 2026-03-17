// components/landing/HealthScoreDemo.tsx
"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useInView } from "react-intersection-observer"

const ISSUES = [
  { severity: "warn",  text: "GET /orders — missing 401 error schema" },
  { severity: "warn",  text: "POST /orders — 3 request fields have no description" },
  { severity: "error", text: "userDetails — deprecated field with no sunset date" },
  { severity: "error", text: "Naming conflict — user_id vs userId across 3 endpoints" },
]

const TARGET_SCORE = 76

export function HealthScoreDemo() {
  const [score, setScore] = useState(0)
  const [visibleIssues, setVisibleIssues] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  useEffect(() => {
    if (!inView) return

    // Animate score counter
    let current = 0
    const step = TARGET_SCORE / 60
    const interval = setInterval(() => {
      current = Math.min(current + step, TARGET_SCORE)
      setScore(Math.floor(current))
      if (current >= TARGET_SCORE) clearInterval(interval)
    }, 16)

    // Reveal issues one by one
    ISSUES.forEach((_, i) => {
      setTimeout(() => setVisibleIssues(i + 1), 800 + i * 300)
    })

    return () => clearInterval(interval)
  }, [inView])

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-4xl mx-auto px-4 sm:px-6"
    >
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">Health score</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
          Your API,{" "}
          <span className="text-zinc-500">scored live.</span>
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm">
          Every contract gets a 0–100 score with specific, fixable issues. Developers obsess over hitting 100.
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {/* Score ring */}
          <div className="flex flex-col items-center justify-center p-10 space-y-4">
            <div className="relative">
              <svg width="140" height="140" className="-rotate-90">
                <circle
                  cx="70" cy="70" r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="10"
                />
                <circle
                  cx="70" cy="70" r="54"
                  fill="none"
                  stroke={color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 0.016s linear, stroke 0.3s" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-bold text-white">{score}</span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 text-center max-w-32">
              Fix all issues to reach <span className="text-emerald-400">100 / 100</span>
            </p>
          </div>

          {/* Issues list */}
          <div className="p-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Issues ({ISSUES.length} found)
            </p>
            {ISSUES.map((issue, i) => (
              <motion.div
                key={issue.text}
                initial={{ opacity: 0, x: 12 }}
                animate={i < visibleIssues ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2.5"
              >
                <span className={`text-sm shrink-0 mt-0.5 ${
                  issue.severity === "error" ? "text-red-400" : "text-amber-400"
                }`}>
                  {issue.severity === "error" ? "❌" : "⚠️"}
                </span>
                <span className="text-xs text-zinc-400 leading-relaxed">{issue.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}