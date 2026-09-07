// components/landing/InteractiveWorkbench.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import {
  RobotIcon,
  TerminalIcon,
  WarningIcon,
  HeartbeatIcon,
  SlackLogoIcon,
  CheckIcon,
  CheckCircleIcon,
  WarningOctagonIcon
} from "@phosphor-icons/react"

// ── Tab Types ──
type TabId = "ai-builder" | "cli-sync" | "breaking-gate" | "health-score" | "slack-alerts"

interface TabConfig {
  id: TabId
  icon: any
  title: string
  subtitle: string
  badge?: string
}

// ── Data & Setup ──
const TABS: TabConfig[] = [
  {
    id: "ai-builder",
    icon: RobotIcon,
    title: "AI Contract Builder",
    subtitle: "Describe your API in plain English to generate standard specs.",
    badge: "Most Popular",
  },
  {
    id: "cli-sync",
    icon: TerminalIcon,
    title: "CLI Sync Engine",
    subtitle: "Instantly pull and update types, hooks, and schemas.",
  },
  {
    id: "breaking-gate",
    icon: WarningIcon,
    title: "Breaking Change Gate",
    subtitle: "Detect breaking modifications and protect client teams.",
  },
  {
    id: "health-score",
    icon: HeartbeatIcon,
    title: "Contract Auditor",
    subtitle: "Live scanning of OpenAPI specs with fixable issue guides.",
  },
  {
    id: "slack-alerts",
    icon: SlackLogoIcon,
    title: "Consumer Alerting",
    subtitle: "Automatically notify affected users and downstream devs.",
  },
]

