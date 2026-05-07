// lib/codegen/mock.ts
import type { OpenAPIV3 } from "openapi-types"
import { nanoid } from "nanoid"

// ── Resolve $ref ──────────────────────────────────────────────────────────────
function resolveRef(
  spec: OpenAPIV3.Document,
  refOrSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): OpenAPIV3.SchemaObject {
  if (!("$ref" in refOrSchema)) return refOrSchema
  const refPath = refOrSchema.$ref.replace("#/components/schemas/", "")
  const resolved = spec.components?.schemas?.[refPath]
  if (!resolved) return {}
  if ("$ref" in resolved) return resolveRef(spec, resolved)
  return resolved as OpenAPIV3.SchemaObject
}

// ── Randomize based on example value + schema hints ──────────────────────────
function randomizeFromExample(
  schema: OpenAPIV3.SchemaObject,
  fieldName: string
): unknown {
  const example = schema.example
  const format = schema.format

  // UUID format — always generate a fresh one
  if (
    format === "uuid" ||
    (typeof example === "string" && /^[0-9a-f-]{36}$/i.test(example))
  ) {
    const s = nanoid(32)
    return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`
  }

  // Prefixed IDs like "order_abc123", "pay_abc123", "cus_abc123", "sub_abc123"
  if (typeof example === "string" && /^[a-z]+_[a-zA-Z0-9]+$/.test(example)) {
    const prefix = example.split("_")[0]
    return `${prefix}_${nanoid(8)}`
  }

  // JWT tokens — generate a fake but realistic-looking token
  if (
    typeof example === "string" &&
    example.startsWith("eyJ")
  ) {
    return `eyJhbGciOiJIUzI1NiJ9.${nanoid(32)}.${nanoid(16)}`
  }

  // Timestamps — return a recent random date within last 30 days
  if (
    format === "date-time" ||
    (typeof example === "string" && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(example))
  ) {
    const offsetMs = Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    return new Date(Date.now() - offsetMs).toISOString()
  }

  // Date only
  if (
    format === "date" ||
    (typeof example === "string" && /^\d{4}-\d{2}-\d{2}$/.test(example))
  ) {
    const offsetMs = Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    return new Date(Date.now() - offsetMs).toISOString().split("T")[0]
  }

  // Numbers — vary by ±20% around example value
  if (typeof example === "number") {
    const variance = example * 0.2
    const min = Math.max(0, example - variance)
    const max = example + variance
    const val = Math.random() * (max - min) + min
    return schema.type === "integer" ? Math.floor(val) : Math.round(val * 100) / 100
  }

  // Enums — pick random value instead of always the example
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[Math.floor(Math.random() * schema.enum.length)]
  }

  // Boolean — randomize
  if (typeof example === "boolean") {
    return Math.random() > 0.5
  }

  // URI — return example as-is (randomizing URLs isn't useful)
  if (format === "uri" || (typeof example === "string" && example.startsWith("https://"))) {
    return example
  }

  // Everything else (emails, phone numbers, names, etc.) — return as-is
  return example
}

// ── Generate fake value from schema ──────────────────────────────────────────
function generateValue(
  spec: OpenAPIV3.Document,
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  fieldName = ""
): unknown {
  const resolved = resolveRef(spec, schema)

  // Example present — randomize intelligently instead of returning verbatim
  if (resolved.example !== undefined) {
    return randomizeFromExample(resolved, fieldName)
  }

  // Enum — pick random value
  if (resolved.enum && resolved.enum.length > 0) {
    return resolved.enum[Math.floor(Math.random() * resolved.enum.length)]
  }

  const type = resolved.type

  // String
  if (type === "string") {
    if (resolved.format === "uuid") {
      const s = nanoid(32)
      return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`
    }
    if (resolved.format === "email") return `user_${nanoid(5)}@example.com`
    if (resolved.format === "date-time") return new Date().toISOString()
    if (resolved.format === "date") return new Date().toISOString().split("T")[0]
    if (resolved.format === "uri") return "https://example.com"

    const name = fieldName.toLowerCase()
    if (name.includes("email")) return `user_${nanoid(5)}@example.com`
    if (name.includes("name")) return "Sample Name"
    if (name.includes("title")) return "Sample Title"
    if (name.includes("description")) return "Sample description"
    if (name.includes("url") || name.includes("image")) return "https://example.com"
    if (name.includes("phone")) return "+1234567890"
    if (name.includes("status")) return "active"
    if (name.includes("address")) return "123 Main St"
    if (name.includes("city")) return "New York"
    if (name.includes("country")) return "US"
    if (name.includes("currency")) return "USD"
    if (name.includes("color")) return "#5c6bc0"
    if (name.includes("message")) return "Sample message"
    if (name.includes("token")) return "sample-token-" + nanoid(8)
    if (name.includes("key")) return "sample-key-" + nanoid(8)

    return fieldName ? fieldName + "-" + nanoid(6) : "sample-" + nanoid(6)
  }

  // Number / integer
  if (type === "number" || type === "integer") {
    const min = typeof resolved.minimum === "number" ? resolved.minimum : 0
    const max = typeof resolved.maximum === "number" ? resolved.maximum : 100
    const value = Math.random() * (max - min) + min
    if (type === "integer") return Math.floor(value)
    return Math.round(value * 100) / 100
  }

  // Boolean
  if (type === "boolean") return Math.random() > 0.5

  // Array — generate 2 items
  if (type === "array") {
    const items = (resolved as OpenAPIV3.ArraySchemaObject).items
    if (!items) return []
    return [
      generateValue(spec, items, fieldName),
      generateValue(spec, items, fieldName),
    ]
  }

  // Object
  if (type === "object" || resolved.properties) {
    const result: Record<string, unknown> = {}
    const properties = resolved.properties ?? {}
    for (const [key, propSchema] of Object.entries(properties)) {
      result[key] = generateValue(spec, propSchema, key)
    }
    return result
  }

  return null
}

