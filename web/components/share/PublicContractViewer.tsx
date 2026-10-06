// components/share/PublicContractViewer.tsx
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  LightningIcon,
  CopyIcon,
  DownloadIcon,
  CheckIcon,
  CaretRightIcon,
  CodeIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  SparkleIcon,
  ShareNetworkIcon,
  PlayIcon,
  FileTsIcon,
  ShieldIcon,
  DeviceMobileIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

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
    content?: Record<string, { schema?: unknown }>
  }
  responses?: Record<string, { description?: string }>
  security?: Array<Record<string, string[]>>
}

type Endpoint = {
  method: string
  path: string
  detail: EndpointDetail
}

type PublicContractViewerProps = {
  contractId: string
  projectId: string
  title: string
  version: string
  description?: string
  healthScore: number
  endpoints: Endpoint[]
  rawSpec: object
  generatedCode: {
    types: string
    hooks: string
    nativeHooks?: string
    zod: string
    stack: string
  }
}

const METHOD_CONFIG: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  get: { bg: "bg-[#B7FF3C]/10", text: "text-[#B7FF3C]", border: "border-[#B7FF3C]/35", glow: "shadow-[0_0_12px_rgba(183,255,60,0.15)]" },
  post: { bg: "bg-[#AE8CFF]/10", text: "text-[#AE8CFF]", border: "border-[#AE8CFF]/35", glow: "shadow-[0_0_12px_rgba(174,140,255,0.15)]" },
  put: { bg: "bg-[#FFD15C]/10", text: "text-[#FFD15C]", border: "border-[#FFD15C]/35", glow: "shadow-[0_0_12px_rgba(255,209,92,0.15)]" },
  patch: { bg: "bg-[#56B6C2]/10", text: "text-[#56B6C2]", border: "border-[#56B6C2]/35", glow: "shadow-[0_0_12px_rgba(86,182,194,0.15)]" },
  delete: { bg: "bg-[#F15A3C]/10", text: "text-[#F15A3C]", border: "border-[#F15A3C]/35", glow: "shadow-[0_0_12px_rgba(241,90,60,0.15)]" },
}

