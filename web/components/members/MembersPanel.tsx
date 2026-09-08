// components/members/MembersPanel.tsx
// Client wrapper used by the server page.
// Receives initial data as props (already fetched server-side),
// then handles client-side refreshes after invite/remove actions.
"use client"
import { useState } from "react"
import { MembersList } from "./MembersList"
import { InviteModal } from "./InviteModal"
import { RoleBadge } from "./RoleBadge"
import { canManageMembers } from "@/lib/permissions"
import type { Role } from "@/lib/permissions"

type Member = {
  id: string
  userId: string
  role: Role
  joinedAt: Date | null
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

type PendingInvite = {
  id: string
  email: string
  role: Role
  expiresAt: Date
  inviter: { name: string; email: string }
}

type Props = {
  projectId: string
  currentUserId: string
  currentUserRole: Role
  initialMembers: Member[]
  initialPending: PendingInvite[]
}

export function MembersPanel({
  projectId,
  currentUserId,
  currentUserRole,
  initialMembers,
  initialPending,
}: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [inviteOpen, setInviteOpen] = useState(false)
  const isOwner = canManageMembers(currentUserRole)

  async function refresh() {
    const res = await fetch(`/api/projects/${projectId}/members`)
    if (res.ok) {
      const data = await res.json()
      setMembers(data.data?.members ?? [])
    }
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Your role:</span>
          <RoleBadge role={currentUserRole} size="sm" />
        </div>

        {isOwner && (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5
              bg-primary hover:bg-primary/90 text-primary-foreground
              text-xs font-semibold rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v16m8-8H4" />
            </svg>
            Invite
          </button>
        )}
      </div>

      {/* Members list */}
      <MembersList
        members={members}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        projectId={projectId}
        onMembersChange={refresh}
      />

      {/* Viewer/editor notice */}
      {!isOwner && (
        <p className="mt-4 text-xs text-muted-foreground">
          Only the project owner can invite or remove members.
        </p>
      )}

      {/* Invite modal — owner only */}
      {isOwner && (
        <InviteModal
          projectId={projectId}
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onInviteSent={refresh}
        />
      )}
    </div>
  )
}