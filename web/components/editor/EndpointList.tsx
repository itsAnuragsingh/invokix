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

type OpenApiSpec = {
  info?: { title?: string; version?: string; description?: string }
  paths?: Record<string, Record<string, EndpointDetail>>
}

type Endpoint = {
  method: string
  path: string
  detail: EndpointDetail
}

type EndpointListProps = {
  contract: Contract
  projectId: string
}

const METHOD_CONFIG: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
  get:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20",    dotColor: "bg-blue-400" },
  post:   { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dotColor: "bg-emerald-400" },
  put:    { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   dotColor: "bg-amber-400" },
  patch:  { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20",  dotColor: "bg-orange-400" },
  delete: { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20",     dotColor: "bg-red-400" },
}

const RESPONSE_CONFIG: Record<string, string> = {
  "2": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "4": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "5": "bg-red-500/10 text-red-400 border-red-500/20",
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

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-base text-foreground">
            {spec?.info?.title ?? "API Contract"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {endpoints.length} endpoints · v{spec?.info?.version ?? contract.version}
            {spec?.info?.description && ` · ${spec.info.description}`}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 font-mono">
          OpenAPI 3.0
        </Badge>
      </div>

      {/* Endpoint cards */}
      <div className="space-y-2">
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
                "rounded-xl border overflow-hidden transition-colors duration-150",
                isOpen
                  ? "border-primary/30 bg-card shadow-lg shadow-primary/5"
                  : "border-border/40 bg-card/50 hover:border-border/70 hover:bg-card/80"
              )}
            >
              {/* Endpoint row */}
              <button
                type="button"
                aria-label={`${method.toUpperCase()} ${path}`}
                className="w-full text-left px-4 py-3 flex items-center gap-3 group"
                onClick={() => setExpanded(isOpen ? null : key)}
              >
                {/* Method badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold uppercase w-14 justify-center shrink-0 font-mono",
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
                    <div className="flex items-center gap-1 text-[10px] text-amber-400/70 bg-amber-500/5 border border-amber-500/15 rounded-full px-1.5 py-0.5">
                      <LockSimpleIcon weight="fill" className="h-2.5 w-2.5" />
                      Auth
                    </div>
                  )}
                  {hasBody && (
                    <div className="flex items-center gap-1 text-[10px] text-blue-400/70 bg-blue-500/5 border border-blue-500/15 rounded-full px-1.5 py-0.5">
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
                      <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Left — path + params */}
                        <div className="space-y-3">
                          {/* Full path with copy */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                              Endpoint
                            </p>
                            <div className="flex items-center gap-2 bg-[#22272e] rounded-lg px-3 py-2 border border-border/30">
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
                                {detail.parameters.map((param) => (
                                  <div key={param.name} className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg px-3 py-1.5 border border-border/30">
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
                                {Object.entries(detail.responses).map(([code, res]) => (
                                  <div key={code} className={cn(
                                    "flex items-center gap-2 text-xs rounded-lg px-3 py-1.5 border",
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
                              <span className="font-mono text-xs text-primary bg-primary/5 border border-primary/20 rounded-md px-2 py-1">
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
                              <div className="flex items-center gap-2 text-xs bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-1.5 text-blue-400">
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
    </div>
  )
}