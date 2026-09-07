// components/editor/EndpointList.tsx
"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CaretDownIcon,
  CaretRightIcon,
  LockSimpleIcon,
  ArrowsOutIcon,
  CodeIcon,
  CopyIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import type { InferSelectModel } from "drizzle-orm"
import type { contracts } from "@/lib/db/schema"

type Contract = InferSelectModel<typeof contracts>

type Parameter = {
  name: string
  in: string
  required?: boolean
  description?: string
  schema?: { type?: string }
}

type EndpointDetail = {
  summary?: string
  description?: string
  operationId?: string
  parameters?: Parameter[]
  requestBody?: {
    required?: boolean
    content?: Record<string, { schema?: { $ref?: string; properties?: Record<string, { type?: string; description?: string }> } }>
  }
  responses?: Record<string, { description?: string }>
  security?: Array<Record<string, string[]>>
}

type Endpoint = {
  method: string
  path: string
  detail: EndpointDetail
}


type OpenApiSpec = {
  info?: { title?: string; version?: string; description?: string }
  paths?: Record<string, Record<string, EndpointDetail>>
}

type EndpointListProps = {
  contract: Contract
  projectId: string
}

const METHOD_CONFIG: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
  get: { bg: "bg-[#B7FF3C]/10", text: "text-[#B7FF3C]", border: "border-[#B7FF3C]/40", dotColor: "bg-[#B7FF3C]" },
  post: { bg: "bg-[#AE8CFF]/10", text: "text-[#AE8CFF]", border: "border-[#AE8CFF]/40", dotColor: "bg-[#AE8CFF]" },
  put: { bg: "bg-[#FFD15C]/10", text: "text-[#FFD15C]", border: "border-[#FFD15C]/40", dotColor: "bg-[#FFD15C]" },
  patch: { bg: "bg-[#56B6C2]/10", text: "text-[#56B6C2]", border: "border-[#56B6C2]/40", dotColor: "bg-[#56B6C2]" },
  delete: { bg: "bg-[#F15A3C]/10", text: "text-[#F15A3C]", border: "border-[#F15A3C]/40", dotColor: "bg-[#F15A3C]" },
}

const RESPONSE_CONFIG: Record<string, string> = {
  "2": "bg-[#B7FF3C]/10 text-[#B7FF3C] border-[#B7FF3C]/30",
  "4": "bg-[#FFD15C]/10 text-[#FFD15C] border-[#FFD15C]/30",
  "5": "bg-[#F15A3C]/10 text-[#F15A3C] border-[#F15A3C]/30",
}

