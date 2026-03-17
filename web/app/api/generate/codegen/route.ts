// app/api/generate/codegen/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { getProjectById } from "@/lib/db/queries/projects"
import { generateTypes } from "@/lib/codegen/types"
import { generateHooks, generateNativeHooks } from "@/lib/codegen/hooks"
import { generateZodSchemas } from "@/lib/codegen/zod"
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

    const spec = contract.openApiSpec as object

    const [types, hooks, nativeHooks, zod] = await Promise.all([
      generateTypes(spec),
      Promise.resolve(generateHooks(spec)),
      Promise.resolve(generateNativeHooks(spec)),
      Promise.resolve(generateZodSchemas(spec)),
    ])

    return ok({ types, hooks, nativeHooks, zod, contractId: contract.id, version: contract.version, stack:project.stack })
  } catch (e) {
    return err(
      e instanceof Error ? e.message : "Generation failed",
      "GENERATION_FAILED",
      500
    )
  }
}