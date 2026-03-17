// app/api/cli/projects/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyCliToken } from "@/lib/db/queries/cli"
import { getProjectsByUserId } from "@/lib/db/queries/projects"

export async function GET(req: NextRequest) {
  try {
    // Auth via Bearer token
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ik_live_")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const cliToken = await verifyCliToken(token)
    if (!cliToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or revoked API key", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const projects = await getProjectsByUserId(cliToken.userId)

    return NextResponse.json({
      success: true,
      data: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        stack: p.stack,
      })),
    })
  } catch (err) {
    console.error("[cli/projects]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}