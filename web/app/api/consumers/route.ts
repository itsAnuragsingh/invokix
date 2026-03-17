// app/api/consumers/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { getProjectById } from "@/lib/db/queries/projects"
import { logConsumer, getConsumersByContractId } from "@/lib/db/queries/consumers"
import { z } from "zod"

const logSchema = z.object({
  contractId: z.string().min(1),
  version: z.string().min(1),
  source: z.enum(["web", "cli", "api", "postman"]),
  teamId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const body = await request.json()
    const parsed = logSchema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const consumer = await logConsumer(
      parsed.data.contractId,
      parsed.data.version,
      parsed.data.source,
      session.user.id,
      parsed.data.teamId
    )

    return ok(consumer)
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    if (!projectId) return err("projectId required", "INVALID_REQUEST", 400)

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const contract = await getContractByProjectId(projectId)
    if (!contract) return err("No contract found", "NO_CONTRACT", 404)

    const data = await getConsumersByContractId(contract.id)
    return ok(data)
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}