// app/api/projects/[id]/stack/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { updateProjectStack } from "@/lib/db/queries/projects"
import { z } from "zod"

const schema = z.object({
  stack: z.enum(["nextjs", "react-native", "express", "angular", "other"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { id } = await params
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const updated = await updateProjectStack(id, session.user.id, parsed.data.stack)
    if (!updated) return err("Project not found", "NOT_FOUND", 404)

    return ok(updated)
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}