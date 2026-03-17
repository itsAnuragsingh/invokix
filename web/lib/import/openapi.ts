// lib/import/openapi.ts
import SwaggerParser from "@apidevtools/swagger-parser"

export async function parseOpenApiSpec(raw: string): Promise<object> {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error("Invalid JSON — paste a valid OpenAPI spec")
  }

  try {
    const validated = await SwaggerParser.dereference(parsed as never)
    return validated as object
  } catch (e) {
    throw new Error(`Invalid OpenAPI spec: ${e instanceof Error ? e.message : "Unknown error"}`)
  }
}