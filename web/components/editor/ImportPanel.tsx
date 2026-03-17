// components/editor/ImportPanel.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  FileJsIcon,
  UploadSimpleIcon,
  SparkleIcon,
  LightningIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"
import { GenerateFromText } from "@/components/editor/GenerateFromText"
import { cn } from "@/lib/utils"

type ImportPanelProps = {
  projectId: string
}

const FEATURES = [
  "TypeScript types",
  "React Query v5 hooks",
  "Zod validation schemas",
  "React Native hooks",
  "Contract health score",
  "Breaking change protection",
]

export function ImportPanel({ projectId }: ImportPanelProps) {
  const router = useRouter()
  const [spec, setSpec] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("openapi")

  async function handleImport(type: "openapi" | "postman") {
    if (!spec.trim()) { toast.error("Paste your spec first"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/import/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, spec }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Import failed"); return }
      toast.success("Contract imported!")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Hero section */}
      <div className="relative rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid opacity-20" />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="relative px-8 py-10 flex items-start justify-between gap-8">
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <LightningIcon weight="fill" className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
                3 ways to start
              </Badge>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Add your API contract
              </h2>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                Import an existing spec, paste route code, or describe your API in plain English.
                Get TypeScript types, hooks, and schemas in seconds.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 border border-border/40 rounded-full px-2.5 py-1">
                  <CheckCircleIcon weight="fill" className="h-3 w-3 text-primary/70" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Right side — AI generate CTA */}
          <div className="shrink-0 hidden lg:block">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 w-56">
              <div className="flex items-center gap-2">
                <SparkleIcon weight="fill" className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Start with AI</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Describe your API in plain English — full contract in 3 seconds.
              </p>
              <GenerateFromText
                projectId={projectId}
                trigger={
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 text-xs h-8"
                  >
                    <SparkleIcon className="h-3.5 w-3.5 mr-1.5" />
                    Generate with AI
                    <ArrowRightIcon className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                }
              />
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Powered by Groq Llama 4 · Free
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Import tabs */}
      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            Import Existing API
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Free on all plans — no AI needed
          </p>
        </div>

        <div className="p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 bg-muted/40 border border-border/40">
              <TabsTrigger value="openapi" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileJsIcon className="h-3.5 w-3.5" />
                OpenAPI / Swagger
              </TabsTrigger>
              <TabsTrigger value="postman" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <UploadSimpleIcon className="h-3.5 w-3.5" />
                Postman Collection
              </TabsTrigger>
            </TabsList>

            {(["openapi", "postman"] as const).map((type) => (
              <TabsContent key={type} value={type} className="space-y-3 mt-0">
                <div className="relative">
                  <Textarea
                    placeholder={
                      type === "openapi"
                        ? '{\n  "openapi": "3.0.0",\n  "info": { "title": "My API" },\n  "paths": { ... }\n}'
                        : '{\n  "info": { "name": "My Collection" },\n  "item": [ ... ]\n}'
                    }
                    className="min-h-48 resize-none bg-[#22272e] border-border/50 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                    value={spec}
                    onChange={(e) => setSpec(e.target.value)}
                  />
                  {spec && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                        Ready to import
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    {type === "openapi" ? "JSON or YAML format supported" : "v2.x collection format"}
                  </p>
                  <Button
                    onClick={() => handleImport(type)}
                    disabled={loading || !spec.trim()}
                    className={cn(
                      "px-6 shadow-lg transition-all",
                      spec.trim()
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                        : "opacity-50"
                    )}
                  >
                    {loading ? (
                      <>
                        <div className="h-3.5 w-3.5 mr-2 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        Import {type === "openapi" ? "OpenAPI" : "Postman"}
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Mobile AI CTA */}
      <div className="lg:hidden rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Generate with AI</p>
          <p className="text-xs text-muted-foreground mt-0.5">Describe in plain English</p>
        </div>
        <GenerateFromText projectId={projectId} />
      </div>
    </div>
  )
}