// app/api/team/[projectId]/route.ts
import { type NextRequest } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import {
  getTeamMembers,
  getPendingInvites,
  updateMemberRole,
  removeMember,
  revokeInvite,
} from "@/lib/db/queries/team"

type Params = { projectId: string }

const updateRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["editor", "viewer"]),
})

const removeMemberSchema = z.object({
  memberId: z.string().min(1),
})

const revokeInviteSchema = z.object({
  inviteId: z.string().min(1),
})

// ── GET — list members + pending invites ──────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { projectId } = await params
    const [members, pending] = await Promise.all([
      getTeamMembers(projectId, session.user.id),
      getPendingInvites(projectId, session.user.id),
    ])

    return ok({ members, pending })
  } catch {
    return err("Failed to fetch team", "FETCH_FAILED", 500)
  }
}

// ── PUT — update member role ──────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { projectId } = await params
    const body = await req.json()
    const parsed = updateRoleSchema.safeParse(body)
    if (!parsed.success) {
      return err(
        parsed.error.issues[0]?.message ?? "Invalid request",
        "INVALID_REQUEST",
        400
      )
    }

    const updated = await updateMemberRole(
      parsed.data.memberId,
      projectId,
      session.user.id,
      parsed.data.role
    )
    if (!updated) return err("Member not found or unauthorized", "NOT_FOUND", 404)

    return ok({ updated: true })
  } catch {
    return err("Failed to update role", "UPDATE_FAILED", 500)
  }
}

// ── DELETE — remove member or revoke invite ───────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { projectId } = await params
    const body = await req.json()
    console.log("[team DELETE]", { projectId, body, userId: session.user.id }) 

    // Check if revoking an invite or removing a member
    const revokeparsed = revokeInviteSchema.safeParse(body)
    if ("inviteId" in body && revokeparsed.success) {
      const revoked = await revokeInvite(
        revokeparsed.data.inviteId,
        projectId,
        session.user.id
      )
      if (!revoked) return err("Invite not found or unauthorized", "NOT_FOUND", 404)
      return ok({ revoked: true })
    }

    const removeparsed = removeMemberSchema.safeParse(body)
    if (!removeparsed.success) {
      return err("Invalid request", "INVALID_REQUEST", 400)
    }

    const removed = await removeMember(
      removeparsed.data.memberId,
      projectId,
      session.user.id
    )
    if (!removed) return err("Member not found or unauthorized", "NOT_FOUND", 404)

    return ok({ removed: true })
  } catch {
    return err("Failed to remove member", "REMOVE_FAILED", 500)
  }
}