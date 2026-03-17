// lib/analysis/validator.ts

import type { OpenAPIV3 } from "openapi-types"

export type ValidationStatus = "match" | "missing" | "wrong_type" | "undocumented" | "wrong_enum"

export type ValidationResult = {
  field: string
  status: ValidationStatus
  message: string
  expected?: string
  received?: string
}

export type ValidatorOutput = {
  endpoint: string
  method: string
  results: ValidationResult[]
  matchScore: number
  totalFields: number
  matchedFields: number
}

// ─── Main entry point ────────────────────────────────────────────────────────

export function validateResponse(
  spec: OpenAPIV3.Document,
  method: string,
  path: string,
  responseJson: unknown
): ValidatorOutput {
  const results: ValidationResult[] = []

  // Find the path in the spec
  const pathItem = spec.paths?.[path]
  if (!pathItem) {
    return {
      endpoint: path,
      method,
      results: [{
        field: path,
        status: "undocumented",
        message: "This endpoint does not exist in your contract",
      }],
      matchScore: 0,
      totalFields: 0,
      matchedFields: 0,
    }
  }

  const operation = pathItem[method.toLowerCase() as keyof OpenAPIV3.PathItemObject] as OpenAPIV3.OperationObject | undefined
  if (!operation) {
    return {
      endpoint: path,
      method,
      results: [{
        field: path,
        status: "undocumented",
        message: `Method ${method.toUpperCase()} is not defined for this endpoint in your contract`,
      }],
      matchScore: 0,
      totalFields: 0,
      matchedFields: 0,
    }
  }

  // Get the 200/201 response schema
  const successResponse = operation.responses?.["200"] ?? operation.responses?.["201"]
  if (!successResponse) {
    return {
      endpoint: path,
      method,
      results: [{
        field: path,
        status: "undocumented",
        message: "This endpoint has no response schema defined in your contract. Add a 200 response schema first.",
      }],
      matchScore: 0,
      totalFields: 0,
      matchedFields: 0,
    }
  }

  const responseObj = successResponse as OpenAPIV3.ResponseObject
  const content = responseObj.content?.["application/json"]
  if (!content?.schema) {
    return {
      endpoint: path,
      method,
      results: [{
        field: path,
        status: "undocumented",
        message: "This endpoint has no JSON response schema in your contract.",
      }],
      matchScore: 0,
      totalFields: 0,
      matchedFields: 0,
    }
  }

  const schema = resolveSchema(spec, content.schema)

  // Handle array response
  if (schema.type === "array" && Array.isArray(responseJson)) {
    const firstItem = responseJson[0]
    if (!firstItem) {
      return {
        endpoint: path,
        method,
        results: [{
          field: "response",
          status: "match",
          message: "Response is an empty array — cannot validate item schema",
        }],
        matchScore: 100,
        totalFields: 0,
        matchedFields: 0,
      }
    }
    const itemSchema = resolveSchema(spec, (schema as OpenAPIV3.ArraySchemaObject).items)
    validateObject(spec, firstItem as Record<string, unknown>, itemSchema, "", results)
  } else if (schema.type === "object" || schema.properties) {
    if (typeof responseJson !== "object" || Array.isArray(responseJson) || responseJson === null) {
      results.push({
        field: "response",
        status: "wrong_type",
        message: "Contract expects an object but received an array or null",
        expected: "object",
        received: Array.isArray(responseJson) ? "array" : "null",
      })
    } else {
      validateObject(spec, responseJson as Record<string, unknown>, schema, "", results)
    }
  }

  const matchedFields = results.filter((r) => r.status === "match").length
  const totalFields = results.length
  const matchScore = totalFields === 0 ? 100 : Math.round((matchedFields / totalFields) * 100)

  return {
    endpoint: path,
    method,
    results,
    matchScore,
    totalFields,
    matchedFields,
  }
}

// ─── Recursive object validator ───────────────────────────────────────────────