export function EndpointList({ contract, projectId }: EndpointListProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const spec = contract.openApiSpec as OpenApiSpec
  const endpoints: Endpoint[] = []

  if (spec?.paths) {
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, detail] of Object.entries(methods)) {
        if (["get", "post", "put", "patch", "delete"].includes(method)) {
          endpoints.push({ method, path, detail })
        }
      }
    }
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path)
    toast.success("Path copied")
  }

  const methodSummary = endpoints.reduce<Record<string, number>>((counts, endpoint) => {
    counts[endpoint.method] = (counts[endpoint.method] ?? 0) + 1
    return counts
  }, {})

  return (
    <section className="overflow-hidden border border-border/45 bg-card/20">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-border/40 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">API explorer</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{spec?.info?.title ?? "API Contract"}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{spec?.info?.description ?? "Every available operation in the current contract."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><span className="border border-border/50 bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">v{spec?.info?.version ?? contract.version}</span><span className="bg-primary px-2.5 py-1 font-mono text-[10px] font-bold text-primary-foreground">{endpoints.length} endpoints</span></div>
      </div>

      <div className="flex flex-wrap gap-px border-b border-border/40 bg-border/40">{Object.entries(methodSummary).map(([method, count]) => { const c = METHOD_CONFIG[method]; return <div key={method} className="flex items-center gap-2 bg-background px-4 py-3"><span className={cn("font-mono text-[10px] font-bold uppercase", c.text)}>{method}</span><span className="text-xs font-semibold text-foreground">{count}</span></div> })}</div>

      {/* Endpoint cards */}
      <div className="divide-y divide-border/35">
        {endpoints.map(({ method, path, detail }) => {
          const key = `${method}:${path}`
          const isOpen = expanded === key
          const config = METHOD_CONFIG[method] ?? METHOD_CONFIG.get
          const hasAuth = !!detail.security?.length
          const responseCount = detail.responses ? Object.keys(detail.responses).length : 0
          const hasBody = !!detail.requestBody
          const paramCount = detail.parameters?.length ?? 0

          return (
            <motion.div
              key={key}
              layout
              className={cn(
                "overflow-hidden transition-colors duration-150",
                isOpen
                  ? "bg-primary/[.045]"
                  : "bg-card/10 hover:bg-white/[.035]"
              )}
            >
              {/* Endpoint row */}
              <button
                type="button"
                aria-label={`${method.toUpperCase()} ${path}`}
                className="w-full text-left px-5 py-4 sm:px-6 flex items-center gap-3 group"
                onClick={() => setExpanded(isOpen ? null : key)}
              >
                {/* Method badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold uppercase w-14 justify-center shrink-0 font-mono rounded-none",
                    config.bg, config.text, config.border
                  )}
                >
                  {method}
                </Badge>

                {/* Path */}
                <span className="font-mono text-sm text-foreground flex-1 text-left truncate">
                  {path}
                </span>

                {/* Summary */}
                {detail.summary && (
                  <span className="text-xs text-muted-foreground truncate hidden md:block max-w-48">
                    {detail.summary}
                  </span>
                )}

                {/* Metadata pills */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {hasAuth && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400/70 bg-amber-500/5 border border-amber-500/15 px-1.5 py-0.5">
                      <LockSimpleIcon weight="fill" className="h-2.5 w-2.5" />
                      Auth
                    </div>
                  )}
                  {hasBody && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400/70 bg-blue-500/5 border border-blue-500/15 px-1.5 py-0.5">
                      <CodeIcon className="h-2.5 w-2.5" />
                      Body
                    </div>
                  )}
                  {responseCount > 0 && (
                    <span className="text-[10px] text-muted-foreground/50 font-mono">
                      {responseCount} resp
                    </span>
                  )}
                </div>

                {/* Expand icon */}
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <CaretRightIcon className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                </motion.div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/40 bg-muted/10">
                      <div className="px-5 py-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Left — path + params */}
                        <div className="space-y-3">
                          {/* Full path with copy */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                              Endpoint
                            </p>
                            <div className="flex items-center gap-2 bg-[#0D1117] px-3 py-2 border border-border/30">
                              <Badge variant="outline" className={cn("text-[9px] font-bold uppercase font-mono shrink-0", config.bg, config.text, config.border)}>
                                {method}
                              </Badge>
                              <span className="font-mono text-xs text-foreground flex-1 truncate">{path}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0"
                                onClick={() => copyPath(path)}
                                aria-label="Copy path"
                              >
                                <CopyIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Description */}
                          {detail.description && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                                Description
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{detail.description}</p>
                            </div>
                          )}

                          {/* Parameters */}
                          {detail.parameters && detail.parameters.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                                Parameters ({paramCount})
                              </p>
                              <div className="space-y-1">
                                {detail.parameters.map((param: Parameter) => (
                                  <div key={param.name} className="flex items-center gap-2 text-xs bg-muted/30 px-3 py-1.5 border border-border/30">
                                    <span className="font-mono text-foreground">{param.name}</span>
                                    <Badge variant="outline" className="text-[9px] border-border/40 text-muted-foreground font-mono">
                                      {param.in}
                                    </Badge>
                                    {param.schema?.type && (
                                      <Badge variant="outline" className="text-[9px] border-blue-500/20 text-blue-400 bg-blue-500/5 font-mono">
                                        {param.schema.type}
                                      </Badge>
                                    )}
                                    {param.required && (
                                      <Badge variant="outline" className="text-[9px] border-red-500/20 text-red-400 bg-red-500/5">
                                        required
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right — responses */}
                        <div className="space-y-3">
                          {detail.responses && Object.keys(detail.responses).length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                                Responses
                              </p>
                              <div className="space-y-1">
                                {Object.entries(detail.responses).map(([code, res]: [string, { description?: string }]) => (
                                  <div key={code} className={cn(
                                    "flex items-center gap-2 text-xs px-3 py-1.5 border",
                                    RESPONSE_CONFIG[code[0]] ?? "bg-muted/30 text-muted-foreground border-border/30"
                                  )}>
                                    <span className="font-mono font-bold">{code}</span>
                                    <span className="text-current/70">{res.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* OperationId */}
                          {detail.operationId && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                                Operation ID
                              </p>
                              <span className="font-mono text-xs text-primary bg-primary/5 border border-primary/20 px-2 py-1">
                                {detail.operationId}
                              </span>
                            </div>
                          )}

                          {/* Request body indicator */}
                          {hasBody && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                                Request Body
                              </p>
                              <div className="flex items-center gap-2 text-xs bg-blue-500/5 border border-blue-500/20 px-3 py-1.5 text-blue-400">
                                <CodeIcon className="h-3 w-3" />
                                {detail.requestBody?.required ? "Required" : "Optional"} body
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
