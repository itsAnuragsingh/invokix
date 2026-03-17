// lib/db/queries/versions.ts
import { db } from "@/lib/db"
import { contractVersions } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function getVersionsByContractId(contractId: string) {
  return db.query.contractVersions.findMany({
    where: eq(contractVersions.contractId, contractId),
    orderBy: [desc(contractVersions.createdAt)],
  })
}

export async function createVersion(
  contractId: string,
  openApiSpec: object,
  version: string,
  changedBy: string,
  changeSummary: string,
  isBreaking: boolean,
  breakingFields: string[]
) {
  const [v] = await db.insert(contractVersions).values({
    id: nanoid(),
    contractId,
    openApiSpec,
    version,
    changedBy,
    changeSummary,
    isBreaking,
    breakingFields,
  }).returning()
  return v
}

export async function getVersionById(versionId: string) {
  return db.query.contractVersions.findFirst({
    where: eq(contractVersions.id, versionId),
  })
}