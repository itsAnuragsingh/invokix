// app/(public)/invite/[token]/page.tsx
import { redirect } from "next/navigation"
import { getInviteByToken } from "@/lib/db/queries/team"
import { requireSession } from "@/lib/auth/session"
import { InviteAcceptView } from "@/components/dashboard/InviteAcceptView"

type Props = { params: Promise<{ token: string }> }

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const invite = await getInviteByToken(token)

  // Invalid token
  if (!invite) {
    return (
      <InviteAcceptView
        status="invalid"
        token={token}
      />
    )
  }

  // Already used
  if (invite.acceptedAt) {
    return (
      <InviteAcceptView
        status="used"
        token={token}
      />
    )
  }

  // Expired
  if (new Date() > invite.expiresAt) {
    return (
      <InviteAcceptView
        status="expired"
        token={token}
      />
    )
  }

  // Check if user is logged in
  const session = await requireSession()

  // Not logged in — redirect to login with return URL
  if (!session) {
    redirect(`/login?next=/invite/${token}`)
  }

  return (
    <InviteAcceptView
      status="valid"
      token={token}
      invite={{
        email: invite.email,
        role: invite.role,
        project: invite.project,
        inviter: invite.inviter,
      }}
      currentUserEmail={session.user.email}
    />
  )
}