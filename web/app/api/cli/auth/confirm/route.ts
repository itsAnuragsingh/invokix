// app/api/cli/auth/confirm/route.ts
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { getCliSession, confirmCliSession } from "@/lib/db/queries/cli"

export async function POST(req: NextRequest) {
  try {
    // Must be logged in to confirm
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to confirm CLI access", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const sessionId = body.sessionId as string | undefined

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing session id", code: "MISSING_SESSION" },
        { status: 400 }
      )
    }

    // Check session exists and is not expired
    const cliSession = await getCliSession(sessionId)
    if (!cliSession) {
      return NextResponse.json(
        { success: false, error: "Session expired or not found. Go back to your terminal and try again.", code: "SESSION_EXPIRED" },
        { status: 404 }
      )
    }

    // Already confirmed
    if (cliSession.confirmedAt) {
      return NextResponse.json(
        { success: false, error: "This session has already been confirmed", code: "ALREADY_CONFIRMED" },
        { status: 400 }
      )
    }

    // Confirm and create token
    await confirmCliSession(sessionId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[cli/auth/confirm]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}