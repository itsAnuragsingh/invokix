// lib/ai/merge.ts
type OpenApiSpec = {
  openapi?: string
  info?: Record<string, unknown>
  paths?: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, unknown>
    [key: string]: unknown
  }
  [key: string]: unknown
}

export function mergeSpecs(existing: OpenApiSpec, incoming: OpenApiSpec): OpenApiSpec {
  const existingPaths = existing.paths ?? {}
  const incomingPaths = incoming.paths ?? {}

  // Only add new paths — never overwrite existing ones
  const mergedPaths: Record<string, Record<string, unknown>> = { ...existingPaths }
  for (const [path, methods] of Object.entries(incomingPaths)) {
    if (!mergedPaths[path]) {
      mergedPaths[path] = methods as Record<string, unknown>
    }
    // path already exists — skip, protect existing
  }

  // Merge schemas — incoming only adds, never overwrites
  const existingSchemas = existing.components?.schemas ?? {}
  const incomingSchemas = incoming.components?.schemas ?? {}
  const mergedSchemas: Record<string, unknown> = { ...existingSchemas }
  for (const [name, schema] of Object.entries(incomingSchemas)) {
    if (!mergedSchemas[name]) {
      mergedSchemas[name] = schema
    }
  }

  return {
    ...existing,
    paths: mergedPaths,
    components: {
      ...existing.components,
      ...incoming.components,
      schemas: mergedSchemas,
    },
  }
}

export function isEmptySpec(spec: unknown): boolean {
  if (!spec || typeof spec !== "object") return true
  const s = spec as OpenApiSpec
  const paths = s.paths ?? {}
  return Object.keys(paths).length === 0
}