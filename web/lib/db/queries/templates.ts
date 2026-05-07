// lib/db/queries/templates.ts
import { db } from "@/lib/db"
import { templates, contracts, projects } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function getPublicTemplates() {
  return db
    .select()
    .from(templates)
    .where(eq(templates.isPublic, true))
    .orderBy(desc(templates.forkCount))
}

export async function getTemplateById(id: string) {
  const result = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1)
  return result[0] ?? null
}

export async function incrementForkCount(id: string) {
  const template = await getTemplateById(id)
  if (!template) return
  await db
    .update(templates)
    .set({ forkCount: template.forkCount + 1 })
    .where(eq(templates.id, id))
}

export async function forkTemplateIntoProject(
  templateId: string,
  projectId: string
) {
  const template = await getTemplateById(templateId)
  if (!template) throw new Error("Template not found")

  // Check if contract already exists for this project
  const existing = await db
    .select()
    .from(contracts)
    .where(eq(contracts.projectId, projectId))
    .limit(1)
    .then((r) => r[0])

  const id = nanoid()

  if (existing) {
    // Update existing contract
    await db
      .update(contracts)
      .set({
        openApiSpec: template.openApiSpec,
        healthScore: template.healthScore,
        updatedAt: new Date(),
      })
      .where(eq(contracts.projectId, projectId))
    await incrementForkCount(templateId)
    return existing.id
  }

  // Create new contract
  await db.insert(contracts).values({
    id,
    projectId,
    openApiSpec: template.openApiSpec,
    version: "1.0",
    healthScore: template.healthScore,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  await incrementForkCount(templateId)
  return id
}