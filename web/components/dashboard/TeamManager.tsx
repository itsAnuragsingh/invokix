// components/dashboard/TeamManager.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  UserPlusIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  CrownIcon,
  EnvelopeIcon,
  UserIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

// ── Types ─────────────────────────────────────────────────────────────────────
type Member = {
  id: string
  role: "owner" | "editor" | "viewer"
  joinedAt: Date | string | null
  user: { id: string; name: string; email: string; image: string | null }
}

type PendingInvite = {
  id: string
  email: string
  role: "editor" | "viewer"
  expiresAt: Date | string
}

type TeamManagerProps = {
  projectId: string
  currentUserId: string
  initialMembers: Member[]
  initialPending: PendingInvite[]
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: "owner" | "editor" | "viewer" }) {
  const styles = {
    owner:  "text-amber-400 bg-amber-500/10 border-amber-500/20",
    editor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    viewer: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  }
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border capitalize ${styles[role]}`}>
      {role}
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return <img src={image} alt={name} className="h-8 w-8 rounded-full object-cover" />
  }
  return (
    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
      <span className="text-xs font-bold text-primary">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function TeamManager({
  projectId,
  currentUserId,
  initialMembers,
  initialPending,
}: TeamManagerProps) {
  const [members, setMembers]   = useState<Member[]>(initialMembers)
  const [pending, setPending]   = useState<PendingInvite[]>(initialPending)
  const [email, setEmail]       = useState("")
  const [role, setRole]         = useState<"editor" | "viewer">("viewer")
  const [sending, setSending]   = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // ── Send invite ─────────────────────────────────────────────────────────────
  async function handleInvite() {
    if (!email.trim()) { toast.error("Email is required"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Invalid email"); return }

    setSending(true)
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, email: email.trim(), role }),
      })
      const json = await res.json() as { success: boolean; data?: { invite: PendingInvite }; error?: string }
      if (!json.success) { toast.error(json.error ?? "Failed to send invite"); return }

      setPending([...pending, json.data!.invite])
      setEmail("")
      toast.success(`Invite sent to ${email}`)
    } catch {
      toast.error("Failed to send invite")
    } finally {
      setSending(false)
    }
  }

  // ── Update role ─────────────────────────────────────────────────────────────
  async function handleRoleChange(memberId: string, newRole: "editor" | "viewer") {
    try {
      const res = await fetch(`/api/team/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) { toast.error(json.error ?? "Failed to update role"); return }

      setMembers(members.map((m) => m.id === memberId ? { ...m, role: newRole } : m))
      toast.success("Role updated")
    } catch {
      toast.error("Failed to update role")
    }
  }

  // ── Remove member ───────────────────────────────────────────────────────────
  async function handleRemove(memberId: string) {
    setRemovingId(memberId)
    try {
      const res = await fetch(`/api/team/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) { toast.error(json.error ?? "Failed to remove member"); return }

      setMembers(members.filter((m) => m.id !== memberId))
      toast.success("Member removed")
    } catch {
      toast.error("Failed to remove member")
    } finally {
      setRemovingId(null)
    }
  }

  // ── Revoke invite ───────────────────────────────────────────────────────────
  async function handleRevoke(inviteId: string) {
    setRemovingId(inviteId)
    try {
      const res = await fetch(`/api/team/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) { toast.error(json.error ?? "Failed to revoke invite"); return }

      setPending(pending.filter((p) => p.id !== inviteId))
      toast.success("Invite revoked")
    } catch {
      toast.error("Failed to revoke invite")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-8">

      {/* Invite form */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-0.5">Invite team member</h3>
          <p className="text-xs text-muted-foreground">They&apos;ll receive an email with a link to join.</p>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <EnvelopeIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              placeholder="shruti@startup.com"
              className="w-full bg-background border border-border/50 rounded-lg pl-8 pr-3 py-2 text-sm
                text-foreground placeholder:text-muted-foreground/40 focus:outline-none
                focus:border-primary/50 transition-colors"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm
              text-foreground focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>

          <button
            onClick={handleInvite}
            disabled={sending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
              bg-primary text-white hover:bg-primary/90 disabled:opacity-50
              transition-all duration-150 shrink-0"
          >
            <UserPlusIcon size={13} weight="bold" />
            {sending ? "Sending..." : "Invite"}
          </button>
        </div>

        <div className="flex gap-4 text-xs text-muted-foreground/60">
          <span><strong className="text-blue-400">Editor</strong> — can modify contract and publish</span>
          <span><strong className="text-zinc-400">Viewer</strong> — read only, copy outputs</span>
        </div>
      </div>

      {/* Current members */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Team members
          <span className="ml-2 text-xs font-normal text-muted-foreground/50">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </h3>

        <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/30">
          <AnimatePresence initial={false}>
            {members.map((member) => {
              const isCurrentUser = member.user.id === currentUserId
              const isOwner = member.role === "owner"

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-4 py-3 bg-card/20"
                >
                  <Avatar name={member.user.name} image={member.user.image} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {member.user.name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] text-muted-foreground/40">(you)</span>
                      )}
                      {isOwner && <CrownIcon size={12} weight="fill" className="text-amber-400" />}
                    </div>
                    <span className="text-xs text-muted-foreground/60 truncate block">
                      {member.user.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isOwner ? (
                      <RoleBadge role="owner" />
                    ) : (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as "editor" | "viewer")}
                        disabled={isCurrentUser}
                        className="bg-background border border-border/50 rounded-lg px-2 py-1 text-xs
                          text-foreground focus:outline-none focus:border-primary/50 transition-colors
                          disabled:opacity-50"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                    )}

                    {!isOwner&& (
                      <button
                        onClick={() => handleRemove(member.id)}
                        disabled={removingId === member.id}
                        className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center
                          text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-all duration-150"
                      >
                        {removingId === member.id
                          ? <XIcon size={10} />
                          : <TrashIcon size={12} />
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Pending invites */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Pending invites
            <span className="ml-2 text-xs font-normal text-muted-foreground/50">
              {pending.length} pending
            </span>
          </h3>

          <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/30">
            <AnimatePresence initial={false}>
              {pending.map((invite) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-4 py-3 bg-card/20"
                >
                  <div className="h-8 w-8 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center shrink-0">
                    <UserIcon size={14} className="text-muted-foreground/40" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground/80 truncate block">{invite.email}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ClockIcon size={10} className="text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground/50">
                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <RoleBadge role={invite.role} />
                    <button
                      onClick={() => handleRevoke(invite.id)}
                      disabled={removingId === invite.id}
                      className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center
                        text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-all duration-150"
                    >
                      {removingId === invite.id
                        ? <XIcon size={10} />
                        : <TrashIcon size={12} />
                      }
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state */}
      {members.length <= 1 && pending.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/40 bg-muted/10 p-8 text-center space-y-2">
          <UserPlusIcon size={24} className="text-muted-foreground/20 mx-auto" />
          <p className="text-sm text-muted-foreground/50">
            Invite Shruti and Rahul — they&apos;ll always have the latest types.
          </p>
        </div>
      )}
    </div>
  )
}