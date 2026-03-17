// lib/codegen/types.ts
import openapiTS, { astToString } from "openapi-typescript"

export async function generateTypes(spec: object): Promise<string> {
  try {
    const ast = await openapiTS(JSON.stringify(spec) as never)
    return astToString(ast)
  } catch (e) {
    throw new Error(`Type generation failed: ${e instanceof Error ? e.message : "Unknown error"}`)
  }
}