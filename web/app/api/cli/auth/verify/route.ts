// app/api/cli/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyCliToken } from "@/lib/db/queries/cli"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = body.token as string | undefined

    if (!token || !token.startsWith("ik_live_")) {
      return NextResponse.json(
        { success: false, error: "Invalid API key format", code: "INVALID_TOKEN" },
        { status: 401 }
      )
    }

    const cliToken = await verifyCliToken(token)
    if (!cliToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or revoked API key", code: "INVALID_TOKEN" },
        { status: 401 }
      )
    }

    // Get user info to return to CLI
    const user = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, cliToken.userId))
      .limit(1)
      .then((r) => r[0])

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    console.error("[cli/auth/verify]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}