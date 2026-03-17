// components/editor/ResponseValidator.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import {
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  CaretDownIcon,
  ArrowsClockwiseIcon,
  LightningIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { ValidatorOutput, ValidationResult, ValidationStatus } from "@/lib/analysis/validator"

type Endpoint = {
  method: string
  path: string
}

type ResponseValidatorProps = {
  contractId: string
  endpoints: Endpoint[]
}

const METHOD_COLORS: Record<string, string> = {
  get: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  post: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  put: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  patch: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  delete: "text-red-400 bg-red-500/10 border-red-500/20",
}

const STATUS_CONFIG: Record<ValidationStatus, {
  icon: typeof CheckCircleIcon
  color: string
  bg: string
  label: string
}> = {
  match: {
    icon: CheckCircleIcon,
    color: "text-emerald-400",
    bg: "bg-emerald-500/5 border-emerald-500/20",
    label: "Match",
  },
  missing: {
    icon: XCircleIcon,
    color: "text-red-400",
    bg: "bg-red-500/5 border-red-500/20",
    label: "Missing",
  },
  wrong_type: {
    icon: XCircleIcon,
    color: "text-red-400",
    bg: "bg-red-500/5 border-red-500/20",
    label: "Wrong Type",
  },
  wrong_enum: {
    icon: WarningCircleIcon,
    color: "text-amber-400",
    bg: "bg-amber-500/5 border-amber-500/20",
    label: "Invalid Value",
  },
  undocumented: {
    icon: WarningCircleIcon,
    color: "text-amber-400",
    bg: "bg-amber-500/5 border-amber-500/20",
    label: "Undocumented",
  },
}

