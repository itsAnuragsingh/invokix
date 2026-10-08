// app/api/user/invites/[id]/decline/route.ts
import { type NextRequest } from "next/server"
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { declineInvite } from "@/lib/db/queries/team"

type Params = { id: string }

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const { id } = await params
    const success = await declineInvite(id, session.user.email)
    if (!success) {
      return err("Failed to decline invite or invite not found", "NOT_FOUND", 404)
    }

    return ok({ success: true })
  } catch (error) {
    console.error("Failed to decline invite:", error)
    return err("Failed to decline invite", "DECLINE_FAILED", 500)
  }
}