export function InteractiveWorkbench() {
  const [activeTab, setActiveTab] = useState<TabId>("ai-builder")
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  // ── Tab 0 (AI Builder) State ──
  const [promptInput, setPromptInput] = useState(
    "Orders API - users can create orders, cancel pending ones. Each order has price, line items and status. Requires JWT auth."
  )
  const [aiState, setAiState] = useState<"idle" | "generating" | "complete">("idle")
  const [aiOutputChips, setAiOutputChips] = useState<string[]>([])
  
  // ── Tab 1 (CLI Sync) State ──
  const [cliState, setCliState] = useState<"idle" | "running" | "success">("idle")
  const [cliLogs, setCliLogs] = useState<string[]>([])

  // ── Tab 2 (Breaking Gate) State ──
  const [gateState, setGateState] = useState<"idle" | "warning" | "cancelled" | "forced">("idle")

  // ── Tab 3 (Health Score) State ──
  const [healthScore, setHealthScore] = useState(0)
  const [healthIssuesVisible, setHealthIssuesVisible] = useState(0)

  // ── Tab 4 (Slack Alerts) State ──
  const [slackAlerts, setSlackAlerts] = useState<string[]>([])
  const [slackState, setSlackState] = useState<"idle" | "sending" | "sent">("idle")

  // Cleanup timers on switch or unmount
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }
  const addTimeout = (fn: () => void, ms: number) => {
    timeouts.current.push(setTimeout(fn, ms))
  }

  useEffect(() => {
    clearTimeouts()
    // Trigger animations when switching tabs
    if (activeTab === "health-score") {
      setHealthScore(0)
      setHealthIssuesVisible(0)
      let current = 0
      const target = 82
      const interval = setInterval(() => {
        current = Math.min(current + 2, target)
        setHealthScore(current)
        if (current >= target) clearInterval(interval)
      }, 20)
      
      const issueDelays = [600, 1000, 1400, 1800]
      issueDelays.forEach((delay, idx) => {
        addTimeout(() => setHealthIssuesVisible(idx + 1), delay)
      })

      return () => clearInterval(interval)
    }
  }, [activeTab])

  // ── Handlers ──
  const handleAISpecGenerate = () => {
    if (aiState === "generating") return
    setAiState("generating")
    setAiOutputChips([])
    clearTimeouts()

    addTimeout(() => {
      setAiState("complete")
      const chips = ["OpenAPI 3.0", "TypeScript types", "React Query Hooks", "Zod schemas", "Mock API URL"]
      chips.forEach((chip, idx) => {
        addTimeout(() => {
          setAiOutputChips((prev) => [...prev, chip])
        }, idx * 180)
      })
    }, 1500)
  }

  const handleCLIRun = () => {
    if (cliState === "running") return
    setCliState("running")
    setCliLogs([])
    clearTimeouts()

    const logSteps = [
      { text: "$ npx invokix pull", delay: 0 },
      { text: "✔ Authenticated: developer@startup.com", delay: 600 },
      { text: "✔ Fetching Orders API schema (v1.2)...", delay: 1200 },
      { text: "✔ Syncing src/types/orders.ts", delay: 1800 },
      { text: "✔ Syncing src/hooks/useOrders.ts", delay: 2300 },
      { text: "All client files synced successfully! (v1.2) ✓", delay: 2800 },
    ]

    logSteps.forEach((step, idx) => {
      addTimeout(() => {
        setCliLogs((prev) => [...prev, step.text])
        if (idx === logSteps.length - 1) {
          setCliState("success")
        }
      }, step.delay)
    })
  }

  const handleSlackAlertTrigger = () => {
    if (slackState === "sending") return
    setSlackState("sending")
    setSlackAlerts([])
    clearTimeouts()

    const lines = [
      "🚨 INVOKIX ALERT: Breaking changes published to API contract Orders API (v1.2) by Anurag",
      "Affected downstream files discovered:",
      "  ↳ frontend/components/OrderGrid.tsx (line 42) -> totalAmount property updated to price",
      "  ↳ mobile/src/hooks/useCheckout.ts (line 119) -> userDetails updated to user",
      "Slack notify sent to #frontend-team, #mobile-team, and #partner-devs.",
      "TypeScript types & React Query hooks ready. Run 'npx invokix pull' to sync."
    ]

    lines.forEach((line, idx) => {
      addTimeout(() => {
        setSlackAlerts((prev) => [...prev, line])
        if (idx === lines.length - 1) {
          setSlackState("sent")
        }
      }, idx * 400)
    })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-6 py-12"
      id="workbench"
    >
      {/* Title */}
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          The Interactive Workbench
        </span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mt-4 tracking-tight">
          All your API workflows,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
            in one screen.
          </span>
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base mt-3 leading-relaxed">
          Toggle through the interactive modules below to see how Invokix keeps your frontend, backend, and external partners in perfect alignment.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Tab list */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-start gap-4 p-4 text-left rounded-2xl border transition-all duration-300 group ${
                  isActive
                    ? "bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                    : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                }`}
              >
                {/* Active Indicator Ring */}
                {isActive && (
                  <motion.div
                    layoutId="active-workbench-glow"
                    className="absolute inset-0 rounded-2xl border border-indigo-500/30 pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className={`p-2.5 rounded-xl border transition-colors duration-300 ${
                  isActive
                    ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                    : "bg-white/5 border-white/5 text-zinc-500 group-hover:text-zinc-300"
                }`}>
                  <Icon size={20} weight={isActive ? "fill" : "regular"} />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    }`}>
                      {tab.title}
                    </span>
                    {tab.badge && (
                      <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-2 py-0.5 uppercase tracking-wider">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400">
                    {tab.subtitle}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right: Dashboard Preview Frame */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl border border-white/[0.08] bg-[#0A0D14]/90 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden min-h-[420px]">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-amber-500/70" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
              <span className="text-xs text-zinc-500 font-mono ml-2">invokix://workbench/{activeTab}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Live Demo
            </div>
          </div>

          {/* Interactive Pane Body */}
          <div className="flex-1 p-6 relative overflow-hidden flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* TAB 0: AI Builder */}
              {activeTab === "ai-builder" && (
                <motion.div
                  key="ai-builder"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <label className="text-xs text-zinc-500 font-medium font-mono">1. ENTER SPECIFICATION PROMPT</label>
                    <div className="relative">
                      <textarea
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        className="w-full min-h-24 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-sm text-zinc-300 font-sans focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/[0.01] transition-all resize-none"
                      />
                      <span className="absolute bottom-3 right-4 text-[10px] text-zinc-600 font-mono">Plain English</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleAISpecGenerate}
                      disabled={aiState === "generating"}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        aiState === "generating"
                          ? "bg-indigo-600/40 text-indigo-200/50 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20"
                      }`}
                    >
                      {aiState === "generating" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 bg-indigo-200 rounded-full animate-bounce delay-100" />
                          <span className="h-1.5 w-1.5 bg-indigo-200 rounded-full animate-bounce delay-200" />
                          <span className="h-1.5 w-1.5 bg-indigo-200 rounded-full animate-bounce delay-300" />
                          Analyzing and generating spec modules...
                        </div>
                      ) : (
                        <>
                          <RobotIcon size={16} weight="fill" />
                          Generate API Contract & SDK
                        </>
                      )}
                    </button>

                    {/* Outputs */}
                    <AnimatePresence>
                      {aiState === "complete" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3 pt-2"
                        >
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                            <CheckIcon size={14} weight="bold" />
                            Generated SDK and specs successfully in 1.5s:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {aiOutputChips.map((chip, i) => (
                              <motion.span
                                key={chip}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="px-3 py-1 rounded-full text-[10px] font-semibold font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1.5"
                              >
                                <span className="h-1 w-1 rounded-full bg-indigo-400" />
                                {chip}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* TAB 1: CLI Sync */}
              {activeTab === "cli-sync" && (
                <motion.div
                  key="cli-sync"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3 flex-1">
                    <label className="text-xs text-zinc-500 font-medium font-mono">2. SIMULATE LOCAL SYNCING</label>
                    <div className="bg-[#080B10] rounded-2xl border border-white/5 p-4 font-mono text-xs text-zinc-400 min-h-36 leading-relaxed space-y-1">
                      {cliLogs.length === 0 && (
                        <span className="text-zinc-600">// Click run below to sync API to codebase</span>
                      )}
                      {cliLogs.map((log, index) => {
                        const isSuccess = log.includes("success") || log.includes("✔")
                        const isCommand = log.startsWith("$")
                        return (
                          <div
                            key={index}
                            className={`${
                              isSuccess ? "text-emerald-400" :
                              isCommand ? "text-white font-semibold" :
                              "text-zinc-400"
                            }`}
                          >
                            {log}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCLIRun}
                      disabled={cliState === "running"}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        cliState === "running"
                          ? "bg-indigo-600/40 text-indigo-200/50 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20"
                      }`}
                    >
                      <TerminalIcon size={16} />
                      {cliState === "running" ? "Running invokix sync..." : "Run 'npx invokix pull'"}
                    </button>
                    {cliState === "success" && (
                      <p className="text-center text-[10px] text-zinc-500">
                        TypeScript types, Zod validation files, and hooks updated in local workspace!
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: Breaking Gate */}
              {activeTab === "breaking-gate" && (
                <motion.div
                  key="breaking-gate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <label className="text-xs text-zinc-500 font-medium font-mono">3. API SCHEMA DIFF DETECTED</label>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 font-mono text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">// Orders Schema Update</div>
                      <div className="flex items-center gap-2 text-red-400 bg-red-500/5 px-2 py-1 rounded">
                        <span className="line-through">totalAmount: number</span>
                        <span className="text-zinc-600">→</span>
                        <span className="font-semibold text-white">price: number</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-400 bg-red-500/5 px-2 py-1 rounded">
                        <span className="line-through">userDetails: object</span>
                        <span className="text-zinc-600">→</span>
                        <span className="font-semibold text-white">user: object</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {gateState === "idle" && (
                      <div className="flex flex-col gap-3">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                          <WarningOctagonIcon size={18} className="text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Publishing this contract will break <span className="text-white font-medium">3 frontend and mobile components</span>. How do you want to proceed?
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setGateState("cancelled")}
                            className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-300 text-xs font-semibold transition-all"
                          >
                            Cancel Publish
                          </button>
                          <button
                            onClick={() => setGateState("forced")}
                            className="py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-all"
                          >
                            Force Publish (Alert Teams)
                          </button>
                        </div>
                      </div>
                    )}

                    {gateState === "cancelled" && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-2 text-center">
                        <CheckCircleIcon size={28} className="text-emerald-400" />
                        <p className="text-xs text-emerald-400 font-semibold">Publish Cancelled Safely</p>
                        <p className="text-[11px] text-zinc-400 max-w-sm">
                          Downstream builds protected. Reverting schema to avoid breaking mobile/web code.
                        </p>
                        <button
                          onClick={() => setGateState("idle")}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300 underline mt-2"
                        >
                          Simulate again
                        </button>
                      </div>
                    )}

                    {gateState === "forced" && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center gap-2 text-center">
                        <WarningOctagonIcon size={28} className="text-red-400" />
                        <p className="text-xs text-red-400 font-semibold">Forced Publish Execution</p>
                        <p className="text-[11px] text-zinc-400 max-w-sm">
                          API published. Downstream consumers marked out-of-sync. Alerts dispatched to teams.
                        </p>
                        <button
                          onClick={() => setGateState("idle")}
                          className="text-[10px] text-zinc-500 hover:text-zinc-300 underline mt-2"
                        >
                          Simulate again
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: Contract Auditor */}
              {activeTab === "health-score" && (
                <motion.div
                  key="health-score"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-center"
                >
                  {/* Score Ring */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
                    <div className="relative">
                      <svg width="120" height="120" className="-rotate-90">
                        <circle
                          cx="60" cy="60" r="48"
                          fill="none"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="60" cy="60" r="48"
                          fill="none"
                          stroke={healthScore >= 80 ? "#10b981" : "#f59e0b"}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 - (healthScore / 100) * 2 * Math.PI * 48}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display text-3xl font-bold text-white">{healthScore}</span>
                        <span className="text-[10px] text-zinc-500">score</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-3 font-mono">Target: 82 / 100</span>
                  </div>

                  {/* Issues List */}
                  <div className="md:col-span-7 space-y-2.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">SCANNING AUDIT LOGS</span>
                    {[
                      { type: "warn", text: "GET /orders — missing 401 error schema" },
                      { type: "warn", text: "POST /orders — 3 request fields have no description" },
                      { type: "error", text: "userDetails — deprecated field with no sunset date" },
                      { type: "error", text: "userId naming conflict across 3 files" }
                    ].map((issue, idx) => (
                      <motion.div
                        key={issue.text}
                        initial={{ opacity: 0, x: 10 }}
                        animate={idx < healthIssuesVisible ? { opacity: 1, x: 0 } : { opacity: 0 }}
                        className="flex items-start gap-2.5 text-xs bg-white/[0.01] border border-white/5 p-2 rounded-lg"
                      >
                        <span className="shrink-0">{issue.type === "error" ? "❌" : "⚠️"}</span>
                        <span className="text-zinc-400 font-mono text-[11px] leading-relaxed">{issue.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: Slack Alerts */}
              {activeTab === "slack-alerts" && (
                <motion.div
                  key="slack-alerts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-500 font-medium font-mono">SLACK INTEGRATION</label>
                      <span className="text-[10px] text-zinc-500 font-mono">channel: #engineering-alerts</span>
                    </div>

                    <div className="bg-[#14171B] rounded-2xl border border-white/5 p-4 font-mono text-[11px] text-zinc-400 min-h-36 leading-relaxed space-y-1">
                      {slackAlerts.length === 0 && (
                        <div className="text-zinc-600 flex flex-col items-center justify-center py-6 gap-2">
                          <SlackLogoIcon size={32} className="text-zinc-700 animate-pulse" />
                          <span>Click simulate alert below to send Slack notifications</span>
                        </div>
                      )}
                      {slackAlerts.map((line, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`${
                            index === 0 ? "text-amber-400 font-semibold border-b border-white/5 pb-1 mb-1" :
                            line.includes("↳") ? "text-red-400/90 pl-3" :
                            line.includes("TypeScript") ? "text-indigo-400 mt-2 border-t border-white/5 pt-1" :
                            "text-zinc-300"
                          }`}
                        >
                          {line}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleSlackAlertTrigger}
                      disabled={slackState === "sending"}
                      className="w-full py-3 rounded-xl bg-[#4A154B] hover:bg-[#5E1C60] text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-black/20"
                    >
                      <SlackLogoIcon size={16} weight="fill" />
                      {slackState === "sending" ? "Dispatched Slack payload..." : "Simulate Slack Trigger"}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer stats bar */}
          <div className="px-6 py-3 border-t border-white/[0.05] bg-white/[0.01] flex items-center justify-between flex-wrap gap-2 text-[10px] text-zinc-500">
            <span>Powered by Groq Qwen 3.8 & Claude Sonnet integrations</span>
            <span className="flex items-center gap-1.5 text-indigo-400/80">
              <CheckIcon size={12} weight="bold" />
              100% Type-Safe Workflows
            </span>
          </div>

        </div>

      </div>

    </motion.div>
  )
}
