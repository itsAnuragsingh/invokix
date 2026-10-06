// app/share/[contractId]/page.tsx
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getContractById, getContractByProjectId } from "@/lib/db/queries/contracts"
import { getProjectStackById } from "@/lib/db/queries/projects"
import { generateTypes } from "@/lib/codegen/types"
import { generateHooks, generateNativeHooks } from "@/lib/codegen/hooks"
import { generateZodSchemas } from "@/lib/codegen/zod"
import { PublicContractViewer } from "@/components/share/PublicContractViewer"

type Props = { params: Promise<{ contractId: string }> }

type OpenApiSpec = {
  info?: { title?: string; version?: string; description?: string }
  paths?: Record<
    string,
    Record<
      string,
      {
        summary?: string
        description?: string
        operationId?: string
        parameters?: Array<{
          name: string
          in: string
          required?: boolean
          description?: string
          schema?: { type?: string }
        }>
        requestBody?: {
          required?: boolean
          content?: Record<string, { schema?: unknown }>
        }
        responses?: Record<string, { description?: string }>
        security?: Array<Record<string, string[]>>
      }
    >
  >
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { contractId } = await params
  const contract =
    (await getContractById(contractId)) ??
    (await getContractByProjectId(contractId))

  if (!contract) {
    return { title: "API Contract Not Found | Invokix" }
  }

  const spec = (contract.openApiSpec ?? {}) as OpenApiSpec
  const title = spec?.info?.title ?? "API Contract"
  const version = spec?.info?.version ?? contract.version ?? "1.0"
  const description =
    spec?.info?.description ??
    `Interactive OpenAPI 3.0 specification, live mock server, and client SDKs for ${title} on Invokix.`

  return {
    title: `${title} (v${version}) | Invokix Public Contract`,
    description,
    openGraph: {
      title: `${title} (v${version}) - Interactive API Contract`,
      description,
      type: "website",
      siteName: "Invokix",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} (v${version}) | Invokix`,
      description,
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { contractId } = await params

  // 1. Resolve contract either by contract.id or by project.id
  const contract =
    (await getContractById(contractId)) ??
    (await getContractByProjectId(contractId))

  if (!contract) notFound()

  const stack = ((await getProjectStackById(contract.projectId)) as string) ?? "nextjs"
  const spec = (contract.openApiSpec ?? {}) as OpenApiSpec
  const paths = spec?.paths ?? {}

  // 2. Parse endpoints for interactive viewer
  const endpoints: Array<{
    method: string
    path: string
    detail: {
      summary?: string
      description?: string
      operationId?: string
      parameters?: Array<{
        name: string
        in: string
        required?: boolean
        description?: string
        schema?: { type?: string }
      }>
      requestBody?: {
        required?: boolean
        content?: Record<string, { schema?: unknown }>
      }
      responses?: Record<string, { description?: string }>
      security?: Array<Record<string, string[]>>
    }
  }> = []

  for (const [path, methods] of Object.entries(paths)) {
    if (!methods || typeof methods !== "object") continue
    for (const [method, detail] of Object.entries(methods)) {
      if (["get", "post", "put", "patch", "delete"].includes(method.toLowerCase())) {
        endpoints.push({
          method: method.toLowerCase(),
          path,
          detail: {
            summary: detail.summary,
            description: detail.description,
            operationId: detail.operationId,
            parameters: Array.isArray(detail.parameters) ? detail.parameters : undefined,
            requestBody: detail.requestBody,
            responses: detail.responses ?? {},
            security: Array.isArray(detail.security) ? detail.security : undefined,
          },
        })
      }
    }
  }

  const specObj = (contract.openApiSpec ?? {}) as object

  // 3. Generate client SDK outputs with error fallbacks
  let types = ""
  let hooks = ""
  let nativeHooks = ""
  let zod = ""

  try {
    types = await generateTypes(specObj)
  } catch (err) {
    types = `// TypeScript types could not be auto-generated\n// Error: ${err instanceof Error ? err.message : "Schema error"}`
  }

  try {
    hooks = generateHooks(specObj)
  } catch (err) {
    hooks = `// TanStack React Query hooks generation failed\n// Error: ${err instanceof Error ? err.message : "Schema error"}`
  }

  try {
    nativeHooks = generateNativeHooks(specObj)
  } catch {
    nativeHooks = ""
  }

  try {
    zod = generateZodSchemas(specObj)
  } catch (err) {
    zod = `// Zod validation schemas generation failed\n// Error: ${err instanceof Error ? err.message : "Schema error"}`
  }

  return (
    <PublicContractViewer
      contractId={contract.id}
      projectId={contract.projectId}
      title={spec?.info?.title ?? "API Contract"}
      version={spec?.info?.version ?? contract.version ?? "1.0"}
      description={spec?.info?.description}
      healthScore={contract.healthScore ?? 85}
      endpoints={endpoints}
      rawSpec={specObj}
      generatedCode={{
        types,
        hooks,
        nativeHooks,
        zod,
        stack,
      }}
    />
  )
}