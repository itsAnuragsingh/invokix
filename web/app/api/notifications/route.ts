// app/api/notifications/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getProjectById } from "@/lib/db/queries/projects"
import { upsertNotifications, getNotificationsByProjectId } from "@/lib/db/queries/notifications"
import { checkFeatureAccess } from "@/lib/plans/usage"
import { PLAN_DISPLAY } from "@/lib/plans/limits"
import { z } from "zod"

const schema = z.object({
  projectId: z.string().min(1),
  slackWebhookUrl: z.string().url().optional().or(z.literal("")),
  discordWebhookUrl: z.string().url().optional().or(z.literal("")),
  alertOnBreaking: z.boolean().default(true),
  alertOnAny: z.boolean().default(false),
})

export async function GET(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    if (!projectId) return err("projectId required", "INVALID_REQUEST", 400)

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const notification = await getNotificationsByProjectId(projectId)
    return ok(notification)
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    // ── Plan gate: alerts ───────────────────────────────────────────
    const access = await checkFeatureAccess(session.user.id, "canAlerts")
    if (!access.allowed) {
      return err(
        `Slack & Discord alerts are available on the Pro plan and above. You're on the ${PLAN_DISPLAY[access.plan].label} plan.`,
        "PLAN_FEATURE_LOCKED",
        403
      )
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const { projectId, ...data } = parsed.data

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const notification = await upsertNotifications(projectId, {
      ...data,
      slackWebhookUrl: data.slackWebhookUrl || undefined,
      discordWebhookUrl: data.discordWebhookUrl || undefined,
    })

    return ok(notification)
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}