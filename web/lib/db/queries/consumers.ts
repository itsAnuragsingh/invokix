// lib/db/queries/consumers.ts
import { db } from "@/lib/db"
import { consumers } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function logConsumer(
  contractId: string,
  version: string,
  source: "web" | "cli" | "api" | "postman",
  userId?: string,
  teamId?: string
) {
  const [consumer] = await db.insert(consumers).values({
    id: nanoid(),
    contractId,
    version,
    source,
    userId,
    teamId,
    lastPulledAt: new Date(),
  }).returning()
  return consumer
}

export async function getConsumersByContractId(contractId: string) {
  return db.query.consumers.findMany({
    where: eq(consumers.contractId, contractId),
    orderBy: [desc(consumers.lastPulledAt)],
  })
}