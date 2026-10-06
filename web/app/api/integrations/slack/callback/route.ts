// app/api/integrations/slack/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { upsertNotifications } from "@/lib/db/queries/notifications"
import { getProjectById } from "@/lib/db/queries/projects"
import { sendSlackTestAlert } from "@/lib/notify/slack"

type StateData = {
  projectId: string
  userId: string
  timestamp: number
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const stateRaw = searchParams.get("state")
  const error = searchParams.get("error")

  let stateData: StateData | null = null
  if (stateRaw) {
    try {
      stateData = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf-8"))
    } catch {
      // ignore
    }
  }

  const fallbackRedirect = stateData?.projectId
    ? `/project/${stateData.projectId}/settings`
    : "/dashboard"

  if (error || !code || !stateData?.projectId) {
    console.warn("[slack-callback] User cancelled or missing code:", error)
    return NextResponse.redirect(new URL(`${fallbackRedirect}?error=slack_cancelled`, req.url))
  }

  const { projectId, userId } = stateData

  try {
    const clientId = process.env.SLACK_CLIENT_ID
    const clientSecret = process.env.SLACK_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL(`/project/${projectId}/settings?error=slack_config_missing`, req.url)
      )
    }

    const origin = req.nextUrl.origin
    const redirectUri = `${origin}/api/integrations/slack/callback`

    const params = new URLSearchParams()
    params.append("client_id", clientId)
    params.append("client_secret", clientSecret)
    params.append("code", code)
    params.append("redirect_uri", redirectUri)

    const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.ok || !tokenData.incoming_webhook?.url) {
      console.error("[slack-callback] OAuth exchange failed:", tokenData)
      return NextResponse.redirect(
        new URL(`/project/${projectId}/settings?error=slack_token_failed`, req.url)
      )
    }

    const webhookUrl = tokenData.incoming_webhook.url

    // Persist webhook to project notifications
    await upsertNotifications(projectId, {
      slackWebhookUrl: webhookUrl,
    })

    // Send immediate confirmation test alert
    try {
      const project = await getProjectById(projectId, userId)
      await sendSlackTestAlert(webhookUrl, project?.name ?? "API Project")
    } catch (testErr) {
      console.warn("[slack-callback] Welcome alert failed (non-fatal):", testErr)
    }

    return NextResponse.redirect(
      new URL(`/project/${projectId}/settings?connected=slack`, req.url)
    )
  } catch (err) {
    console.error("[slack-callback-error]", err)
    return NextResponse.redirect(
      new URL(`/project/${projectId}/settings?error=slack_failed`, req.url)
    )
  }
}