export function PublicContractViewer({
  contractId,
  projectId,
  title,
  version,
  description,
  healthScore,
  endpoints,
  rawSpec,
  generatedCode,
}: PublicContractViewerProps) {
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [expandedKey, setExpandedKey] = useState<string | null>(endpoints[0] ? `${endpoints[0].method}:${endpoints[0].path}` : null)
  const [activeTab, setActiveTab] = useState<"endpoints" | "sdk">("endpoints")
  const [sdkTab, setSdkTab] = useState<"types" | "hooks" | "zod" | "cli">("types")

  // Mock sandbox states
  const [mockLoading, setMockLoading] = useState<Record<string, boolean>>({})
  const [mockResponses, setMockResponses] = useState<Record<string, { status: number; duration: number; data: unknown }>>({})
  const [codeLang, setCodeLang] = useState<Record<string, "curl" | "fetch" | "python">>({})

  // Filtered endpoints
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesSearch =
        ep.path.toLowerCase().includes(search.toLowerCase()) ||
        (ep.detail.summary?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchesMethod = methodFilter === "all" || ep.method.toLowerCase() === methodFilter.toLowerCase()
      return matchesSearch && matchesMethod
    })
  }, [endpoints, search, methodFilter])

  // Count by method
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: endpoints.length }
    for (const ep of endpoints) {
      map[ep.method] = (map[ep.method] ?? 0) + 1
    }
    return map
  }, [endpoints])

  async function handleCopy(text: string, label: string) {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  function handleDownloadSpec() {
    const jsonStr = JSON.stringify(rawSpec, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-openapi.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded OpenAPI 3.0 specification!")
  }

  // Live Mock invocation directly against the in-process mock proxy
  async function testMockEndpoint(method: string, path: string) {
    const key = `${method}:${path}`
    setMockLoading((prev) => ({ ...prev, [key]: true }))
    const start = performance.now()

    // Replace any path params like {id} with sample "1"
    const resolvedPath = path.replace(/\{([^}]+)\}/g, "1")
    const mockUrl = `/api/mock-proxy/${projectId}${resolvedPath}`

    try {
      const res = await fetch(mockUrl, {
        method: method.toUpperCase(),
        headers: { "Content-Type": "application/json" },
      })
      const duration = Math.round(performance.now() - start)
      let data: unknown
      try {
        data = await res.json()
      } catch {
        data = await res.text()
      }

      setMockResponses((prev) => ({
        ...prev,
        [key]: { status: res.status, duration, data },
      }))
      toast.success(`Mock response received in ${duration}ms!`)
    } catch {
      toast.error("Mock request failed")
    } finally {
      setMockLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0716] text-[#F3F0EB] selection:bg-[#B7FF3C] selection:text-[#10100B]">
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#AE8CFF]/10 blur-[130px]" />
        <div className="absolute top-1/3 left-10 h-[450px] w-[450px] rounded-full bg-[#B7FF3C]/5 blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0E0716]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#B7FF3C] text-[#10100B] font-bold shadow-[2px_2px_0_rgba(183,255,60,0.3)] transition-transform group-hover:-translate-y-0.5">
              <LightningIcon weight="fill" size={18} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Invokix<span className="text-[#B7FF3C]">.</span>
            </span>
            <Badge variant="outline" className="border-white/15 bg-white/5 text-[10px] uppercase font-mono text-white/60 ml-2">
              Public Contract
            </Badge>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success("Public share link copied to clipboard!")
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-none border border-[#B7FF3C]/30 bg-[#B7FF3C]/10 px-3 py-1.5 font-mono text-xs text-[#B7FF3C] hover:bg-[#B7FF3C] hover:text-[#10100B] transition-colors cursor-pointer"
              title="Copy shareable link"
            >
              <ShareNetworkIcon size={13} weight="bold" />
              <span>Share Link</span>
            </button>

            <button
              onClick={() => handleCopy(`npx invokix pull`, "CLI command")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-none border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-xs text-white/80 hover:border-[#B7FF3C]/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-[#B7FF3C]">$</span>
              <span>npx invokix pull</span>
              <CopyIcon size={12} className="text-white/40 ml-1" />
            </button>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 bg-[#B7FF3C] px-3.5 py-1.5 text-xs font-bold text-[#10100B] shadow-[2px_2px_0_rgba(255,255,255,0.2)] hover:bg-[#cbfb60] transition-transform hover:-translate-y-0.5"
            >
              <span>Build API</span>
              <ArrowRightIcon size={12} weight="bold" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden border border-white/10 bg-[#160D24] p-6 sm:p-10 shadow-[10px_12px_0_rgba(0,0,0,0.45)]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B7FF3C] via-[#AE8CFF] to-[#00F0FF]" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#B7FF3C] uppercase tracking-wider">
                  OpenAPI 3.0 Specification
                </span>
                <span className="text-white/30">•</span>
                <span className="font-mono text-xs text-white/50">Version {version}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
                {title}
              </h1>

              {description && (
                <p className="text-sm sm:text-base leading-relaxed text-white/70 max-w-2xl font-normal">
                  {description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success("Public share link copied to clipboard!")
                    }
                  }}
                  size="sm"
                  className="rounded-none bg-[#B7FF3C] text-[#10100B] hover:bg-[#cbfb60] text-xs font-bold shadow-[2px_2px_0_rgba(255,255,255,0.2)]"
                >
                  <ShareNetworkIcon size={14} weight="bold" className="mr-1.5" />
                  Copy Share Link
                </Button>

                <Button
                  onClick={handleDownloadSpec}
                  size="sm"
                  variant="outline"
                  className="rounded-none border-white/20 bg-white/5 text-xs text-white hover:bg-white/10"
                >
                  <DownloadIcon size={14} className="mr-1.5" />
                  Download OpenAPI Spec
                </Button>

                <Button
                  onClick={() => handleCopy(JSON.stringify(rawSpec, null, 2), "Full OpenAPI Spec")}
                  variant="outline"
                  size="sm"
                  className="rounded-none border-white/20 bg-white/5 text-xs text-white hover:bg-white/10"
                >
                  <CopyIcon size={14} className="mr-1.5" />
                  Copy Raw JSON
                </Button>
              </div>
            </div>

            {/* Health Score Pill Card */}
            <div className="flex items-center gap-4 rounded-none border border-white/15 bg-black/40 p-5 self-start shrink-0">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Contract Health</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={cn(
                    "font-display text-4xl font-bold",
                    healthScore >= 80 ? "text-[#B7FF3C]" : healthScore >= 50 ? "text-[#FFD15C]" : "text-[#F15A3C]"
                  )}>
                    {healthScore}
                  </span>
                  <span className="text-xs text-white/40">/ 100</span>
                </div>
                <p className="text-[10px] text-white/60">
                  {healthScore >= 80 ? "Production Grade" : "In Development"}
                </p>
              </div>

              <div className="h-10 w-px bg-white/10" />

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Operations</p>
                <span className="font-display text-4xl font-bold text-white">
                  {endpoints.length}
                </span>
                <p className="text-[10px] text-white/60">Live Mocks</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher: Interactive Explorer vs Full SDK */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("endpoints")}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border",
                activeTab === "endpoints"
                  ? "bg-[#B7FF3C] text-[#10100B] border-[#B7FF3C] shadow-[2px_2px_0_rgba(255,255,255,0.2)]"
                  : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              API Endpoints & Live Mocks ({endpoints.length})
            </button>

            <button
              onClick={() => setActiveTab("sdk")}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border",
                activeTab === "sdk"
                  ? "bg-[#AE8CFF] text-[#10100B] border-[#AE8CFF] shadow-[2px_2px_0_rgba(255,255,255,0.2)]"
                  : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              Client SDK & Codegen
            </button>
          </div>

          {activeTab === "endpoints" && (
            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Filter endpoints... (e.g. /orders)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-none bg-black/40 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-[#B7FF3C]/50"
              />
            </div>
          )}
        </div>

        {/* TAB 1: INTERACTIVE ENDPOINTS & LIVE MOCKS */}
        {activeTab === "endpoints" && (
          <div className="space-y-6">
            {/* Method filter chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["all", "get", "post", "put", "patch", "delete"].map((m) => {
                const count = counts[m] ?? 0
                if (m !== "all" && count === 0) return null

                return (
                  <button
                    key={m}
                    onClick={() => setMethodFilter(m)}
                    className={cn(
                      "px-3 py-1 font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer",
                      methodFilter === m
                        ? "bg-white text-[#10100B] border-white shadow-sm"
                        : "bg-black/30 text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                    )}
                  >
                    <span>{m}</span>
                    <span className="ml-1.5 text-[10px] opacity-60">({count})</span>
                  </button>
                )
              })}
            </div>

            {/* Endpoints List */}
            <div className="space-y-3">
              {filteredEndpoints.length === 0 ? (
                <div className="border border-white/10 bg-black/30 p-12 text-center text-sm text-white/50">
                  No matching endpoints found for "{search}".
                </div>
              ) : (
                filteredEndpoints.map(({ method, path, detail }) => {
                  const key = `${method}:${path}`
                  const isOpen = expandedKey === key
                  const config = METHOD_CONFIG[method] ?? METHOD_CONFIG.get
                  const paramCount = detail.parameters?.length ?? 0
                  const hasBody = !!detail.requestBody
                  const hasAuth = !!detail.security?.length
                  const isRunningMock = !!mockLoading[key]
                  const mockResult = mockResponses[key]
                  const currentLang = codeLang[key] ?? "curl"

                  // Generate sample code snippets for this endpoint
                  const snippetHost = typeof window !== "undefined" ? window.location.origin : "https://invokix.com"
                  const mockUrl = `${snippetHost}/api/mock-proxy/${projectId}${path.replace(/\{([^}]+)\}/g, "1")}`

                  const curlSnippet = `curl -X ${method.toUpperCase()} "${mockUrl}"${hasBody ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '{"sample": "payload"}'` : ""}`
                  const fetchSnippet = `const response = await fetch("${mockUrl}", {\n  method: "${method.toUpperCase()}",\n  headers: { "Content-Type": "application/json" },\n});\nconst data = await response.json();`
                  const pythonSnippet = `import requests\n\nres = requests.${method.toLowerCase()}("${mockUrl}")\nprint(res.json())`

                  return (
                    <div
                      key={key}
                      className={cn(
                        "overflow-hidden border transition-all duration-200",
                        isOpen
                          ? "border-white/30 bg-[#160D24] shadow-[4px_6px_0_rgba(0,0,0,0.5)]"
                          : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.02]"
                      )}
                    >
                      {/* Accordion Row Header */}
                      <div
                        onClick={() => setExpandedKey(isOpen ? null : key)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold uppercase px-2.5 py-1 border shrink-0",
                              config.bg, config.text, config.border
                            )}
                          >
                            {method}
                          </span>

                          <span className="font-mono text-sm sm:text-base font-semibold text-white truncate">
                            {path}
                          </span>

                          {detail.summary && (
                            <span className="text-xs text-white/50 truncate hidden lg:block">
                              — {detail.summary}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          {hasAuth && (
                            <span className="flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                              <LockSimpleIcon size={11} weight="bold" />
                              Auth
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              testMockEndpoint(method, path)
                            }}
                            disabled={isRunningMock}
                            className="inline-flex items-center gap-1 border border-[#B7FF3C]/40 bg-[#B7FF3C]/15 px-2.5 py-1 text-[11px] font-bold text-[#B7FF3C] hover:bg-[#B7FF3C] hover:text-[#10100B] transition-colors cursor-pointer"
                          >
                            <PlayIcon size={11} weight="fill" />
                            <span>{isRunningMock ? "Testing..." : "Try Mock"}</span>
                          </button>

                          <CaretRightIcon
                            size={16}
                            className={cn(
                              "text-white/40 transition-transform duration-200",
                              isOpen && "rotate-90 text-white"
                            )}
                          />
                        </div>
                      </div>

                      {/* Accordion Body */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-white/10 bg-black/40 p-5 sm:p-6 space-y-6"
                          >
                            {detail.description && (
                              <p className="text-xs leading-relaxed text-white/70">
                                {detail.description}
                              </p>
                            )}

                            {/* Two-Column: Specs on Left, Live Mock & Code on Right */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Left Column: Parameters & Responses */}
                              <div className="space-y-5">
                                {/* Parameters */}
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                                    Parameters ({paramCount})
                                  </p>
                                  {paramCount === 0 ? (
                                    <p className="text-xs text-white/30 italic">No query or path parameters required.</p>
                                  ) : (
                                    <div className="divide-y divide-white/10 border border-white/10 bg-white/[0.02]">
                                      {detail.parameters?.map((p) => (
                                        <div key={p.name} className="flex items-center justify-between p-2.5 text-xs">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono font-semibold text-white">{p.name}</span>
                                            <span className="font-mono text-[10px] text-white/40">({p.in})</span>
                                            {p.required && (
                                              <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 border border-red-500/20">
                                                Required
                                              </span>
                                            )}
                                          </div>
                                          <span className="font-mono text-[11px] text-[#00F0FF]">{p.schema?.type ?? "string"}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Responses */}
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                                    Responses
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(detail.responses ?? { 200: { description: "Successful response" } }).map(([code, r]) => (
                                      <div
                                        key={code}
                                        className={cn(
                                          "flex items-center gap-2 border px-3 py-1.5 text-xs font-mono",
                                          code.startsWith("2")
                                            ? "border-[#B7FF3C]/30 bg-[#B7FF3C]/10 text-[#B7FF3C]"
                                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                        )}
                                      >
                                        <span className="font-bold">{code}</span>
                                        <span className="text-white/60 text-[11px]">{r.description ?? "Response"}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Interactive Mock Runner & Code Snippets */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <SparkleIcon size={14} className="text-[#B7FF3C]" weight="fill" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                                      Live Mock Sandbox
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {(["curl", "fetch", "python"] as const).map((lang) => (
                                      <button
                                        key={lang}
                                        onClick={() => setCodeLang((prev) => ({ ...prev, [key]: lang }))}
                                        className={cn(
                                          "px-2 py-0.5 text-[10px] font-mono uppercase transition-colors cursor-pointer",
                                          currentLang === lang
                                            ? "bg-white text-black font-bold"
                                            : "text-white/50 hover:text-white"
                                        )}
                                      >
                                        {lang}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Code Snippet Box */}
                                <div className="relative border border-white/10 bg-[#09040E] p-3 text-xs font-mono text-white/80 overflow-x-auto">
                                  <button
                                    onClick={() => handleCopy(
                                      currentLang === "curl" ? curlSnippet : currentLang === "fetch" ? fetchSnippet : pythonSnippet,
                                      currentLang
                                    )}
                                    className="absolute top-2 right-2 p-1 text-white/40 hover:text-white transition-colors"
                                    title="Copy snippet"
                                  >
                                    <CopyIcon size={13} />
                                  </button>
                                  <pre className="pr-6 leading-relaxed">
                                    {currentLang === "curl" ? curlSnippet : currentLang === "fetch" ? fetchSnippet : pythonSnippet}
                                  </pre>
                                </div>

                                {/* Live Mock Response Output */}
                                <div className="border border-white/10 bg-[#09040E] p-3 space-y-2">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-mono text-white/50">Mock Response</span>
                                    {mockResult && (
                                      <span className="font-mono text-[#B7FF3C] text-[10px]">
                                        HTTP {mockResult.status} • {mockResult.duration}ms
                                      </span>
                                    )}
                                  </div>

                                  {mockResult ? (
                                    <pre className="max-h-48 overflow-y-auto text-[11px] font-mono text-[#B7FF3C] leading-relaxed">
                                      {JSON.stringify(mockResult.data, null, 2)}
                                    </pre>
                                  ) : (
                                    <div className="py-4 text-center">
                                      <p className="text-xs text-white/40 mb-2">Click below to simulate this endpoint live without running a backend.</p>
                                      <Button
                                        onClick={() => testMockEndpoint(method, path)}
                                        disabled={isRunningMock}
                                        size="sm"
                                        className="rounded-none bg-[#B7FF3C] text-[#10100B] hover:bg-[#cbfb60] font-bold text-xs"
                                      >
                                        <PlayIcon size={12} weight="fill" className="mr-1" />
                                        {isRunningMock ? "Sending..." : "Execute Mock Call"}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FULL CLIENT SDK & CODEGEN */}
        {activeTab === "sdk" && (
          <div className="space-y-6">
            {/* Terminal Quickstart */}
            <div className="border border-white/10 bg-[#160D24] p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#B7FF3C] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Pull into your codebase via Developer CLI
                </span>
              </div>
              <div className="flex items-center justify-between bg-black/60 border border-white/15 px-4 py-3 font-mono text-xs text-[#B7FF3C]">
                <span>$ npx invokix pull</span>
                <button
                  onClick={() => handleCopy("npx invokix pull", "CLI command")}
                  className="text-white/50 hover:text-white"
                >
                  <CopyIcon size={14} />
                </button>
              </div>
              <p className="text-xs text-white/60">
                Pulls full TypeScript interfaces, Zod runtime validation schemas, and TanStack Query hooks directly into your project.
              </p>
            </div>

            {/* SDK Code Viewer */}
            <div className="border border-white/10 bg-[#160D24] overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSdkTab("types")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer",
                      sdkTab === "types" ? "bg-white text-black" : "text-white/60 hover:text-white"
                    )}
                  >
                    api.types.ts
                  </button>
                  <button
                    onClick={() => setSdkTab("hooks")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer",
                      sdkTab === "hooks" ? "bg-white text-black" : "text-white/60 hover:text-white"
                    )}
                  >
                    useApi.ts (React Query)
                  </button>
                  <button
                    onClick={() => setSdkTab("zod")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer",
                      sdkTab === "zod" ? "bg-white text-black" : "text-white/60 hover:text-white"
                    )}
                  >
                    api.schemas.ts (Zod)
                  </button>
                </div>

                <Button
                  onClick={() => handleCopy(
                    sdkTab === "types" ? generatedCode.types : sdkTab === "hooks" ? generatedCode.hooks : generatedCode.zod,
                    sdkTab
                  )}
                  variant="outline"
                  size="sm"
                  className="rounded-none border-white/15 bg-white/5 text-xs text-white hover:bg-white/10 h-7"
                >
                  <CopyIcon size={12} className="mr-1" />
                  Copy File
                </Button>
              </div>

              <div className="p-4 bg-[#09040E] overflow-x-auto max-h-[500px]">
                <pre className="text-xs font-mono text-white/80 leading-relaxed whitespace-pre">
                  {sdkTab === "types" ? generatedCode.types : sdkTab === "hooks" ? generatedCode.hooks : generatedCode.zod}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Viral Growth Callout Banner */}
        <div className="relative overflow-hidden border border-[#B7FF3C]/30 bg-gradient-to-r from-[#170D2A] to-[#251543] p-8 sm:p-10 text-center shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Stop shipping API surprises.
            </h3>
            <p className="text-sm text-white/70">
              Create your own live API contracts, in-process mock servers, and breaking change alerts in 60 seconds with Invokix.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#B7FF3C] px-6 py-3 text-sm font-bold text-[#10100B] shadow-[4px_4px_0_rgba(255,255,255,0.2)] hover:bg-[#cbfb60] transition-transform hover:-translate-y-0.5"
              >
                <span>Build for Free on Invokix</span>
                <ArrowRightIcon size={15} weight="bold" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40">
          <span>Powered by <Link href="/" className="text-white font-bold hover:underline">Invokix</Link> — One Contract. Every Team. In Sync.</span>
          <span>© 2026 Invokix. All rights reserved.</span>
        </footer>
      </main>
    </div>
  )
}
