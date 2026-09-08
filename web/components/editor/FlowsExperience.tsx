// web/components/editor/FlowsExperience.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Loader2,
  XCircle,
  Code2,
  GitBranch,
  Info,
  Copy,
  Check,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { generateFlowFromOpenApi, type FlowStep } from "@/lib/analysis/flowGenerator"

type Mode = "story" | "contract" | "run"
type Status = "idle" | "running" | "complete" | "failed"

function nodeStatus(index: number, mode: Mode, runAt: number, failure: boolean): Status {
  if (mode !== "run" || runAt < 0 || index > runAt) return "idle"
  if (failure && index === 3) return "failed"
  if (index === runAt) return "running"
  return "complete"
}

export function FlowsExperience({
  projectId,
  projectName,
  contractName,
  hasContract,
  openApiSpec,
}: {
  projectId: string
  projectName: string
  contractName: string
  hasContract: boolean
  openApiSpec?: object | null
}) {
  // Auto-generate dynamic workflow from OpenAPI contract if available
  const flowData = useMemo(() => generateFlowFromOpenApi(openApiSpec ?? null), [openApiSpec])
  const steps = flowData.steps
  const connectors = flowData.connectors
  const isDynamic = flowData.hasDynamicContract

  const [mode, setMode] = useState<Mode>("story")
  const [selectedId, setSelectedId] = useState<string>(steps[0]?.id ?? "cart")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [runAt, setRunAt] = useState<number>(-1)
  const [failure, setFailure] = useState<boolean>(false)
  const [question, setQuestion] = useState<string | null>(null)
  const [thinking, setThinking] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  // Ensure active step is valid when steps change
  const activeStep: FlowStep =
    steps.find((s) => s.id === (hoveredId ?? selectedId)) ?? steps[0]

  // Run simulation timer
  useEffect(() => {
    if (mode !== "run" || runAt < 0 || runAt >= steps.length || failure) return
    const timer = window.setTimeout(() => {
      setRunAt((curr) => curr + 1)
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [mode, runAt, failure, steps.length])

  const handlePlay = () => {
    setMode("run")
    setFailure(false)
    setRunAt(0)
    if (steps[0]) setSelectedId(steps[0].id)
  }

  const handleReset = () => {
    setRunAt(-1)
    setFailure(false)
  }

  const ask = (val: string) => {
    setThinking(true)
    setQuestion(null)
    window.setTimeout(() => {
      setThinking(false)
      setQuestion(val)
    }, 280)
  }

  const copyPayload = () => {
    if (!activeStep) return
    navigator.clipboard.writeText(JSON.stringify(activeStep.mockOutput, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const getGuideAnswer = (q: string | null) => {
    if (!q || !activeStep) return null
    if (q.includes("needed") || q.includes("Why is")) {
      return `${activeStep.title} (${activeStep.method} ${activeStep.path}) establishes an atomic state in the flow. It accepts ${
        activeStep.input.length > 0
          ? activeStep.input.map((i) => i.name).join(", ")
          : "no required inputs"
      } and emits verified contract properties.`
    }
    if (q.includes("fails") || q.includes("Declined") || q.includes("error")) {
      return `If ${activeStep.title} fails with an error status (4xx/5xx), downstream actions dependent on its return keys (${
        activeStep.output.map((o) => o.name).join(", ") || "id"
      }) will not execute, preventing downstream corruption.`
    }
    if (q.includes("cartId") || q.includes("dependency")) {
      return "Dependent parameters bind the output of earlier endpoints to the input requirements of subsequent actions."
    }
    return `${activeStep.title} adheres strictly to your schema definitions, ensuring deterministic validation across consumers.`
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6 pb-12">
      {/* ─── BREADCRUMBS & TOP TITLE ────────────────────────────────────────── */}
      <header className="border-b border-border/40 pb-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <span className="text-muted-foreground/30">/</span>
          <Link
            href={`/project/${projectId}`}
            className="hover:text-foreground transition-colors"
          >
            {projectName}
          </Link>
          <span className="text-muted-foreground/30">/</span>
          <span className="text-foreground font-semibold">Flows</span>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B7FF3C] shadow-[0_0_8px_#B7FF3C]" />
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
                {isDynamic ? "Dynamic OpenAPI Workflow" : "Visual Workflow"}
              </p>
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {flowData.contractTitle ?? projectName} flow.
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {isDynamic
                ? `Auto-generated visual execution graph from your active contract (${steps.length} endpoints connected).`
                : "A node-based sequence view of how your API endpoints execute together."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {mode === "run" && runAt >= 0 && (
              <button
                onClick={handleReset}
                title="Reset simulation"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-[#111622] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handlePlay}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#B7FF3C] px-4 text-xs font-bold text-[#10100B] hover:bg-[#CAFF65] transition-all shadow-[0_0_18px_rgba(183,255,60,0.25)]"
            >
              <Play className="h-3.5 w-3.5 fill-[#10100B]" /> Run workflow
            </button>
          </div>
        </div>
      </header>

      {/* Contract Notice (Dynamic status vs Sample) */}
      {isDynamic ? (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05] px-4 py-2.5 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              <strong>Contract Synced:</strong> Parsed {steps.length} live endpoints directly from your OpenAPI specification.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400/80">
            OpenAPI 3.x
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-[#FFD15C]/30 bg-[#FFD15C]/[0.05] px-4 py-2.5 text-xs text-[#FFD15C]">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              Sample workflow active — upload or import an OpenAPI spec in your project to auto-generate your live endpoints here.
            </span>
          </div>
          <Link
            href={`/project/${projectId}`}
            className="font-bold underline hover:text-[#FFE394] shrink-0"
          >
            Import spec &rarr;
          </Link>
        </div>
      )}

      {/* ─── WORKFLOW CANVAS & INSPECTOR SECTION ────────────────────────────── */}
      <section className="overflow-hidden rounded-xl border border-border/60 bg-[#090D15] shadow-2xl">
        {/* Canvas Top Bar (n8n style) */}
        <div className="flex flex-col gap-3 border-b border-border/45 bg-[#0e131d] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary font-bold text-xs">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-foreground">
                {contractName} · {isDynamic ? "endpoints flow" : "checkout"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isDynamic
                  ? `${steps.length} endpoints sequenced by dependencies & method`
                  : "One trigger, four actions, one conditional outcome"}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg border border-border/60 bg-[#080b11] p-1">
            {(["story", "contract", "run"] as Mode[]).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMode(item)
                  if (item !== "run") setRunAt(-1)
                }}
                className={cn(
                  "rounded-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all",
                  mode === item
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TWO-COLUMN WORKFLOW STUDIO ───────────────────────────────────── */}
        <div className="relative grid gap-8 p-6 lg:grid-cols-[460px_minmax(0,1fr)] lg:p-8">
          {/* Background Dot Grid Pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(rgba(174, 140, 255, 0.25) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* ─── LEFT COLUMN: WORKFLOW NODES ────────────────────────────────── */}
          <div className="relative mx-auto w-full max-w-[460px] space-y-0">
            {/* Flow Header Tag */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-[#B7FF3C] shadow-[0_0_8px_#B7FF3C]" />
                Pipeline sequence
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {steps.length} Endpoints
              </span>
            </div>

            {/* DYNAMIC CONTRACT STEPS */}
            {steps.map((step, index) => {
              const status = nodeStatus(index, mode, runAt, failure)
              const isSelected = activeStep.id === step.id

              return (
                <div key={step.id}>
                  <CleanNodeCard
                    step={step}
                    mode={mode}
                    status={status}
                    isSelected={isSelected}
                    onClick={() => setSelectedId(step.id)}
                    onHover={() => setHoveredId(step.id)}
                    onLeave={() => setHoveredId(null)}
                  />

                  {index < steps.length - 1 && (
                    <CleanConnector
                      label={connectors[index] ?? "status: 200"}
                      active={mode === "run" ? runAt > index : true}
                      isTravelling={mode === "run" && runAt === index + 1}
                    />
                  )}
                </div>
              )
            })}

            {/* If fallback sample, include sample Decision Branch */}
            {!isDynamic && (
              <>
                <CleanConnector
                  label={failure ? "retry payment" : "paid"}
                  active={!failure}
                  isTravelling={mode === "run" && runAt === 4 && !failure}
                />
                <CleanDecisionNode
                  failure={failure}
                  isSelected={false}
                  onSuccess={() => {
                    setFailure(false)
                    setRunAt(4)
                    setSelectedId(steps[steps.length - 1]?.id ?? "order")
                  }}
                  onFailure={() => {
                    setFailure(true)
                    setRunAt(3)
                    setSelectedId(steps[3]?.id ?? "payment")
                  }}
                />
              </>
            )}
          </div>

          {/* ─── RIGHT COLUMN: STICKY INSPECTOR & FLOW GUIDE ────────────────── */}
          <aside className="relative">
            <div className="sticky top-6 space-y-4">
              {/* Selected Node Inspector Card */}
              {activeStep && (
                <div className="rounded-xl border border-border/60 bg-[#0e131d]/95 p-5 shadow-xl backdrop-blur-md">
                  {/* Inspector Header */}
                  <div className="flex items-start justify-between border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold"
                        style={{
                          backgroundColor: `${activeStep.color}15`,
                          borderColor: `${activeStep.color}50`,
                          color: activeStep.color,
                        }}
                      >
                        <Code2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">
                            Step #{activeStep.number}
                          </span>
                          <span
                            className="rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase"
                            style={{
                              backgroundColor: `${activeStep.color}20`,
                              color: activeStep.color,
                            }}
                          >
                            {activeStep.method}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {activeStep.title}
                        </h3>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-muted-foreground">
                      {activeStep.latency}ms avg
                    </span>
                  </div>

                  {/* Path & Description */}
                  <div className="mt-3.5 space-y-1.5">
                    <p className="font-mono text-xs text-[#C7B2FF]">
                      {activeStep.path}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {activeStep.description}
                    </p>
                  </div>

                  {/* Mode-Specific Content */}
                  {/* 1. CONTRACT MODE: INPUTS & OUTPUTS */}
                  {mode === "contract" && (
                    <div className="mt-4 space-y-3 border-t border-border/40 pt-3.5">
                      {/* Inputs */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Input Parameters
                        </p>
                        {activeStep.input.length > 0 ? (
                          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                            {activeStep.input.map((f) => (
                              <div
                                key={f.name}
                                className="flex items-center justify-between rounded border border-border/50 bg-[#121722] px-2.5 py-1.5 text-[11px]"
                              >
                                <span className="font-mono font-bold text-foreground">
                                  {f.name}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {f.type} {f.required && "· required"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground/70 italic">
                            No input parameters required.
                          </p>
                        )}
                      </div>

                      {/* Outputs (Returns) */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                          Output Fields (Returns)
                        </p>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {activeStep.output.map((f) => (
                            <div
                              key={f.name}
                              className="flex items-center justify-between rounded border border-emerald-500/30 bg-emerald-950/15 px-2.5 py-1.5 text-[11px]"
                            >
                              <span className="font-mono font-bold text-emerald-300">
                                {f.name}
                              </span>
                              <span className="font-mono text-[10px] text-emerald-400/80">
                                {f.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. RUN MODE: LIVE PAYLOAD JSON */}
                  {mode === "run" && (
                    <div className="mt-4 space-y-2 border-t border-border/40 pt-3.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> 200 OK
                        </span>
                        <button
                          onClick={copyPayload}
                          className="flex items-center gap-1 rounded border border-border/60 bg-[#131924] px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="rounded-lg border border-border/60 bg-[#070a10] p-3 font-mono text-[11px] leading-relaxed text-emerald-300/90 overflow-x-auto max-h-56">
                        {JSON.stringify(activeStep.mockOutput, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* 3. AI FLOW GUIDE */}
                  <div className="mt-5 border-t border-border/40 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Flow Guide
                      </span>
                      <button
                        onClick={() => ask(`Why is ${activeStep.title} needed?`)}
                        className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        Why is this step needed?
                      </button>
                    </div>

                    {/* Suggested chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        `Why is ${activeStep.title} needed?`,
                        "What happens if this step fails?",
                        "How do dependencies resolve?",
                      ].map((item) => (
                        <button
                          key={item}
                          onClick={() => ask(item)}
                          className="rounded border border-border/50 bg-[#111722] px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    {/* Response card */}
                    <AnimatePresence mode="wait">
                      {(thinking || question) && (
                        <motion.div
                          key={question ?? "thinking"}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="rounded-lg border border-primary/30 bg-primary/[0.06] p-3 text-xs"
                        >
                          {thinking ? (
                            <div className="flex items-center gap-2 text-[#B7FF3C]">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Reading flow context…</span>
                            </div>
                          ) : (
                            <>
                              <p className="font-bold text-primary">{question}</p>
                              <p className="mt-1 text-muted-foreground leading-relaxed">
                                {getGuideAnswer(question)}
                              </p>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Guide Legend Card */}
              <div className="rounded-xl border border-border/45 bg-[#0e131d]/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Workflow Modes
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#B7FF3C]" />
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Story:</strong> Shows business intent and execution order.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#AE8CFF]" />
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Contract:</strong> Reveals parameter types and return schemas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#FFD15C]" />
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Run:</strong> Simulates live execution and response payloads.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SUBCOMPONENTS (Clean, Neat, Professional like n8n & Zapier)
 * ────────────────────────────────────────────────────────────────────────── */

function CleanNodeCard({
  step,
  mode,
  status,
  isSelected,
  onClick,
  onHover,
  onLeave,
}: {
  step: FlowStep
  mode: Mode
  status: Status
  isSelected: boolean
  onClick: () => void
  onHover: () => void
  onLeave: () => void
}) {
  return (
    <motion.button
      type="button"
      layout="position"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "group relative flex w-full flex-col rounded-xl border p-4 text-left transition-all duration-200 select-none",
        isSelected
          ? "border-primary bg-[#131926] shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-primary/80"
          : status === "running"
          ? "border-amber-400/80 bg-[#16160f] shadow-[0_0_18px_rgba(255,209,92,0.2)] ring-1 ring-amber-400/50"
          : status === "complete"
          ? "border-emerald-500/40 bg-[#0f1420] hover:border-emerald-500/70"
          : "border-border/60 bg-[#0e131d] hover:border-primary/50 hover:bg-[#121723]"
      )}
    >
      {/* Node Port Handles (n8n style) */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2">
        <span
          className={cn(
            "block h-3 w-3 rounded-full border-2 border-[#090D15] transition-colors",
            status === "complete"
              ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
              : status === "running"
              ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
              : "bg-muted-foreground/40 group-hover:bg-primary"
          )}
        />
      </div>

      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2">
        <span
          className={cn(
            "block h-3 w-3 rounded-full border-2 border-[#090D15] transition-colors",
            status === "complete"
              ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
              : status === "running"
              ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
              : "bg-muted-foreground/40 group-hover:bg-primary"
          )}
        />
      </div>

      {/* Top Row: Icon, Method, Title, Status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-xs"
            style={{
              backgroundColor: `${step.color}18`,
              borderColor: `${step.color}55`,
              color: step.color,
            }}
          >
            <Code2 className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase"
                style={{
                  backgroundColor: `${step.color}20`,
                  color: step.color,
                }}
              >
                {step.method}
              </span>
              <p className="font-display text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {step.title}
              </p>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-[#C7B2FF] truncate">
              {step.path}
            </p>
          </div>
        </div>

        {/* Right Status Pill */}
        <div className="shrink-0">
          {mode === "run" ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                status === "complete"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : status === "running"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse"
                  : status === "failed"
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "text-muted-foreground/40"
              )}
            >
              {status === "running" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
              {status === "complete" && <CheckCircle2 className="h-2.5 w-2.5" />}
              {status === "failed" && <XCircle className="h-2.5 w-2.5" />}
              {status}
            </span>
          ) : (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: step.color }}
            />
          )}
        </div>
      </div>

      {/* Contract Mode Inline Preview (Contained, Never Overflows!) */}
      {mode === "contract" && (
        <div className="mt-3 border-t border-border/40 pt-2.5 flex items-center justify-between text-[10px]">
          <span className="font-bold uppercase tracking-wider text-muted-foreground">
            Returns:
          </span>
          <div className="flex gap-1 flex-wrap">
            {step.output.slice(0, 3).map((f) => (
              <span
                key={f.name}
                className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-emerald-300"
              >
                {f.name} <span className="text-muted-foreground/70">({f.type})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.button>
  )
}

function CleanDecisionNode({
  failure,
  isSelected,
  onSuccess,
  onFailure,
}: {
  failure: boolean
  isSelected: boolean
  onSuccess: () => void
  onFailure: () => void
}) {
  return (
    <div
      className={cn(
        "relative w-full rounded-xl border p-4 text-left transition-all select-none",
        isSelected
          ? "border-amber-400 bg-[#1a160b] shadow-xl ring-1 ring-amber-400/80"
          : "border-amber-500/40 bg-[#141209]"
      )}
    >
      {/* Port handles */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2">
        <span className="block h-3 w-3 rounded-full border-2 border-[#090D15] bg-amber-400" />
      </div>
      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2">
        <span className="block h-3 w-3 rounded-full border-2 border-[#090D15] bg-amber-400" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/15 text-amber-300">
            <GitBranch className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-foreground">
              Payment outcome
            </p>
            <p className="text-[10px] text-muted-foreground">
              Branch on <span className="font-mono text-amber-300">status</span>
            </p>
          </div>
        </div>

        <span className="rounded bg-black/40 px-2 py-0.5 font-mono text-[9px] text-amber-300 border border-amber-500/30">
          Condition
        </span>
      </div>

      {/* Dual Path Selector */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSuccess}
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold transition-all",
            !failure
              ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-xs"
              : "border-border/50 bg-[#10141e] text-muted-foreground hover:border-emerald-500/40"
          )}
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Paid
          </span>
          <Check className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={onFailure}
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold transition-all",
            failure
              ? "border-rose-500/60 bg-rose-500/15 text-rose-300 shadow-xs"
              : "border-border/50 bg-[#10141e] text-muted-foreground hover:border-rose-500/40"
          )}
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Declined
          </span>
          <XCircle className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

function CleanConnector({
  label,
  active,
  isTravelling,
}: {
  label: string
  active: boolean
  isTravelling: boolean
}) {
  return (
    <div className="relative flex h-11 w-full items-center justify-center">
      {/* Vertical line */}
      <div
        className={cn(
          "h-full w-px transition-colors duration-300",
          active ? "bg-[#B7FF3C]" : "bg-border/60"
        )}
      />

      {/* Energy pulse on run */}
      {isTravelling && (
        <motion.span
          initial={{ top: 0, opacity: 0 }}
          animate={{ top: 38, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
          className="absolute h-2.5 w-2.5 rounded-full border-2 border-[#090D15] bg-[#B7FF3C] shadow-[0_0_10px_#B7FF3C]"
        />
      )}

      {/* Centered data key pill */}
      <span
        className={cn(
          "absolute left-[calc(50%+14px)] rounded border px-2 py-0.5 font-mono text-[9px] font-bold shadow-xs",
          active
            ? "border-[#B7FF3C]/45 bg-[#121c0a] text-[#B7FF3C]"
            : "border-border/55 bg-[#10141e] text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
}
