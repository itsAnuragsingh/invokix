// lib/auth/session.ts
import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { getCallerMembership } from "@/lib/db/queries/members"
import { hasMinRole, type Role } from "@/lib/permissions"

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return null

  return session
}

export async function requireProjectRole(
  projectId: string,
  minRole: Role = "viewer"
) {
  const session = await requireSession()
  if (!session?.user?.id) return null

  const membership = await getCallerMembership(projectId, session.user.id)
  if (!membership) return null

  if (!hasMinRole(membership.role, minRole)) return null

  return {
    session,
    memberId: membership.id,
    role: membership.role,
  }
}