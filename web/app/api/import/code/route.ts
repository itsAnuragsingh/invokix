// app/api/import/code/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { extractSpecFromCode } from "@/lib/ai/groq"
import { getProjectById } from "@/lib/db/queries/projects"
import { createContract, getContractByProjectId, updateContract } from "@/lib/db/queries/contracts"
import { mergeSpecs, isEmptySpec } from "@/lib/ai/merge"
import { z } from "zod"

const schema = z.object({
  projectId: z.string().min(1),
  code: z.string().min(10).max(10000),
})

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const { projectId, code } = parsed.data

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const specJson = await extractSpecFromCode(code)

    let specObject: object
    try {
      specObject = JSON.parse(specJson)
    } catch {
      return err("AI returned invalid JSON — try again", "INVALID_AI_RESPONSE", 500)
    }

    const existing = await getContractByProjectId(projectId)
    let contract
    if (!existing) {
      contract = await createContract(projectId, specObject, undefined, session.user.id)
    } else if (isEmptySpec(existing.openApiSpec)) {
      contract = await updateContract(existing.id, specObject, session.user.id, "Imported endpoints from route code")
    } else {
      const merged = mergeSpecs(existing.openApiSpec as object, specObject)
      contract = await updateContract(existing.id, merged, session.user.id, "Added new endpoints from route code")
    }

    return ok(contract)
  } catch (e) {
    return err(
      e instanceof Error ? e.message : "Extraction failed",
      "EXTRACTION_FAILED",
      500
    )
  }
}