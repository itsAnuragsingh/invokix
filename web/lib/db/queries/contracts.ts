// lib/db/queries/contracts.ts
import { db } from "@/lib/db"
import { contracts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { computeHealthScore } from "@/lib/analysis/health"

export async function getContractByProjectId(projectId: string) {
  return db.query.contracts.findFirst({
    where: eq(contracts.projectId, projectId),
  })
}

export async function getContractById(contractId: string) {
  return db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
  })
}

import { createVersion } from "@/lib/db/queries/versions"
import { diffSpecs } from "@/lib/analysis/diff"

export function bumpVersion(currentVersion: string = "1.0"): string {
  const parts = currentVersion.split(".")
  if (parts.length >= 2) {
    const major = parseInt(parts[0], 10) || 1
    const minor = parseInt(parts[1], 10) || 0
    return `${major}.${minor + 1}`
  }
  return "1.1"
}

export async function createContract(
  projectId: string,
  openApiSpec: object,
  plainEnglish?: string,
  userId?: string
) {
  const { score } = computeHealthScore(openApiSpec)

  const [contract] = await db.insert(contracts).values({
    id: nanoid(),
    projectId,
    openApiSpec,
    plainEnglish,
    version: "1.0",
    healthScore: score,
  }).returning()

  if (userId) {
    await createVersion(
      contract.id,
      openApiSpec,
      "1.0",
      userId,
      "Initial contract created",
      false,
      []
    )
  }

  return contract
}

export async function updateContract(
  contractId: string,
  openApiSpec: object,
  userId?: string,
  summary?: string,
  explicitVersion?: string
) {
  const current = await getContractById(contractId)
  const { score } = computeHealthScore(openApiSpec)

  const isPublishing = Boolean(explicitVersion)
  const nextVersion = explicitVersion ?? (current?.version ?? "1.0")

  const diff = current?.openApiSpec
    ? diffSpecs(current.openApiSpec as object, openApiSpec)
    : { items: [], hasBreaking: false }

  const breakingFields = diff.items.filter((i) => i.breaking).map((i) => i.message)
  const changeSummary = summary ?? (diff.items.map((i) => i.message).join("; ") || "Updated API contract")

  const [updated] = await db.update(contracts)
    .set({
      openApiSpec,
      healthScore: score,
      version: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(contracts.id, contractId))
    .returning()

  if (userId && isPublishing) {
    await createVersion(
      contractId,
      openApiSpec,
      nextVersion,
      userId,
      changeSummary,
      diff.hasBreaking,
      breakingFields
    )
  }

  return updated
}

export function getMockUrl(contractId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return `${base}/api/mock-proxy/${contractId}`
}

export async function getContractWithMockUrl(contractId: string) {
  const contract = await getContractById(contractId)
  if (!contract) return null
  return {
    ...contract,
    mockUrl: getMockUrl(contract.id),
  }
}