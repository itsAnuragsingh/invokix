// lib/db/queries/members.ts
import { db } from "@/lib/db"
import { teamMembers, users } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import type { Role } from "@/lib/permissions"
import { nanoid } from "nanoid"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MemberWithUser = {
  id: string
  projectId: string
  userId: string
  role: Role
  invitedAt: Date
  joinedAt: Date | null
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Returns the caller's membership row for a project.
 * Use this to check "is this user even in this project, and what is their role?"
 */
export async function getCallerMembership(
  projectId: string,
  userId: string
): Promise<{ id: string; role: Role } | null> {
  const rows = await db
    .select({ id: teamMembers.id, role: teamMembers.role })
    .from(teamMembers)
    .where(and(eq(teamMembers.projectId, projectId), eq(teamMembers.userId, userId)))
    .limit(1)

  if (!rows.length) return null
  return { id: rows[0].id, role: rows[0].role as Role }
}

/**
 * Returns all members of a project, joined with user info.
 */
export async function getProjectMembers(projectId: string): Promise<MemberWithUser[]> {
  const rows = await db
    .select({
      id: teamMembers.id,
      projectId: teamMembers.projectId,
      userId: teamMembers.userId,
      role: teamMembers.role,
      invitedAt: teamMembers.invitedAt,
      joinedAt: teamMembers.joinedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      },
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.projectId, projectId))

  return rows as MemberWithUser[]
}

/**
 * Adds the project creator as owner in teamMembers.
 * Call this immediately after INSERT into projects.
 */
export async function addProjectOwner(projectId: string, userId: string): Promise<void> {
  await db.insert(teamMembers).values({
    id: nanoid(),
    projectId,
    userId,
    role: "owner",
    invitedBy: null,
    invitedAt: new Date(),
    joinedAt: new Date(),
  })
}

/**
 * Adds a user to a project with the given role.
 * Used when accepting an invite.
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  role: Role,
  invitedBy: string
): Promise<void> {
  // Upsert: if they're somehow already in the table, update their role.
  const existing = await getCallerMembership(projectId, userId)
  if (existing) {
    await db
      .update(teamMembers)
      .set({ role, joinedAt: new Date() })
      .where(eq(teamMembers.id, existing.id))
    return
  }

  await db.insert(teamMembers).values({
    id: nanoid(),
    projectId,
    userId,
    role,
    invitedBy,
    invitedAt: new Date(),
    joinedAt: new Date(),
  })
}

/**
 * Changes an existing member's role.
 * Caller must be owner — enforce this at the route level.
 */
export async function updateMemberRole(memberId: string, newRole: Role): Promise<boolean> {
  const result = await db
    .update(teamMembers)
    .set({ role: newRole })
    .where(eq(teamMembers.id, memberId))
  return (result.rowCount ?? 0) > 0
}

/**
 * Removes a member from a project.
 * Cannot remove the owner — enforce this at the route level.
 */
export async function removeMember(memberId: string): Promise<boolean> {
  const result = await db.delete(teamMembers).where(eq(teamMembers.id, memberId))
  return (result.rowCount ?? 0) > 0
}