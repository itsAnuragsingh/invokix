// app/api/cli/tokens/route.ts
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { createCliToken } from "@/lib/db/queries/cli"
import { z } from "zod"

const BodySchema = z.object({
  name: z.string().min(1).max(50),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid request body", code: "INVALID_BODY" }, { status: 400 })
    }

    const result = await createCliToken(session.user.id, parsed.data.name)

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error("[cli/tokens POST]", err)
    return NextResponse.json({ success: false, error: "Something went wrong", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}