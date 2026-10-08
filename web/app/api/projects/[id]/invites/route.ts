// app/api/projects/[id]/invites/route.ts
import { NextRequest } from "next/server"
import { requireProjectRole } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { createInvite, getPendingInvites, revokeInvite } from "@/lib/db/queries/invites"
import { getProjectById } from "@/lib/db/queries/projects"
import { ASSIGNABLE_ROLES } from "@/lib/permissions"
import type { InviteRole } from "@/lib/db/queries/invites"  // ← only this, drop Role
import { sendInviteEmail } from "@/lib/notify/email"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const access = await requireProjectRole(id, "owner")
    if (!access) return err("Forbidden — owner only", "FORBIDDEN", 403)

    const body = await req.json()
    const { email, role } = body as { email?: string; role?: string }

    if (!email || !role) return err("email and role are required", "BAD_REQUEST", 400)
    if (!ASSIGNABLE_ROLES.includes(role as InviteRole)) {  // ← InviteRole, not Role
      return err(`Role must be one of: ${ASSIGNABLE_ROLES.join(", ")}`, "BAD_REQUEST", 400)
    }

    const project = await getProjectById(id, access.session!.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const invite = await createInvite(id, email, role as InviteRole, access.session!.user.id)  // ← InviteRole

    // Send invite notification email with updated template
    sendInviteEmail({
      to: email,
      inviterName: access.session!.user.name,
      projectName: project.name,
      role: role as InviteRole,   // ← InviteRole everywhere, no more "editor" | "viewer" inline
      token: invite.token,
    }).catch((e) => console.error("[invite email]", e))

    return ok({ inviteId: invite.id, expiresAt: invite.expiresAt })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const access = await requireProjectRole(id, "owner")
    if (!access) return err("Forbidden — owner only", "FORBIDDEN", 403)

    const pending = await getPendingInvites(id)
    return ok({ invites: pending })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const access = await requireProjectRole(id, "owner")
    if (!access) return err("Forbidden — owner only", "FORBIDDEN", 403)

    const body = await req.json()
    const { inviteId } = body as { inviteId?: string }
    if (!inviteId) return err("inviteId is required", "BAD_REQUEST", 400)

    const revoked = await revokeInvite(inviteId)
    if (!revoked) return err("Invite not found or already accepted", "NOT_FOUND", 404)

    return ok({ revoked: true })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}