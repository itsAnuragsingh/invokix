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

export function mergeSpecs(existing: object, incoming: object): object {
  const ex = existing as OpenApiSpec
  const inc = incoming as OpenApiSpec
  const existingPaths = ex.paths ?? {}
  const incomingPaths = inc.paths ?? {}

  // Merge paths and methods — never destroy existing ones, but enrich existing methods & responses
  const mergedPaths: Record<string, Record<string, unknown>> = { ...existingPaths }
  for (const [path, methods] of Object.entries(incomingPaths)) {
    if (!mergedPaths[path]) {
      mergedPaths[path] = methods as Record<string, unknown>
    } else {
      const mergedMethods: Record<string, unknown> = { ...mergedPaths[path] }
      for (const [method, incDetails] of Object.entries(methods as Record<string, Record<string, unknown>>)) {
        if (!mergedMethods[method]) {
          mergedMethods[method] = incDetails
        } else {
          const exObj = (mergedMethods[method] ?? {}) as Record<string, unknown>
          const incObj = (incDetails ?? {}) as Record<string, unknown>
          mergedMethods[method] = {
            ...exObj,
            ...incObj,
            responses: {
              ...(exObj.responses as Record<string, unknown>),
              ...(incObj.responses as Record<string, unknown>),
            },
          }
        }
      }
      mergedPaths[path] = mergedMethods
    }
  }

  // Merge schemas — incoming adds new schemas and enriches existing property descriptions
  const existingSchemas = ex.components?.schemas ?? {}
  const incomingSchemas = inc.components?.schemas ?? {}
  const mergedSchemas: Record<string, unknown> = { ...existingSchemas }
  for (const [name, schema] of Object.entries(incomingSchemas)) {
    if (!mergedSchemas[name]) {
      mergedSchemas[name] = schema
    } else {
      const exSchema = (mergedSchemas[name] ?? {}) as Record<string, unknown>
      const incSchema = (schema ?? {}) as Record<string, unknown>
      mergedSchemas[name] = {
        ...exSchema,
        ...incSchema,
        properties: {
          ...(exSchema.properties as Record<string, unknown>),
          ...(incSchema.properties as Record<string, unknown>),
        },
      }
    }
  }

  return {
    ...ex,
    paths: mergedPaths,
    components: {
      ...ex.components,
      ...inc.components,
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