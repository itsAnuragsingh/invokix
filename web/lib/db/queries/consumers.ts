// lib/db/queries/consumers.ts
import { db } from "@/lib/db"
import { consumers } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function logConsumer(
  contractId: string,
  version: string,
  source: "web" | "cli" | "api" | "postman",
  userId?: string,
  teamId?: string
) {
  if (userId) {
    const existing = await db.query.consumers.findFirst({
      where: and(
        eq(consumers.contractId, contractId),
        eq(consumers.userId, userId)
      ),
    })

    if (existing) {
      const [updated] = await db
        .update(consumers)
        .set({
          version,
          source,
          teamId: teamId ?? existing.teamId,
          lastPulledAt: new Date(),
        })
        .where(eq(consumers.id, existing.id))
        .returning()
      return updated
    }
  }

  const [consumer] = await db
    .insert(consumers)
    .values({
      id: nanoid(),
      contractId,
      version,
      source,
      userId,
      teamId,
      lastPulledAt: new Date(),
    })
    .returning()
  return consumer
}

export async function getConsumersByContractId(contractId: string) {
  const allConsumers = await db.query.consumers.findMany({
    where: eq(consumers.contractId, contractId),
    orderBy: [desc(consumers.lastPulledAt)],
  })

  // Deduplicate by consumer identity (userId if present, otherwise row id)
  const uniqueMap = new Map<string, typeof allConsumers[0]>()
  for (const item of allConsumers) {
    const key = item.userId ? item.userId : item.id
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item)
    }
  }

  return Array.from(uniqueMap.values())
}