function validateObject(
  spec: OpenAPIV3.Document,
  data: Record<string, unknown>,
  schema: OpenAPIV3.SchemaObject,
  prefix: string,
  results: ValidationResult[]
): void {
  const properties = schema.properties ?? {}
  const required = schema.required ?? []

  // Check each field defined in the contract
  for (const [fieldName, fieldSchemaDef] of Object.entries(properties)) {
    const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName
    const fieldSchema = resolveSchema(spec, fieldSchemaDef)
    const value = data[fieldName]

    if (value === undefined || value === null) {
      if (required.includes(fieldName)) {
        results.push({
          field: fullPath,
          status: "missing",
          message: `Required field is missing from response`,
          expected: schemaTypeLabel(fieldSchema),
        })
      }
      continue
    }

    // Type check
    const typeError = checkType(value, fieldSchema)
    if (typeError) {
      results.push({
        field: fullPath,
        status: "wrong_type",
        message: typeError,
        expected: schemaTypeLabel(fieldSchema),
        received: typeof value,
      })
      continue
    }

    // Enum check
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      results.push({
        field: fullPath,
        status: "wrong_enum",
        message: `Value "${value}" is not a valid enum member`,
        expected: fieldSchema.enum.join(" | "),
        received: String(value),
      })
      continue
    }

    // Recurse into nested objects
    if (fieldSchema.type === "object" && typeof value === "object" && !Array.isArray(value)) {
      validateObject(spec, value as Record<string, unknown>, fieldSchema, fullPath, results)
      continue
    }

    // Recurse into array items
    if (fieldSchema.type === "array" && Array.isArray(value) && value.length > 0) {
      const itemSchema = resolveSchema(spec, (fieldSchema as OpenAPIV3.ArraySchemaObject).items)
      if (itemSchema.type === "object" && typeof value[0] === "object") {
        validateObject(spec, value[0] as Record<string, unknown>, itemSchema, `${fullPath}[]`, results)
      }
      continue
    }

    results.push({
      field: fullPath,
      status: "match",
      message: `Matches contract`,
      expected: schemaTypeLabel(fieldSchema),
      received: typeof value,
    })
  }

  // Check for undocumented fields in the response
  for (const key of Object.keys(data)) {
    const fullPath = prefix ? `${prefix}.${key}` : key
    if (!(key in properties)) {
      results.push({
        field: fullPath,
        status: "undocumented",
        message: "Field exists in response but is not defined in your contract",
        received: typeof data[key],
      })
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveSchema(
  spec: OpenAPIV3.Document,
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): OpenAPIV3.SchemaObject {
  if ("$ref" in schema) {
    const refPath = schema.$ref.replace("#/components/schemas/", "")
    return (spec.components?.schemas?.[refPath] as OpenAPIV3.SchemaObject) ?? {}
  }
  return schema
}

function checkType(value: unknown, schema: OpenAPIV3.SchemaObject): string | null {
  const type = schema.type

  if (type === "string" && typeof value !== "string") {
    return `Expected string, received ${typeof value}`
  }
  if ((type === "number" || type === "integer") && typeof value !== "number") {
    return `Expected number, received ${typeof value}`
  }
  if (type === "boolean" && typeof value !== "boolean") {
    return `Expected boolean, received ${typeof value}`
  }
  if (type === "array" && !Array.isArray(value)) {
    return `Expected array, received ${typeof value}`
  }
  if (type === "object" && (typeof value !== "object" || Array.isArray(value))) {
    return `Expected object, received ${Array.isArray(value) ? "array" : typeof value}`
  }

  return null
}

function schemaTypeLabel(schema: OpenAPIV3.SchemaObject): string {
  if (schema.enum) return schema.enum.join(" | ")
  if (schema.type === "array") return "array"
  if (schema.format) return `${schema.type} (${schema.format})`
  return schema.type ?? "unknown"
}