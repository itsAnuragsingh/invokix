// app/api/projects/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getProjectsByUserId, createProject } from "@/lib/db/queries/projects"
import { checkContractLimit } from "@/lib/plans/usage"
import { PLAN_DISPLAY } from "@/lib/plans/limits"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  stack: z.enum(["nextjs", "react-native", "express","angular", "other"]).default("nextjs"),
})

export async function GET() {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const data = await getProjectsByUserId(session.user.id)
    return ok(data)
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    // ── Plan limit: contracts ────────────────────────────────────────
    const limit = await checkContractLimit(session.user.id)
    if (!limit.allowed) {
      return err(
        `You've reached the ${PLAN_DISPLAY[limit.plan].label} plan limit of ${limit.limit} project${limit.limit !== 1 ? "s" : ""}. Upgrade to create more.`,
        "PLAN_LIMIT_EXCEEDED",
        403
      )
    }

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const project = await createProject(session.user.id, parsed.data.name, parsed.data.description, parsed.data.stack)
    return ok(project, 201)
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}