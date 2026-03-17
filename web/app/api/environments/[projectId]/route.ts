// app/api/environments/[projectId]/route.ts
import { type NextRequest } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import {
  getEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from "@/lib/db/queries/environments"

type Params = { projectId: string }

// ── Validation schemas ────────────────────────────────────────────────────────
const createSchema = z.object({
  name: z.string().min(1).max(50),
  baseUrl: z.string().url("Must be a valid URL"),
  isDefault: z.boolean().optional(),
})

const updateSchema = z.object({
  envId: z.string().min(1),
  name: z.string().min(1).max(50).optional(),
  baseUrl: z.string().url("Must be a valid URL").optional(),
  isDefault: z.boolean().optional(),
})

const deleteSchema = z.object({
  envId: z.string().min(1),
})

// ── GET — list all environments ───────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { projectId } = await params
    const envs = await getEnvironments(projectId, session.user.id)
    return ok({ environments: envs })
  } catch {
    return err("Failed to fetch environments", "FETCH_FAILED", 500)
  }
}

// ── POST — create environment ─────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { projectId } = await params
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return err(
        parsed.error.issues[0]?.message ?? "Invalid request",
        "INVALID_REQUEST",
        400
      )
    }

    const env = await createEnvironment(projectId, session.user.id, parsed.data)
    if (!env) return err("Project not found or unauthorized", "NOT_FOUND", 404)

    return ok({ environment: env })
  } catch {
    return err("Failed to create environment", "CREATE_FAILED", 500)
  }
}

// ── PUT — update environment ──────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { projectId } = await params
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return err(
        parsed.error.issues[0]?.message ?? "Invalid request",
        "INVALID_REQUEST",
        400
      )
    }

    const { envId, ...data } = parsed.data
    const env = await updateEnvironment(envId, projectId, session.user.id, data)
    if (!env) return err("Environment not found or unauthorized", "NOT_FOUND", 404)

    return ok({ environment: env })
  } catch {
    return err("Failed to update environment", "UPDATE_FAILED", 500)
  }
}

// ── DELETE — delete environment ───────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { projectId } = await params
    const body = await req.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return err("Invalid request", "INVALID_REQUEST", 400)
    }

    const deleted = await deleteEnvironment(parsed.data.envId, projectId, session.user.id)
    if (!deleted) return err("Environment not found or unauthorized", "NOT_FOUND", 404)

    return ok({ deleted: true })
  } catch {
    return err("Failed to delete environment", "DELETE_FAILED", 500)
  }
}