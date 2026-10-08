// lib/db/queries/team.ts
import { eq, and, isNull, gt, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { teamMembers, invites, projects, users } from "@/lib/db/schema"
import { nanoid } from "nanoid"

export type TeamMember = {
  id: string
  projectId: string
  userId: string
  role: "owner" | "editor" | "viewer"
  invitedBy: string | null
  invitedAt: Date
  joinedAt: Date | null
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

export type Invite = typeof invites.$inferSelect

// ── Verify project owner ──────────────────────────────────────────────────────
async function verifyProjectOwner(
  projectId: string,
  userId: string
): Promise<boolean> {
  const project = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)))
    .limit(1)
  return project.length > 0
}

// ── Get all team members ──────────────────────────────────────────────────────
export async function getTeamMembers(
  projectId: string,
  userId: string
): Promise<TeamMember[]> {
  const isOwner = await verifyProjectOwner(projectId, userId)
  if (!isOwner) return []

  const rows = await db
    .select({
      id: teamMembers.id,
      projectId: teamMembers.projectId,
      userId: teamMembers.userId,
      role: teamMembers.role,
      invitedBy: teamMembers.invitedBy,
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

  return rows as TeamMember[]
}

// ── Get pending invites ───────────────────────────────────────────────────────
export async function getPendingInvites(
  projectId: string,
  userId: string
): Promise<Invite[]> {
  const isOwner = await verifyProjectOwner(projectId, userId)
  if (!isOwner) return []

  return db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.projectId, projectId),
        isNull(invites.acceptedAt)
      )
    )
}

// ── Create invite ─────────────────────────────────────────────────────────────
export async function createInvite(
  projectId: string,
  invitedBy: string,
  email: string,
  role: "editor" | "viewer"
): Promise<Invite | { error: string }> {
  const isOwner = await verifyProjectOwner(projectId, invitedBy)
  if (!isOwner) return { error: "Unauthorized" }

  // Check if already invited
  const existing = await db
    .select({ id: invites.id })
    .from(invites)
    .where(
      and(
        eq(invites.projectId, projectId),
        eq(invites.email, email.toLowerCase()),
        isNull(invites.acceptedAt)
      )
    )
    .limit(1)

  if (existing.length > 0) return { error: "Invite already sent to this email" }

  // Check if already a member
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (existingUser.length > 0) {
    const existingMember = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.projectId, projectId),
          eq(teamMembers.userId, existingUser[0]!.id)
        )
      )
      .limit(1)

    if (existingMember.length > 0) return { error: "User is already a team member" }
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const [invite] = await db
    .insert(invites)
    .values({
      id: nanoid(),
      projectId,
      email: email.toLowerCase(),
      role,
      token: nanoid(32),
      invitedBy,
      expiresAt,
    })
    .returning()

  return invite!
}

// ── Get invite by token ───────────────────────────────────────────────────────
export async function getInviteByToken(token: string): Promise<
  | (Invite & {
      project: { id: string; name: string }
      inviter: { name: string; email: string }
    })
  | null
> {
  const rows = await db
    .select({
      invite: invites,
      project: { id: projects.id, name: projects.name },
      inviter: { name: users.name, email: users.email },
    })
    .from(invites)
    .innerJoin(projects, eq(invites.projectId, projects.id))
    .innerJoin(users, eq(invites.invitedBy, users.id))
    .where(eq(invites.token, token))
    .limit(1)

  if (rows.length === 0) return null

  const row = rows[0]!
  return {
    ...row.invite,
    project: row.project,
    inviter: row.inviter,
  }
}

// ── Accept invite ─────────────────────────────────────────────────────────────
export async function acceptInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; error?: string; projectId?: string }> {
  const invite = await getInviteByToken(token)

  if (!invite) return { success: false, error: "Invite not found" }
  if (invite.acceptedAt) return { success: false, error: "Invite already used" }
  if (new Date() > invite.expiresAt) return { success: false, error: "Invite has expired" }

  // Add to team
  await db.insert(teamMembers).values({
    id: nanoid(),
    projectId: invite.projectId,
    userId,
    role: invite.role,
    invitedBy: invite.invitedBy,
    invitedAt: invite.createdAt,
    joinedAt: new Date(),
  })

  // Mark invite as accepted
  await db
    .update(invites)
    .set({ acceptedAt: new Date() })
    .where(eq(invites.token, token))

  return { success: true, projectId: invite.projectId }
}

// ── Update member role ────────────────────────────────────────────────────────
export async function updateMemberRole(
  memberId: string,
  projectId: string,
  ownerId: string,
  role: "editor" | "viewer"
): Promise<boolean> {
  const isOwner = await verifyProjectOwner(projectId, ownerId)
  if (!isOwner) return false

  const result = await db
    .update(teamMembers)
    .set({ role })
    .where(
      and(
        eq(teamMembers.id, memberId),
        eq(teamMembers.projectId, projectId)
      )
    )
    .returning()

  return result.length > 0
}

// ── Remove member ─────────────────────────────────────────────────────────────
export async function removeMember(
  memberId: string,
  projectId: string,
  ownerId: string
): Promise<boolean> {
  const isOwner = await verifyProjectOwner(projectId, ownerId)
  if (!isOwner) return false

  const result = await db
    .delete(teamMembers)
    .where(
      and(
        eq(teamMembers.id, memberId),
        eq(teamMembers.projectId, projectId)
      )
    )
    .returning()

  return result.length > 0
}

// ── Revoke invite ─────────────────────────────────────────────────────────────
export async function revokeInvite(
  inviteId: string,
  projectId: string,
  ownerId: string
): Promise<boolean> {
  const isOwner = await verifyProjectOwner(projectId, ownerId)
  if (!isOwner) return false

  const result = await db
    .delete(invites)
    .where(
      and(
        eq(invites.id, inviteId),
        eq(invites.projectId, projectId)
      )
    )
    .returning()

  return result.length > 0
}

// ── Get pending invites for a logged-in user ──────────────────────────────────
export type PendingUserInvite = {
  id: string
  token: string
  role: "editor" | "viewer"
  projectId: string
  projectName: string
  inviterName: string
  inviterEmail: string
  expiresAt: Date
  createdAt: Date
}

export async function getPendingInvitesForUser(userEmail: string): Promise<PendingUserInvite[]> {
  const rows = await db
    .select({
      id: invites.id,
      token: invites.token,
      role: invites.role,
      projectId: invites.projectId,
      projectName: projects.name,
      inviterName: users.name,
      inviterEmail: users.email,
      expiresAt: invites.expiresAt,
      createdAt: invites.createdAt,
    })
    .from(invites)
    .innerJoin(projects, eq(invites.projectId, projects.id))
    .innerJoin(users, eq(invites.invitedBy, users.id))
    .where(
      and(
        eq(invites.email, userEmail.toLowerCase()),
        isNull(invites.acceptedAt),
        gt(invites.expiresAt, new Date())
      )
    )
    .orderBy(desc(invites.createdAt))

  return rows
}

// ── Decline invite by invitee ────────────────────────────────────────────────
export async function declineInvite(
  inviteId: string,
  userEmail: string
): Promise<boolean> {
  const result = await db
    .delete(invites)
    .where(
      and(
        eq(invites.id, inviteId),
        eq(invites.email, userEmail.toLowerCase())
      )
    )
    .returning()

  return result.length > 0
}