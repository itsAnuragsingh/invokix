// app/api/versions/rollback/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getVersionById } from "@/lib/db/queries/versions"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId, updateContract } from "@/lib/db/queries/contracts"
import { checkFeatureAccess } from "@/lib/plans/usage"
import { PLAN_DISPLAY } from "@/lib/plans/limits"
import { z } from "zod"

const schema = z.object({
  versionId: z.string().min(1),
  projectId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    // ── Plan gate: rollback ───────────────────────────────────────────
    const access = await checkFeatureAccess(session.user.id, "canRollback")
    if (!access.allowed) {
      return err(
        `Version rollback is available on the Pro plan and above. You're on the ${PLAN_DISPLAY[access.plan].label} plan.`,
        "PLAN_FEATURE_LOCKED",
        403
      )
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const { versionId, projectId } = parsed.data

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const version = await getVersionById(versionId)
    if (!version) return err("Version not found", "NOT_FOUND", 404)

    const contract = await getContractByProjectId(projectId)
    if (!contract) return err("No contract found", "NO_CONTRACT", 404)

    await updateContract(contract.id, version.openApiSpec as object, version.version)

    return ok({ version: version.version })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}