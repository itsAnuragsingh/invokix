// app/share/[contractId]/page.tsx
import { notFound } from "next/navigation"
import { getContractById } from "@/lib/db/queries/contracts"
import { getProjectStackById } from "@/lib/db/queries/projects"
import { generateTypes } from "@/lib/codegen/types"
import { generateHooks, generateNativeHooks } from "@/lib/codegen/hooks"
import { generateZodSchemas } from "@/lib/codegen/zod"
import { ShareOutputCard } from "@/components/editor/ShareOutputCard"
import { Badge } from "@/components/ui/badge"
import {
  LightningIcon,
  ShareNetworkIcon,
  LockSimpleIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react/dist/ssr"

type Props = { params: Promise<{ contractId: string }> }

type Stack = "nextjs" | "react-native" | "express" | "angular" | "other"

type OpenApiSpec = {
  info?: { title?: string; version?: string; description?: string }
  paths?: Record<string, Record<string, {
    summary?: string
    security?: unknown[]
    responses?: Record<string, { description?: string }>
  }>>
}

const METHOD_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  get:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
  post:   { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  put:    { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20" },
  patch:  { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20" },
  delete: { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
}

export default async function SharePage({ params }: Props) {
  const { contractId } = await params

  const contract = await getContractById(contractId)
  if (!contract) notFound()

  const stack = (await getProjectStackById(contract.projectId)) as Stack

  const spec = contract.openApiSpec as OpenApiSpec
  const paths = spec?.paths ?? {}

  const endpoints: Array<{
    method: string
    path: string
    summary?: string
    hasAuth: boolean
    responses: Record<string, { description?: string }>
  }> = []

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, detail] of Object.entries(methods)) {
      if (["get", "post", "put", "patch", "delete"].includes(method)) {
        endpoints.push({
          method,
          path,
          summary: detail.summary,
          hasAuth: !!detail.security?.length,
          responses: detail.responses ?? {},
        })
      }
    }
  }

  const specObj = contract.openApiSpec as object

  const [types, hooks, nativeHooks, zod] = await Promise.all([
    generateTypes(specObj),
    Promise.resolve(generateHooks(specObj)),
    Promise.resolve(generateNativeHooks(specObj)),
    Promise.resolve(generateZodSchemas(specObj)),
  ])

  return (
    <div className="min-h-screen bg-background">

      {/* Top nav */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <LightningIcon weight="fill" className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display font-bold text-sm text-foreground">Invokix</span>
            <span className="text-border/70">·</span>
            <span className="text-sm text-muted-foreground font-medium">
              {spec?.info?.title ?? "API Contract"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 font-mono">
              v{spec?.info?.version ?? contract.version}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground">
              Public · Read only
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="relative rounded-2xl border border-border/50 bg-card/50 overflow-hidden px-8 py-10">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="relative flex items-start justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShareNetworkIcon className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">
                  Shared contract
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {spec?.info?.title ?? "API Contract"}
              </h1>
              {spec?.info?.description && (
                <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                  {spec.info.description}
                </p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary bg-primary/5">
                  v{spec?.info?.version ?? contract.version}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground">
                  {endpoints.length} endpoints
                </Badge>
                <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground">
                  OpenAPI 3.0
                </Badge>
              </div>
            </div>

            {/* Health score */}
            <div className="shrink-0 hidden md:block">
              <div className="rounded-xl border border-border/50 bg-card/80 p-4 text-center space-y-1 min-w-24">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Health</p>
                <p className={`text-3xl font-display font-bold ${
                  (contract.healthScore ?? 0) >= 80 ? "text-emerald-400"
                  : (contract.healthScore ?? 0) >= 50 ? "text-amber-400"
                  : "text-red-400"
                }`}>
                  {contract.healthScore ?? 0}
                </p>
                <p className="text-[10px] text-muted-foreground/50">/ 100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-foreground">Endpoints</h2>
            <span className="text-xs text-muted-foreground">{endpoints.length} total</span>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden divide-y divide-border/30">
            {endpoints.map(({ method, path, summary, hasAuth, responses }) => {
              const config = METHOD_CONFIG[method] ?? METHOD_CONFIG.get
              return (
                <div key={`${method}:${path}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase w-14 justify-center shrink-0 font-mono ${config.bg} ${config.text} ${config.border}`}>
                    {method}
                  </Badge>
                  <span className="font-mono text-sm text-foreground flex-1 truncate">{path}</span>
                  {summary && (
                    <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-48">
                      {summary}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasAuth && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-400/70 bg-amber-500/5 border border-amber-500/15 rounded-full px-1.5 py-0.5">
                        <LockSimpleIcon weight="fill" className="h-2.5 w-2.5" />
                        Auth
                      </div>
                    )}
                    {Object.keys(responses).map((code) => (
                      <span key={code} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        code.startsWith("2") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : code.startsWith("4") ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Generated outputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-foreground">Generated Code</h2>
            <span className="text-xs text-muted-foreground">Copy and use directly</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ShareOutputCard
              title="TypeScript Types"
              filename="types.ts"
              icon="types"
              content={types}
            />
            {stack === "nextjs" && (
              <ShareOutputCard
                title="React Query v5"
                filename="useApi.ts"
                icon="hooks"
                content={hooks}
                badge="Only tool"
              />
            )}
            {stack === "react-native" && (
              <ShareOutputCard
                title="React Native"
                filename="useApiNative.ts"
                icon="mobile"
                content={nativeHooks}
              />
            )}
            <ShareOutputCard
              title="Zod Schemas"
              filename="schemas.ts"
              icon="shield"
              content={zod}
              badge="Only tool"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-6 border-t border-border/40">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <LightningIcon weight="fill" className="h-3 w-3 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">
              Powered by <span className="text-foreground font-semibold">Invokix</span> — Your API's home
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
            <CheckCircleIcon weight="fill" className="h-3 w-3 text-emerald-400" />
            Always reflects latest published version
          </div>
        </div>
      </div>
    </div>
  )
}