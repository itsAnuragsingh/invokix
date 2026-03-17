// app/api/invite/[token]/route.ts
import { type NextRequest } from "next/server"
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getInviteByToken, acceptInvite } from "@/lib/db/queries/team"

type Params = { token: string }

// ── GET — get invite details (public — no auth needed) ────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { token } = await params
    const invite = await getInviteByToken(token)

    if (!invite) return err("Invite not found", "NOT_FOUND", 404)
    if (invite.acceptedAt) return err("Invite already used", "ALREADY_USED", 400)
    if (new Date() > invite.expiresAt) return err("Invite has expired", "EXPIRED", 400)

    return ok({
      invite: {
        email: invite.email,
        role: invite.role,
        project: invite.project,
        inviter: invite.inviter,
        expiresAt: invite.expiresAt,
      },
    })
  } catch {
    return err("Failed to fetch invite", "FETCH_FAILED", 500)
  }
}

// ── POST — accept invite ──────────────────────────────────────────────────────
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await requireSession()
    if (!session) return err("Please sign in to accept this invite", "UNAUTHORIZED", 401)

    const { token } = await params
    const result = await acceptInvite(token, session.user.id)

    if (!result.success) {
      return err(result.error ?? "Failed to accept invite", "ACCEPT_FAILED", 400)
    }

    return ok({ projectId: result.projectId })
  } catch {
    return err("Failed to accept invite", "ACCEPT_FAILED", 500)
  }
}