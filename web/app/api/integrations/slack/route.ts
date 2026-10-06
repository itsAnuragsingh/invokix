// app/api/integrations/slack/route.ts
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

    const project = await getProjectById(projectId, session.user.id)
    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 })
    }

    const clientId = process.env.SLACK_CLIENT_ID
    if (!clientId) {
      return NextResponse.redirect(
        new URL(`/project/${projectId}/settings?error=slack_not_configured`, req.url)
      )
    }

    const origin = req.nextUrl.origin
    const redirectUri = `${origin}/api/integrations/slack/callback`

    const statePayload = {
      projectId,
      userId: session.user.id,
      timestamp: Date.now(),
    }
    const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url")

    const slackAuthUrl = new URL("https://slack.com/oauth/v2/authorize")
    slackAuthUrl.searchParams.set("client_id", clientId)
    slackAuthUrl.searchParams.set("scope", "incoming-webhook")
    slackAuthUrl.searchParams.set("redirect_uri", redirectUri)
    slackAuthUrl.searchParams.set("state", state)

    return NextResponse.redirect(slackAuthUrl.toString())
  } catch (err) {
    console.error("[slack-oauth-start]", err)
    return NextResponse.json({ error: "Failed to initiate Slack connection" }, { status: 500 })
  }
}
