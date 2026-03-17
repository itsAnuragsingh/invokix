// lib/db/queries/projects.ts
import { db } from "@/lib/db"
import { projects, teamMembers } from "@/lib/db/schema"
import { eq, or, inArray } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function getProjectsByUserId(userId: string) {
  // Get projects owned by user
  const owned = await db.query.projects.findMany({
    where: eq(projects.ownerId, userId),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  })

  // Get projects user is a member of (but not owner)
  const memberships = await db
    .select({ projectId: teamMembers.projectId, role: teamMembers.role })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))

const ownedIds = new Set(owned.map((p) => p.id))
const memberProjectIds = memberships
  .filter((m) => m.role !== "owner" && !ownedIds.has(m.projectId))
  .map((m) => m.projectId)

  if (memberProjectIds.length === 0) return owned

  const memberProjects = await db.query.projects.findMany({
    where: inArray(projects.id, memberProjectIds),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  })

  // Tag member projects so UI can show the shared badge
  const taggedMemberProjects = memberProjects.map((p) => ({
    ...p,
    memberRole: memberships.find((m) => m.projectId === p.id)?.role ?? "viewer",
  }))

  const taggedOwned = owned.map((p) => ({ ...p, memberRole: "owner" as const }))

  return [...taggedOwned, ...taggedMemberProjects]
}

export async function getProjectById(projectId: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  })
  if (!project) return null

  // Owner — full access
  if (project.ownerId === userId) return project

  // Check if user is a team member
  const membership = await db.query.teamMembers.findFirst({
    where: (tm) =>
      eq(tm.projectId, projectId) &&
      eq(tm.userId, userId),
  })

  if (!membership) return null
  return project
}

export async function createProject(
  userId: string,
  name: string,
  description?: string,
  stack: "nextjs" | "react-native" | "express" | "angular" | "other" = "nextjs"
) {
  const id = nanoid()
  const [project] = await db.insert(projects).values({
    id,
    name,
    description,
    ownerId: userId,
    stack,
  }).returning()

  await db.insert(teamMembers).values({
    id: nanoid(),
    projectId: id,
    userId,
    role: "owner",
    joinedAt: new Date(),
  })

  return project
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  })
  if (!project) return null
  if (project.ownerId !== userId) return null
  await db.delete(projects).where(eq(projects.id, projectId))
  return true
}

export async function updateProjectStack(
  projectId: string,
  userId: string,
  stack: "nextjs" | "react-native" | "express" | "angular" | "other"
) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  })
  if (!project) return null
  if (project.ownerId !== userId) return null

  const [updated] = await db
    .update(projects)
    .set({ stack, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning()
  return updated
}

export async function getProjectStackById(projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    columns: { stack: true },
  })
  return project?.stack ?? "nextjs"
}