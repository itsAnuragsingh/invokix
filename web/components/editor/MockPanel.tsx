// components/editor/MockPanel.tsx
"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  CopyIcon,
  CheckIcon,
  PlayIcon,
  ArrowClockwiseIcon,
  WifiHighIcon,
  WifiSlashIcon,
  TerminalIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

// ── Types ─────────────────────────────────────────────────────────────────────
type Endpoint = {
  method: string
  path: string
  summary?: string
}

type MockPanelProps = {
  projectId: string
  mockUrl: string
  endpoints: Endpoint[]
  contractVersion: string
}

type RequestState = "idle" | "loading" | "success" | "error"

type ResponseData = {
  status: number
  body: string
  duration: number
  endpoint: Endpoint
}

// ── Method badge colors ───────────────────────────────────────────────────────
const METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  GET:    { bg: "bg-emerald-500/10", text: "text-emerald-400",  border: "border-emerald-500/20" },
  POST:   { bg: "bg-blue-500/10",    text: "text-blue-400",     border: "border-blue-500/20"    },
  PUT:    { bg: "bg-amber-500/10",   text: "text-amber-400",    border: "border-amber-500/20"   },
  PATCH:  { bg: "bg-violet-500/10",  text: "text-violet-400",   border: "border-violet-500/20"  },
  DELETE: { bg: "bg-red-500/10",     text: "text-red-400",      border: "border-red-500/20"     },
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
        bg-white/5 border border-white/8 text-zinc-400 hover:text-white hover:bg-white/10
        transition-all duration-150"
    >
      {copied
        ? <CheckIcon size={12} weight="bold" className="text-emerald-400" />
        : <CopyIcon size={12} />
      }
      {copied ? "Copied!" : label}
    </button>
  )
}

