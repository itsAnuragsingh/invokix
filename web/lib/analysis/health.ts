// lib/analysis/health.ts
type OpenApiSpec = {
  info?: { title?: string; description?: string }
  paths?: Record<string, Record<string, {
    summary?: string
    description?: string
    parameters?: Array<{ name: string; in: string; description?: string }>
    requestBody?: {
      content?: Record<string, { schema?: { properties?: Record<string, { description?: string }> } }>
    }
    responses?: Record<string, { description?: string }>
  }>>
  components?: {
    schemas?: Record<string, {
      deprecated?: boolean
      properties?: Record<string, { description?: string }>
      "x-sunset"?: string
    }>
  }
}

export type HealthIssue = {
  severity: "error" | "warning"
  message: string
  path: string
}

export type HealthResult = {
  score: number
  issues: HealthIssue[]
}

export function computeHealthScore(spec: object): HealthResult {
  const s = spec as OpenApiSpec
  const issues: HealthIssue[] = []
  const paths = s.paths ?? {}
  const schemas = s.components?.schemas ?? {}

  // Check each endpoint
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue

      // Missing summary
      if (!details.summary?.trim()) {
        issues.push({
          severity: "warning",
          message: `${method.toUpperCase()} ${path} — missing summary`,
          path,
        })
      }

      // Missing 401 response
      if (!details.responses?.["401"]) {
        issues.push({
          severity: "warning",
          message: `${method.toUpperCase()} ${path} — missing 401 error response`,
          path,
        })
      }

      // Missing 500 response
      if (!details.responses?.["500"]) {
        issues.push({
          severity: "warning",
          message: `${method.toUpperCase()} ${path} — missing 500 error response`,
          path,
        })
      }

      // Missing response entirely
      if (!details.responses || Object.keys(details.responses).length === 0) {
        issues.push({
          severity: "error",
          message: `${method.toUpperCase()} ${path} — no response schema defined`,
          path,
        })
      }

      // Request body fields missing descriptions
      if (details.requestBody?.content) {
        for (const content of Object.values(details.requestBody.content)) {
          const properties = content.schema?.properties ?? {}
          const missing = Object.entries(properties)
            .filter(([, v]) => !v.description)
            .map(([k]) => k)
          if (missing.length > 0) {
            issues.push({
              severity: "warning",
              message: `${method.toUpperCase()} ${path} — fields missing description: ${missing.join(", ")}`,
              path,
            })
          }
        }
      }
    }
  }

  // Check schemas
  for (const [name, schema] of Object.entries(schemas)) {
    // Deprecated without sunset date
    if (schema.deprecated && !schema["x-sunset"]) {
      issues.push({
        severity: "error",
        message: `Schema "${name}" — deprecated but no sunset date set`,
        path: `components/schemas/${name}`,
      })
    }
  }

  // Naming conflicts — snake_case vs camelCase
  const allFields: string[] = []
  for (const schema of Object.values(schemas)) {
    if (schema.properties) {
      allFields.push(...Object.keys(schema.properties))
    }
  }
  const hasSnake = allFields.some((f) => f.includes("_"))
  const hasCamel = allFields.some((f) => /[a-z][A-Z]/.test(f))
  if (hasSnake && hasCamel) {
    issues.push({
      severity: "error",
      message: "Naming conflict — mix of snake_case and camelCase fields detected",
      path: "components/schemas",
    })
  }

  // Calculate score
  const errorCount = issues.filter((i) => i.severity === "error").length
  const warningCount = issues.filter((i) => i.severity === "warning").length
  const deduction = errorCount * 15 + warningCount * 5
  const score = Math.max(0, Math.min(100, 100 - deduction))

  return { score, issues }
}