// app/api/cli/auth/poll/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getCliSession } from "@/lib/db/queries/cli"

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session")
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session id", code: "MISSING_SESSION" },
        { status: 400 }
      )
    }

    const session = await getCliSession(sessionId)

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session expired or not found", code: "SESSION_EXPIRED" },
        { status: 404 }
      )
    }

    // Not confirmed yet — CLI keeps polling
    if (!session.confirmedAt || !session.token) {
      return NextResponse.json({
        success: true,
        data: { confirmed: false },
      })
    }

    // Confirmed — return token to CLI
    return NextResponse.json({
      success: true,
      data: {
        confirmed: true,
        token: session.token,
      },
    })
  } catch (err) {
    console.error("[cli/auth/poll]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}