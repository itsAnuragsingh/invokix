// components/members/MembersList.tsx
"use client"
import { useState } from "react"
import { RoleBadge } from "./RoleBadge"
import type { Role } from "@/lib/permissions"
import { ASSIGNABLE_ROLES, canManageMembers } from "@/lib/permissions"

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

type Props = {
  members: Member[]
  currentUserId: string
  currentUserRole: Role
  projectId: string
  onMembersChange: () => void
}

export function MembersList({
  members,
  currentUserId,
  currentUserRole,
  projectId,
  onMembersChange,
}: Props) {
  const isOwner = canManageMembers(currentUserRole)
  const [loading, setLoading] = useState<string | null>(null) // memberId being acted on

  async function handleRoleChange(memberId: string, newRole: Role) {
    setLoading(memberId)
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      })
      if (res.ok) onMembersChange()
    } finally {
      setLoading(null)
    }
  }

  async function handleRemove(memberId: string, memberName: string) {
    if (!confirm(`Remove ${memberName} from this project?`)) return
    setLoading(memberId)
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      })
      if (res.ok) onMembersChange()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="divide-y divide-zinc-800/60">
      {members.map((m) => {
        const isSelf = m.userId === currentUserId
        const isLoading = loading === m.id

        return (
          <div
            key={m.id}
            className="flex items-center justify-between py-3.5 px-1 group"
          >
            {/* Avatar + info */}
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={m.user.name} image={m.user.image} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100 leading-none truncate">
                  {m.user.name}
                  {isSelf && (
                    <span className="ml-2 text-[10px] text-zinc-500 font-mono">(you)</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{m.user.email}</p>
              </div>
            </div>

            {/* Role + actions */}
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {/* Owner badge is static — never a dropdown */}
              {m.role === "owner" || !isOwner || isSelf ? (
                <RoleBadge role={m.role} />
              ) : (
                <RoleDropdown
                  currentRole={m.role}
                  disabled={isLoading}
                  onChange={(r) => handleRoleChange(m.id, r)}
                />
              )}

              {isOwner && !isSelf && m.role !== "owner" && (
                <button
                  onClick={() => handleRemove(m.id, m.user.name)}
                  disabled={isLoading}
                  className="opacity-0 group-hover:opacity-100 transition-opacity
                    text-zinc-500 hover:text-red-400 p-1 rounded
                    disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove member"
                >
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, image }: { name: string; image: string | null }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
      />
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700
      flex items-center justify-center text-xs font-medium text-zinc-300 font-mono">
      {initials}
    </div>
  )
}

function RoleDropdown({
  currentRole,
  onChange,
  disabled,
}: {
  currentRole: Role
  onChange: (r: Role) => void
  disabled: boolean
}) {
  return (
    <select
      value={currentRole}
      onChange={(e) => onChange(e.target.value as Role)}
      disabled={disabled}
      className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs
        rounded-md px-2 py-1.5 font-mono cursor-pointer
        focus:outline-none focus:border-orange-500
        disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {ASSIGNABLE_ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  )
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}