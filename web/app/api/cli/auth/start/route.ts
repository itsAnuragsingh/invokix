// app/api/cli/auth/start/route.ts
import { NextResponse } from "next/server"
import { createCliSession } from "@/lib/db/queries/cli"

export async function POST() {
  try {
    const session = await createCliSession()

    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cli-auth?session=${session.id}`

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        confirmUrl,
        expiresAt: session.expiresAt,
      },
    })
  } catch (err) {
    console.error("[cli/auth/start]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}