// ── Match path with params ────────────────────────────────────────────────────
function matchPath(
  specPath: string,
  requestPath: string
): Record<string, string> | null {
  const specParts = specPath.split("/").filter(Boolean)
  const reqParts = requestPath.split("/").filter(Boolean)

  if (specParts.length !== reqParts.length) return null

  const params: Record<string, string> = {}

  for (let i = 0; i < specParts.length; i++) {
    const specPart = specParts[i]!
    const reqPart = reqParts[i]!

    if (specPart.startsWith("{") && specPart.endsWith("}")) {
      const paramName = specPart.slice(1, -1)
      params[paramName] = reqPart
    } else if (specPart !== reqPart) {
      return null
    }
  }

  return params
}

// ── Find operation in spec ────────────────────────────────────────────────────
type MatchedOperation = {
  operation: OpenAPIV3.OperationObject
  pathParams: Record<string, string>
}

function findOperation(
  spec: OpenAPIV3.Document,
  method: string,
  requestPath: string
): MatchedOperation | null {
  if (!spec.paths) return null

  for (const [specPath, pathItem] of Object.entries(spec.paths)) {
    if (!pathItem) continue

    const params = matchPath(specPath, requestPath)
    if (params === null) continue

    const op = pathItem[method.toLowerCase() as keyof OpenAPIV3.PathItemObject] as
      | OpenAPIV3.OperationObject
      | undefined
    if (!op) continue

    return { operation: op, pathParams: params }
  }

  return null
}

// ── Get success status code ───────────────────────────────────────────────────
function getSuccessStatus(
  operation: OpenAPIV3.OperationObject,
  method: string
): number {
  const responses = operation.responses ?? {}
  for (const code of ["200", "201", "202", "204"]) {
    if (responses[code]) return parseInt(code)
  }
  if (method.toUpperCase() === "POST") return 201
  if (method.toUpperCase() === "DELETE") return 204
  return 200
}

// ── Main export ───────────────────────────────────────────────────────────────
export type MockResponse = {
  status: number
  body: unknown
  contentType: string
}

export function generateMockResponse(
  spec: OpenAPIV3.Document,
  method: string,
  requestPath: string
): MockResponse {
  const matched = findOperation(spec, method, requestPath)

  if (!matched) {
    return {
      status: 404,
      body: { error: "Endpoint not found in contract", path: requestPath, method },
      contentType: "application/json",
    }
  }

  const { operation } = matched
  const statusCode = getSuccessStatus(operation, method)

  // No content
  if (statusCode === 204) {
    return { status: 204, body: null, contentType: "application/json" }
  }

  const response = operation.responses?.[String(statusCode)] as
    | OpenAPIV3.ResponseObject
    | undefined

  if (!response) {
    return { status: statusCode, body: {}, contentType: "application/json" }
  }

  const jsonContent = response.content?.["application/json"]
  if (!jsonContent?.schema) {
    return { status: statusCode, body: {}, contentType: "application/json" }
  }

  const body = generateValue(spec, jsonContent.schema)

  return { status: statusCode, body, contentType: "application/json" }
}