// ── JSON pretty printer ───────────────────────────────────────────────────────
function PrettyJson({ raw }: { raw: string }) {
  let parsed: unknown
  let isJson = false

  try {
    parsed = JSON.parse(raw)
    isJson = true
  } catch {
    parsed = raw
  }

  if (!isJson) {
    return <pre className="font-mono text-xs text-zinc-400 whitespace-pre-wrap">{raw}</pre>
  }

  const formatted = JSON.stringify(parsed, null, 2)

  // Syntax highlight manually — color strings, numbers, booleans, nulls
  const highlighted = formatted.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span class="text-indigo-300">${match}</span>`
        }
        return `<span class="text-emerald-300">${match}</span>`
      }
      if (/true|false/.test(match)) {
        return `<span class="text-amber-300">${match}</span>`
      }
      if (/null/.test(match)) {
        return `<span class="text-red-400">${match}</span>`
      }
      return `<span class="text-blue-300">${match}</span>`
    }
  )

  return (
    <pre
      className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-300"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: number }) {
  const color =
    status >= 200 && status < 300 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
    status >= 400 && status < 500 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
    "text-red-400 bg-red-500/10 border-red-500/20"

  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {status}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function MockPanel({
  projectId,
  mockUrl,
  endpoints,
  contractVersion,
}: MockPanelProps) {
  const [selected, setSelected] = useState<Endpoint | null>(null)
  const [reqState, setReqState] = useState<RequestState>("idle")
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [mockStatus, setMockStatus] = useState<"unknown" | "running" | "starting" | "error">("unknown")

  function resolvePathParams(path: string): string {
  return path.replace(/\{([^}]+)\}/g, () => {
    return crypto.randomUUID()
  })
}
  const fireRequest = useCallback(async (endpoint: Endpoint) => {
    setSelected(endpoint)
    setReqState("loading")
    setMockStatus("starting")
    setResponse(null)

    const url = `${mockUrl}${resolvePathParams(endpoint.path)}`
    const start = Date.now()

    try {
      const res = await fetch(url, {
        method: endpoint.method,
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      })
      const duration = Date.now() - start
      const body = await res.text()

      setMockStatus("running")
      setReqState("success")
      setResponse({ status: res.status, body, duration, endpoint })
    } catch {
      setReqState("error")
      setMockStatus("error")
      setResponse(null)
    }
  }, [mockUrl])

  const methodStyle = selected ? METHOD_STYLES[selected.method] ?? METHOD_STYLES.GET : null

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TerminalIcon className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Live Mock Server</h2>
            <span className="text-[10px] font-mono text-muted-foreground border border-border/50 rounded-full px-2 py-0.5">
              v{contractVersion}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Prism generates realistic fake data from your contract. No backend needed.
          </p>
        </div>

        {/* Mock status indicator */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium shrink-0 ${
          mockStatus === "running"  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          mockStatus === "starting" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
          mockStatus === "error"    ? "bg-red-500/10 border-red-500/20 text-red-400" :
          "bg-white/5 border-white/8 text-zinc-500"
        }`}>
          {mockStatus === "running"  && <WifiHighIcon size={12} weight="fill" />}
          {mockStatus === "starting" && <ArrowClockwiseIcon size={12} className="animate-spin" />}
          {mockStatus === "error"    && <WifiSlashIcon size={12} weight="fill" />}
          {mockStatus === "unknown"  && <div className="h-2 w-2 rounded-full bg-zinc-600" />}
          {mockStatus === "running"  ? "Prism running" :
           mockStatus === "starting" ? "Starting..." :
           mockStatus === "error"    ? "Start failed" :
           "Not started"}
        </div>
      </div>

      {/* Mock URL bar */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Mock Base URL
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Auto-updates on every publish
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-sm text-primary bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 truncate">
            {mockUrl}
          </code>
          <CopyButton text={mockUrl} label="Copy URL" />
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          Append any endpoint path — e.g. <code className="text-primary/70">{mockUrl}{endpoints[0]?.path ?? "/orders"}</code>
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Endpoint list */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Endpoints
            </p>
            <span className="text-[10px] text-muted-foreground/40 font-mono">
              {endpoints.length} routes
            </span>
          </div>
          <div className="divide-y divide-border/30 max-h-[480px] overflow-y-auto">
            {endpoints.map((ep) => {
              const style = METHOD_STYLES[ep.method] ?? METHOD_STYLES.GET
              const isSelected = selected?.method === ep.method && selected?.path === ep.path
              const isLoading = isSelected && reqState === "loading"

              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => fireRequest(ep)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 group ${
                    isSelected
                      ? "bg-primary/5 border-l-2 border-l-primary"
                      : "hover:bg-muted/30 border-l-2 border-l-transparent"
                  }`}
                >
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border shrink-0 w-14 text-center ${style.bg} ${style.text} ${style.border}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-foreground/80 truncate flex-1">
                    {ep.path}
                  </span>
                  {isLoading ? (
                    <ArrowClockwiseIcon size={12} className="text-primary animate-spin shrink-0" />
                  ) : (
                    <PlayIcon
                      size={12}
                      weight="fill"
                      className="text-muted-foreground/30 group-hover:text-primary shrink-0 transition-colors"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Response panel */}
        <div className="lg:col-span-3 rounded-xl border border-border/50 bg-card/30 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Response
            </p>
            {response && (
              <div className="flex items-center gap-2">
                <StatusBadge status={response.status} />
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-mono">
                  <ClockIcon size={10} />
                  {response.duration}ms
                </span>
                <CopyButton text={response.body} label="Copy" />
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-auto max-h-[480px]">
            <AnimatePresence mode="wait">

              {/* Idle state */}
              {reqState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-48 gap-3"
                >
                  <div className="h-12 w-12 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center">
                    <PlayIcon size={20} weight="fill" className="text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground/50 text-center max-w-48">
                    Click any endpoint to fire a request and see fake data
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/30">
                    <ArrowRightIcon size={10} />
                    First request starts Prism (~3s)
                  </div>
                </motion.div>
              )}

              {/* Loading state */}
              {reqState === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-48 gap-4"
                >
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary/60"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">
                      {selected && (
                        <span>
                          <span className={`font-mono text-xs font-bold ${METHOD_STYLES[selected.method]?.text}`}>
                            {selected.method}
                          </span>
                          {" "}{selected.path}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground/50">
                      {mockStatus === "starting" ? "Starting Prism (~3s on first request)..." : "Fetching response..."}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Success state */}
              {reqState === "success" && response && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {/* Request line */}
                  <div className="flex items-center gap-2 pb-3 border-b border-border/30">
                    {methodStyle && (
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${methodStyle.bg} ${methodStyle.text} ${methodStyle.border}`}>
                        {response.endpoint.method}
                      </span>
                    )}
                    <code className="font-mono text-xs text-foreground/70">
                      {mockUrl}{response.endpoint.path}
                    </code>
                  </div>

                  {/* Response body */}
                  <div className="rounded-lg bg-[#0D1117] border border-white/5 p-4 overflow-auto max-h-80">
                    <PrettyJson raw={response.body} />
                  </div>
                </motion.div>
              )}

              {/* Error state */}
              {reqState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-48 gap-3"
                >
                  <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <WifiSlashIcon size={20} weight="fill" className="text-red-400" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm text-red-400 font-medium">Mock server failed to start</p>
                    <p className="text-xs text-muted-foreground/50 max-w-48 text-center">
                      Check your terminal for Prism error logs
                    </p>
                  </div>
                  <button
                    onClick={() => selected && fireRequest(selected)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ArrowClockwiseIcon size={12} />
                    Retry
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="rounded-xl border border-border/40 bg-muted/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "How it works", value: "Prism reads your OpenAPI spec and generates schema-accurate fake data on every request." },
            { label: "Auto-updates", value: "Mock server restarts automatically when you publish a new version of your contract." },
            { label: "Share with team", value: `Anyone with the mock URL can call it directly — no auth needed. Share: ${mockUrl}` },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{label}</p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}