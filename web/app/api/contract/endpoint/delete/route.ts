// app/api/contract/endpoint/delete/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId, updateContract } from "@/lib/db/queries/contracts"
import { z } from "zod"

const schema = z.object({
  projectId: z.string().min(1),
  method: z.string().min(1),
  path: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const { projectId, method, path } = parsed.data

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const contract = await getContractByProjectId(projectId)
    if (!contract || !contract.openApiSpec) return err("Contract not found", "NOT_FOUND", 404)

    // Deep clone the active spec
    const spec = JSON.parse(JSON.stringify(contract.openApiSpec))
    const normMethod = method.toLowerCase()

    if (spec.paths && spec.paths[path]) {
      // Remove specific HTTP method
      delete spec.paths[path][normMethod]

      // If no other methods exist on this path, delete the path entirely
      const remainingMethods = Object.keys(spec.paths[path]).filter((m) =>
        ["get", "post", "put", "patch", "delete", "options", "head"].includes(m.toLowerCase())
      )
      if (remainingMethods.length === 0) {
        delete spec.paths[path]
      }
    }

    // Direct update with exact modified spec
    const updated = await updateContract(
      contract.id,
      spec,
      session.user.id,
      `Deleted ${method.toUpperCase()} ${path}`
    )

    return ok(updated)
  } catch (e) {
    console.error("[delete-endpoint-error]", e)
    return err(e instanceof Error ? e.message : "Failed to delete endpoint", "DELETE_FAILED", 500)
  }
}
