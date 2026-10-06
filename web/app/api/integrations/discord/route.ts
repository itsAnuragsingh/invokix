// app/api/integrations/discord/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/auth/session"
import { getProjectById } from "@/lib/db/queries/projects"

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession()
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 })
    }

    // Verify user has access to this project
    const project = await getProjectById(projectId, session.user.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 })
    }

    const clientId = process.env.DISCORD_CLIENT_ID
    if (!clientId) {
      return NextResponse.redirect(
        new URL(`/project/${projectId}/settings?error=discord_not_configured`, req.url)
      )
    }

    const origin = req.nextUrl.origin
    const redirectUri = `${origin}/api/integrations/discord/callback`

    const statePayload = {
      projectId,
      userId: session.user.id,
      timestamp: Date.now(),
    }
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url")

    const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize")
    discordAuthUrl.searchParams.set("client_id", clientId)
    discordAuthUrl.searchParams.set("response_type", "code")
    discordAuthUrl.searchParams.set("scope", "webhook.incoming")
    discordAuthUrl.searchParams.set("redirect_uri", redirectUri)
    discordAuthUrl.searchParams.set("state", state)
    discordAuthUrl.searchParams.set("prompt", "consent")

    return NextResponse.redirect(discordAuthUrl.toString())
  } catch (err) {
    console.error("[discord-oauth-start]", err)
    return NextResponse.json({ error: "Failed to initiate Discord connection" }, { status: 500 })
  }
}
