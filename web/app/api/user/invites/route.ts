// app/api/user/invites/route.ts
import { type NextRequest } from "next/server"
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getPendingInvitesForUser } from "@/lib/db/queries/team"

export async function GET(_req: NextRequest) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const invites = await getPendingInvitesForUser(session.user.email)
    return ok({ invites })
  } catch (error) {
    console.error("Failed to fetch user invites:", error)
    return err("Failed to fetch invitations", "FETCH_FAILED", 500)
  }
}
