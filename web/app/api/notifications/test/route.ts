// app/api/notifications/test/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getProjectById } from "@/lib/db/queries/projects"
import { getNotificationsByProjectId } from "@/lib/db/queries/notifications"
import { sendSlackTestAlert } from "@/lib/notify/slack"
import { sendDiscordTestAlert } from "@/lib/notify/discord"
import { z } from "zod"

const schema = z.object({
  projectId: z.string().min(1),
  type: z.enum(["slack", "discord"]),
})

export async function POST(req: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request parameters", "INVALID_REQUEST", 400)

    const { projectId, type } = parsed.data

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found or forbidden", "NOT_FOUND", 404)

    const notifications = await getNotificationsByProjectId(projectId)
    if (!notifications) return err("No notifications configured", "NOT_CONFIGURED", 400)

    if (type === "discord") {
      if (!notifications.discordWebhookUrl) {
        return err("Discord is not connected", "DISCORD_NOT_CONNECTED", 400)
      }
      await sendDiscordTestAlert(notifications.discordWebhookUrl, project.name)
      return ok({ message: "Discord test notification sent!" })
    }

    if (type === "slack") {
      if (!notifications.slackWebhookUrl) {
        return err("Slack is not connected", "SLACK_NOT_CONNECTED", 400)
      }
      await sendSlackTestAlert(notifications.slackWebhookUrl, project.name)
      return ok({ message: "Slack test notification sent!" })
    }

    return err("Unsupported notification type", "INVALID_TYPE", 400)
  } catch (e) {
    console.error("[notification-test-error]", e)
    return err(
      e instanceof Error ? e.message : "Failed to send test notification",
      "SEND_FAILED",
      500
    )
  }
}
