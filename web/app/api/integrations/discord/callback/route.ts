// app/api/integrations/discord/callback/route.ts
import { NextRequest, NextResponse } from "next/server"
import { upsertNotifications } from "@/lib/db/queries/notifications"
import { getProjectById } from "@/lib/db/queries/projects"
import { sendDiscordTestAlert } from "@/lib/notify/discord"

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
    console.warn("[discord-callback] User cancelled or missing code:", error)
    return NextResponse.redirect(new URL(`${fallbackRedirect}?error=discord_cancelled`, req.url))
  }

  const { projectId, userId } = stateData

  try {
    const clientId = process.env.DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL(`/project/${projectId}/settings?error=discord_config_missing`, req.url)
      )
    }

    const origin = req.nextUrl.origin
    const redirectUri = `${origin}/api/integrations/discord/callback`

    // Exchange code for token and webhook
    const params = new URLSearchParams()
    params.append("client_id", clientId)
    params.append("client_secret", clientSecret)
    params.append("grant_type", "authorization_code")
    params.append("code", code)
    params.append("redirect_uri", redirectUri)

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => "")
      console.error("[discord-callback] Token exchange failed:", tokenRes.status, errText)
      return NextResponse.redirect(
        new URL(`/project/${projectId}/settings?error=discord_token_failed`, req.url)
      )
    }

    const tokenData = await tokenRes.json()
    const webhookUrl = tokenData.webhook?.url

    if (!webhookUrl) {
      console.error("[discord-callback] No webhook URL returned by Discord:", tokenData)
      return NextResponse.redirect(
        new URL(`/project/${projectId}/settings?error=discord_no_webhook`, req.url)
      )
    }

    // Persist webhook to project notifications
    await upsertNotifications(projectId, {
      discordWebhookUrl: webhookUrl,
    })

    // Optionally fire welcome confirmation alert into the new channel
    try {
      const project = await getProjectById(projectId, userId)
      await sendDiscordTestAlert(webhookUrl, project?.name ?? "API Project")
    } catch (testErr) {
      console.warn("[discord-callback] Welcome alert failed (non-fatal):", testErr)
    }

    return NextResponse.redirect(
      new URL(`/project/${projectId}/settings?connected=discord`, req.url)
    )
  } catch (err) {
    console.error("[discord-callback-error]", err)
    return NextResponse.redirect(
      new URL(`/project/${projectId}/settings?error=discord_failed`, req.url)
    )
  }
}
