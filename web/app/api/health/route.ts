// app/api/health/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { computeHealthScore } from "@/lib/analysis/health"
import { db } from "@/lib/db"
import { contracts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({
  projectId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const project = await getProjectById(parsed.data.projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const contract = await getContractByProjectId(parsed.data.projectId)
    if (!contract) return err("No contract found", "NO_CONTRACT", 404)

    const result = computeHealthScore(contract.openApiSpec as object)

    await db.update(contracts)
      .set({ healthScore: result.score })
      .where(eq(contracts.id, contract.id))

    return ok(result)
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}