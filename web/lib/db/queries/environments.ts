// lib/db/queries/environments.ts
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { environments, projects } from "@/lib/db/schema"
import { nanoid } from "nanoid"

export type Environment = typeof environments.$inferSelect
export type NewEnvironment = {
  name: string
  baseUrl: string
  isDefault?: boolean
}

// ── Verify project ownership ──────────────────────────────────────────────────
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

// ── Get all environments for a project ───────────────────────────────────────
export async function getEnvironments(
  projectId: string,
  userId: string
): Promise<Environment[]> {
  const isOwner = await verifyProjectOwner(projectId, userId)
  if (!isOwner) return []

  return db
    .select()
    .from(environments)
    .where(eq(environments.projectId, projectId))
    .orderBy(environments.createdAt)
}

// ── Create environment ────────────────────────────────────────────────────────
export async function createEnvironment(
  projectId: string,
  userId: string,
  data: NewEnvironment
): Promise<Environment | null> {
  const isOwner = await verifyProjectOwner(projectId, userId)
  if (!isOwner) return null

  // If this is marked default — unset all others first
  if (data.isDefault) {
    await db
      .update(environments)
      .set({ isDefault: false })
      .where(eq(environments.projectId, projectId))
  }

  const [env] = await db
    .insert(environments)
    .values({
      id: nanoid(),
      projectId,
      name: data.name.trim(),
      baseUrl: data.baseUrl.trim(),
      isDefault: data.isDefault ?? false,
    })
    .returning()

  return env ?? null
}

// ── Update environment ────────────────────────────────────────────────────────
export async function updateEnvironment(
  envId: string,
  projectId: string,
  userId: string,
  data: Partial<NewEnvironment>
): Promise<Environment | null> {
  const isOwner = await verifyProjectOwner(projectId, userId)
  if (!isOwner) return null

  // If setting as default — unset all others first
  if (data.isDefault) {
    await db
      .update(environments)
      .set({ isDefault: false })
      .where(eq(environments.projectId, projectId))
  }

  const [updated] = await db
    .update(environments)
    .set({
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.baseUrl !== undefined && { baseUrl: data.baseUrl.trim() }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    })
    .where(and(eq(environments.id, envId), eq(environments.projectId, projectId)))
    .returning()

  return updated ?? null
}

// ── Delete environment ────────────────────────────────────────────────────────
export async function deleteEnvironment(
  envId: string,
  projectId: string,
  userId: string
): Promise<boolean> {
  const isOwner = await verifyProjectOwner(projectId, userId)
  if (!isOwner) return false

  const result = await db
    .delete(environments)
    .where(and(eq(environments.id, envId), eq(environments.projectId, projectId)))
    .returning()

  return result.length > 0
}