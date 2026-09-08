// app/api/projects/[id]/members/route.ts
//
// GET    /api/projects/:id/members        — list all members (any member)
// PATCH  /api/projects/:id/members        — change a member's role (owner only)
// DELETE /api/projects/:id/members        — remove a member (owner only)

import { NextRequest } from "next/server"
import { requireProjectRole } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getProjectMembers, updateMemberRole, removeMember } from "@/lib/db/queries/members"
import type { Role } from "@/lib/permissions"
import { ASSIGNABLE_ROLES } from "@/lib/permissions"

type RouteContext = { params: Promise<{ id: string }> }

// ─── GET: list members ────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const access = await requireProjectRole(id, "viewer")
    if (!access) return err("Unauthorized", "UNAUTHORIZED", 401)

    const members = await getProjectMembers(id)
    return ok({ members })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}

// ─── PATCH: change a member's role ───────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const access = await requireProjectRole(id, "owner")
    if (!access) return err("Forbidden — owner only", "FORBIDDEN", 403)

    const body = await req.json()
    const { memberId, role } = body as { memberId?: string; role?: string }

    if (!memberId || !role) return err("memberId and role are required", "BAD_REQUEST", 400)
    if (!ASSIGNABLE_ROLES.includes(role as Role)) {
      return err(`Role must be one of: ${ASSIGNABLE_ROLES.join(", ")}`, "BAD_REQUEST", 400)
    }

    // Prevent owner from downgrading themselves.
    if (memberId === access.memberId) {
      return err("You cannot change your own role", "BAD_REQUEST", 400)
    }

    const updated = await updateMemberRole(memberId, role as Role)
    if (!updated) return err("Member not found", "NOT_FOUND", 404)

    return ok({ updated: true })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}

// ─── DELETE: remove a member ──────────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const access = await requireProjectRole(id, "owner")
    if (!access) return err("Forbidden — owner only", "FORBIDDEN", 403)

    const body = await req.json()
    const { memberId } = body as { memberId?: string }

    if (!memberId) return err("memberId is required", "BAD_REQUEST", 400)
    if (memberId === access.memberId) {
      return err("Owner cannot remove themselves from the project", "BAD_REQUEST", 400)
    }

    const removed = await removeMember(memberId)
    if (!removed) return err("Member not found", "NOT_FOUND", 404)

    return ok({ removed: true })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}