// app/api/projects/[id]/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getProjectById, deleteProject } from "@/lib/db/queries/projects"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { id } = await params
    const project = await getProjectById(id, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    await deleteProject(id, session.user.id)
    return ok({ deleted: true })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}