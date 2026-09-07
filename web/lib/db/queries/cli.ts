// lib/db/queries/cli.ts
import { db } from "@/lib/db"
import { cliTokens, cliSessions } from "@/lib/db/schema"
import { eq, and, gt, lt } from "drizzle-orm"
import { nanoid } from "nanoid"

// ── Token format ──────────────────────────────────────────────────────────────
// ik_live_ prefix + 32 random chars
// Example: ik_live_a8f3k2m9x1p7q4n6r5t0w8y2j6c3v9d1

function generateToken(): string {
  return `ik_live_${nanoid(32)}`
}

// ── CLI Token queries ─────────────────────────────────────────────────────────

export async function createCliToken(userId: string, name: string) {
  const token = generateToken()
  const id = nanoid()

  await db.insert(cliTokens).values({
    id,
    userId,
    name,
    token,
    createdAt: new Date(),
  })

  // Return token only once — never returned again after this
  return { id, name, token }
}

export async function getCliTokensByUserId(userId: string) {
  return db
    .select({
      id: cliTokens.id,
      name: cliTokens.name,
      lastUsedAt: cliTokens.lastUsedAt,
      createdAt: cliTokens.createdAt,
      // Never return the actual token value in list views
    })
    .from(cliTokens)
    .where(eq(cliTokens.userId, userId))
    .orderBy(cliTokens.createdAt)
}

export async function verifyCliToken(token: string) {
  const result = await db
    .select()
    .from(cliTokens)
    .where(eq(cliTokens.token, token))
    .limit(1)

  const row = result[0]
  if (!row) return null

  // Update lastUsedAt
  await db
    .update(cliTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(cliTokens.id, row.id))

  return row
}

export async function deleteCliToken(id: string, userId: string) {
  await db
    .delete(cliTokens)
    .where(and(eq(cliTokens.id, id), eq(cliTokens.userId, userId)))
}

// ── CLI Session queries (browser auth flow) ───────────────────────────────────

export async function createCliSession() {
  const id = nanoid(24)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await db.insert(cliSessions).values({
    id,
    expiresAt,
    createdAt: new Date(),
  })

  return { id, expiresAt }
}

export async function getCliSession(id: string) {
  const result = await db
    .select()
    .from(cliSessions)
    .where(
      and(
        eq(cliSessions.id, id),
        gt(cliSessions.expiresAt, new Date())
      )
    )
    .limit(1)

  return result[0] ?? null
}

export async function confirmCliSession(sessionId: string, userId: string) {
  // Create a new CLI token for this user
  const token = generateToken()
  const tokenId = nanoid()

  await db.insert(cliTokens).values({
    id: tokenId,
    userId,
    name: "Browser login",
    token,
    createdAt: new Date(),
  })

  // Mark session as confirmed with the token
  await db
    .update(cliSessions)
    .set({
      userId,
      token,
      confirmedAt: new Date(),
    })
    .where(eq(cliSessions.id, sessionId))

  return { token }
}

export async function deleteCliSession(id: string) {
  await db.delete(cliSessions).where(eq(cliSessions.id, id))
}

export async function cleanExpiredCliSessions() {
  await db
    .delete(cliSessions)
    .where(lt(cliSessions.expiresAt, new Date()))
}