export function ResponseValidator({ contractId, endpoints }: ResponseValidatorProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(
    endpoints[0] ?? null
  )
  const [responseJson, setResponseJson] = useState("")
  const [result, setResult] = useState<ValidatorOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)

  function handleJsonChange(value: string) {
    setResponseJson(value)
    setJsonError(null)

    if (!value.trim()) return

    try {
      JSON.parse(value)
    } catch {
      setJsonError("Invalid JSON — check for missing brackets or commas")
    }
  }

  async function handleValidate() {
    if (!selectedEndpoint) {
      toast.error("Select an endpoint first")
      return
    }
    if (!responseJson.trim()) {
      toast.error("Paste a response JSON to validate")
      return
    }
    if (jsonError) {
      toast.error("Fix the JSON errors before validating")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          method: selectedEndpoint.method,
          path: selectedEndpoint.path,
          responseJson,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.error ?? "Validation failed")
        return
      }

      setResult(data.data)
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const breaking = result?.results.filter(
    (r) => r.status === "missing" || r.status === "wrong_type"
  ) ?? []
  const warnings = result?.results.filter(
    (r) => r.status === "undocumented" || r.status === "wrong_enum"
  ) ?? []
  const matches = result?.results.filter((r) => r.status === "match") ?? []

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Response Validator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a real API response and see exactly where it drifts from your contract.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Input */}
        <div className="space-y-4">

          {/* Endpoint selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Endpoint
            </label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5
                  rounded-lg border border-border/50 bg-card/50 hover:bg-card
                  transition-colors text-sm"
              >
                {selectedEndpoint ? (
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono",
                      METHOD_COLORS[selectedEndpoint.method.toLowerCase()] ?? "text-muted-foreground"
                    )}>
                      {selectedEndpoint.method.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {selectedEndpoint.path}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select an endpoint</span>
                )}
                <CaretDownIcon
                  size={14}
                  className={cn(
                    "text-muted-foreground transition-transform shrink-0",
                    dropdownOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1 z-50
                      rounded-lg border border-border/50 bg-popover shadow-xl overflow-hidden"
                  >
                    {endpoints.map((ep) => (
                      <button
                        key={`${ep.method}-${ep.path}`}
                        onClick={() => {
                          setSelectedEndpoint(ep)
                          setDropdownOpen(false)
                          setResult(null)
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-left",
                          "hover:bg-muted/30 transition-colors",
                          selectedEndpoint?.method === ep.method &&
                          selectedEndpoint?.path === ep.path
                            ? "bg-primary/5"
                            : ""
                        )}
                      >
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono shrink-0",
                          METHOD_COLORS[ep.method.toLowerCase()] ?? "text-muted-foreground"
                        )}>
                          {ep.method.toUpperCase()}
                        </span>
                        <span className="font-mono text-xs text-foreground truncate">
                          {ep.path}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* JSON input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Response JSON
              </label>
              {jsonError && (
                <span className="text-[11px] text-red-400 flex items-center gap-1">
                  <XCircleIcon size={11} />
                  {jsonError}
                </span>
              )}
            </div>
            <textarea
              value={responseJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder={`Paste your API response here...\n\n{\n  "id": "550e8400-...",\n  "price": 149.99,\n  "status": "pending"\n}`}
              rows={16}
              className={cn(
                "w-full rounded-lg border bg-[#0D1117] px-4 py-3",
                "font-mono text-xs text-zinc-300 leading-relaxed",
                "placeholder:text-zinc-600 resize-none",
                "focus:outline-none focus:ring-1 transition-colors",
                jsonError
                  ? "border-red-500/40 focus:ring-red-500/30"
                  : "border-border/50 focus:ring-primary/30 focus:border-primary/30"
              )}
              spellCheck={false}
            />
          </div>

          {/* Validate button */}
          <button
            onClick={handleValidate}
            disabled={loading || !selectedEndpoint || !responseJson.trim() || !!jsonError}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
              "text-sm font-semibold transition-all duration-150",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "shadow-lg shadow-primary/20"
            )}
          >
            {loading ? (
              <>
                <ArrowsClockwiseIcon size={15} className="animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <LightningIcon size={15} weight="fill" />
                Validate Response
              </>
            )}
          </button>
        </div>

        {/* Right — Results */}
        <div className="space-y-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Results
          </label>

          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-64 rounded-xl border border-dashed border-border/40
                  flex flex-col items-center justify-center gap-2 text-center px-6"
              >
                <LightningIcon size={24} className="text-muted-foreground/30" weight="duotone" />
                <p className="text-sm text-muted-foreground/50">
                  Paste a response and click Validate
                </p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Score */}
                <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">
                      Contract match
                    </span>
                    <span className={cn(
                      "text-2xl font-bold font-display",
                      result.matchScore === 100
                        ? "text-emerald-400"
                        : result.matchScore >= 70
                        ? "text-amber-400"
                        : "text-red-400"
                    )}>
                      {result.matchScore}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.matchScore}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        result.matchScore === 100
                          ? "bg-emerald-400"
                          : result.matchScore >= 70
                          ? "bg-amber-400"
                          : "bg-red-400"
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {matches.length} matched
                    </span>
                    {breaking.length > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        {breaking.length} errors
                      </span>
                    )}
                    {warnings.length > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {warnings.length} warnings
                      </span>
                    )}
                  </div>
                </div>

                {/* Results list */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {/* Errors first */}
                  {[...breaking, ...warnings, ...matches].map((r, i) => (
                    <ResultRow key={i} result={r} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function ResultRow({ result }: { result: ValidationResult }) {
  const config = STATUS_CONFIG[result.status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        config.bg
      )}
    >
      <Icon size={15} weight="duotone" className={cn("mt-0.5 shrink-0", config.color)} />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-xs font-mono text-foreground font-medium">
            {result.field}
          </code>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
            result.status === "match"
              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
              : result.status === "missing" || result.status === "wrong_type"
              ? "text-red-400 border-red-500/30 bg-red-500/10"
              : "text-amber-400 border-amber-500/30 bg-amber-500/10"
          )}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{result.message}</p>
        {(result.expected || result.received) && (
          <div className="flex items-center gap-3 text-[11px] mt-1">
            {result.expected && (
              <span className="text-muted-foreground/60">
                expected <code className="text-primary">{result.expected}</code>
              </span>
            )}
            {result.received && result.status !== "match" && (
              <span className="text-muted-foreground/60">
                received <code className="text-red-400">{result.received}</code>
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}