// lib/db/queries/contracts.ts
import { db } from "@/lib/db"
import { contracts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

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

export async function createContract(projectId: string, openApiSpec: object, plainEnglish?: string) {
  const [contract] = await db.insert(contracts).values({
    id: nanoid(),
    projectId,
    openApiSpec,
    plainEnglish,
    version: "1.0",
    healthScore: 0,
  }).returning()
  return contract
}

export async function updateContract(contractId: string, openApiSpec: object, version?: string) {
  const [updated] = await db.update(contracts)
    .set({ openApiSpec, updatedAt: new Date(), ...(version ? { version } : {}) })
    .where(eq(contracts.id, contractId))
    .returning()
  return updated
}


// Get the mock URL for a contract
export function getMockUrl(contractId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return `${base}/api/mock-proxy/${contractId}`
}

// Get contract with its mock URL derived
export async function getContractWithMockUrl(contractId: string) {
  const contract = await getContractById(contractId)
  if (!contract) return null
  return {
    ...contract,
    mockUrl: getMockUrl(contract.id),
  }
}