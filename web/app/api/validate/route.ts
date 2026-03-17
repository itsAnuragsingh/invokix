// app/api/validate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { contracts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { validateResponse } from "@/lib/analysis/validator"
import type { OpenAPIV3 } from "openapi-types"

const ValidateBodySchema = z.object({
  contractId: z.string().min(1),
  method: z.string().min(1),
  path: z.string().min(1),
  responseJson: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    // 2. Validate body
    const body = await req.json()
    const parsed = ValidateBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request body", code: "INVALID_BODY" }, { status: 400 })
    }

    const { contractId, method, path, responseJson } = parsed.data

    // 3. Parse the response JSON
    let parsedResponse: unknown
    try {
      parsedResponse = JSON.parse(responseJson)
    } catch {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON — check your response for syntax errors",
        code: "INVALID_JSON",
      }, { status: 400 })
    }

    // 4. Load the contract
    const contract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1)
      .then((r) => r[0])

    if (!contract) {
      return NextResponse.json({ success: false, error: "Contract not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // 5. Run validation
    const result = validateResponse(
      contract.openApiSpec as OpenAPIV3.Document,
      method,
      path,
      parsedResponse
    )

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error("[validate POST]", err)
    return NextResponse.json({ success: false, error: "Something went wrong", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}