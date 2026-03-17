// app/api/import/openapi/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { parseOpenApiSpec } from "@/lib/import/openapi"
import { getProjectById } from "@/lib/db/queries/projects"
import { createContract, getContractByProjectId, updateContract } from "@/lib/db/queries/contracts"
import { z } from "zod"

const schema = z.object({
  projectId: z.string().min(1),
  spec: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const { projectId, spec } = parsed.data

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const openApiSpec = await parseOpenApiSpec(spec)

    const existing = await getContractByProjectId(projectId)
    const contract = existing
      ? await updateContract(existing.id, openApiSpec)
      : await createContract(projectId, openApiSpec)

    return ok(contract)
  } catch (e) {
    return err(
      e instanceof Error ? e.message : "Import failed",
      "IMPORT_FAILED",
      400
    )
  }
}