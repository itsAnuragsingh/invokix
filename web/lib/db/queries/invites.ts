// lib/db/queries/invites.ts
import { db } from "@/lib/db"
import { invites, users } from "@/lib/db/schema"
import { eq, and, gt } from "drizzle-orm"
import { nanoid } from "nanoid"

export type InviteRole = "editor" | "viewer"
// ─── Types ────────────────────────────────────────────────────────────────────


export type InviteWithInviter = {
  id: string
  projectId: string
  email: string
  role: InviteRole        
  token: string
  invitedBy: string
  expiresAt: Date
  acceptedAt: Date | null
  createdAt: Date
  inviter: {
    name: string
    email: string
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** 
 * Creates a new invite token. 
 * Returns the full invite row so the caller can send the email.
 */

export async function createInvite(
  projectId: string,
  email: string,
  role: InviteRole,
  invitedBy: string,
  expiresInHours = 48
): Promise<{ id: string; token: string; expiresAt: Date }> {
  // Revoke any existing unaccepted invite for the same email + project.
  await db
    .delete(invites)
    .where(and(eq(invites.projectId, projectId), eq(invites.email, email)))

  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
  const id = nanoid()

  await db.insert(invites).values({
    id,
    projectId,
    email,
    role,
    token,
    invitedBy,
    expiresAt,
    acceptedAt: null,
    createdAt: new Date(),
  })

  return { id, token, expiresAt }
}

/**
 * Returns all pending (unaccepted, unexpired) invites for a project,
 * joined with the inviter's user info.
 */
export async function getPendingInvites(projectId: string): Promise<InviteWithInviter[]> {
  const now = new Date()
  const rows = await db
    .select({
      id: invites.id,
      projectId: invites.projectId,
      email: invites.email,
      role: invites.role,
      token: invites.token,
      invitedBy: invites.invitedBy,
      expiresAt: invites.expiresAt,
      acceptedAt: invites.acceptedAt,
      createdAt: invites.createdAt,
      inviter: {
        name: users.name,
        email: users.email,
      },
    })
    .from(invites)
    .innerJoin(users, eq(invites.invitedBy, users.id))
    .where(and(eq(invites.projectId, projectId), gt(invites.expiresAt, now)))

  return rows.filter((r) => !r.acceptedAt) as InviteWithInviter[]
}

/**
 * Looks up an invite by token.
 * Returns null if not found, expired, or already accepted.
 */
export async function getValidInviteByToken(token: string): Promise<{
  id: string
  projectId: string
  email: string
  role: InviteRole        
  invitedBy: string
} | null> {
  const now = new Date()
  const rows = await db
    .select({
      id: invites.id,
      projectId: invites.projectId,
      email: invites.email,
      role: invites.role,
      invitedBy: invites.invitedBy,
      expiresAt: invites.expiresAt,
      acceptedAt: invites.acceptedAt,
    })
    .from(invites)
    .where(eq(invites.token, token))
    .limit(1)

  if (!rows.length) return null
  const invite = rows[0]
  if (invite.acceptedAt) return null
  if (invite.expiresAt < now) return null

  return {
    id: invite.id,
    projectId: invite.projectId,
    email: invite.email,
    role: invite.role as InviteRole,
    invitedBy: invite.invitedBy,
  }
}

/**
 * Marks an invite as accepted.
 */
export async function acceptInvite(inviteId: string): Promise<void> {
  await db
    .update(invites)
    .set({ acceptedAt: new Date() })
    .where(eq(invites.id, inviteId))
}

/**
 * Revokes (deletes) a pending invite.
 */
export async function revokeInvite(inviteId: string): Promise<boolean> {
  const result = await db.delete(invites).where(eq(invites.id, inviteId))
  return (result.rowCount ?? 0) > 0
}