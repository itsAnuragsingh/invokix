// app/api/team/invite/route.ts
import { type NextRequest } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { createInvite } from "@/lib/db/queries/team"
import { sendInviteEmail } from "@/lib/notify/email"
import { getProjectById } from "@/lib/db/queries/projects"
import { checkTeamMemberLimit } from "@/lib/plans/usage"
import { PLAN_DISPLAY } from "@/lib/plans/limits"

const schema = z.object({
  projectId: z.string().min(1),
  email: z.string().email("Must be a valid email"),
  role: z.enum(["editor", "viewer"]),
})

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return err(
        parsed.error.issues[0]?.message ?? "Invalid request",
        "INVALID_REQUEST",
        400
      )
    }

    const { projectId, email, role } = parsed.data

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    // ── Plan limit: team members ──────────────────────────────────────
    const teamLimit = await checkTeamMemberLimit(project.ownerId, projectId)
    if (!teamLimit.allowed) {
      return err(
        `Team limit reached (${teamLimit.current}/${teamLimit.limit}) on the ${PLAN_DISPLAY[teamLimit.plan].label} plan. Upgrade to invite more members.`,
        "PLAN_LIMIT_EXCEEDED",
        403
      )
    }

    const result = await createInvite(projectId, session.user.id, email, role)

    if ("error" in result) {
      return err(result.error, "INVITE_ERROR", 400)
    }

    // Send invite notification email with updated template
    try {
      await sendInviteEmail({
        to: email,
        inviterName: session.user.name,
        projectName: project.name,
        role,
        token: result.token,
      })
    } catch (emailErr) {
      console.error("[invite] Email failed:", emailErr)
      // Still return success — invite was created, email failed silently
    }

    return ok({ invite: result })
  } catch {
    return err("Failed to send invite", "INVITE_FAILED", 500)
  }
}