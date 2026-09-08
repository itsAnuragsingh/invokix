// components/members/InviteModal.tsx
"use client"
import { useState, useRef, useEffect } from "react"
import { ASSIGNABLE_ROLES } from "@/lib/permissions"
import type { Role } from "@/lib/permissions"

type PendingInvite = {
  id: string
  email: string
  role: Role
  expiresAt: string
  inviter: { name: string }
}

type Props = {
  projectId: string
  open: boolean
  onClose: () => void
  onInviteSent: () => void
}

export function InviteModal({ projectId, open, onClose, onInviteSent }: Props) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("editor")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [revoking, setRevoking] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      fetchPending()
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setEmail("")
      setStatus("idle")
      setErrorMsg("")
    }
  }, [open])

  async function fetchPending() {
    const res = await fetch(`/api/projects/${projectId}/invites`)
    if (res.ok) {
      const data = await res.json()
      setPendingInvites(data.data?.invites ?? [])
    }
  }

  async function handleSend() {
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Enter a valid email address.")
      setStatus("error")
      return
    }
    setStatus("loading")
    setErrorMsg("")

    const res = await fetch(`/api/projects/${projectId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
    })

    if (res.ok) {
      setStatus("success")
      setEmail("")
      onInviteSent()
      fetchPending()
    } else {
      const data = await res.json()
      setErrorMsg(data.error ?? "Failed to send invite.")
      setStatus("error")
    }
  }

  async function handleRevoke(inviteId: string) {
    setRevoking(inviteId)
    try {
      const res = await fetch(`/api/projects/${projectId}/invites`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      })
      if (res.ok) fetchPending()
    } finally {
      setRevoking(null)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/60
        rounded-xl shadow-2xl shadow-black/60 p-6 z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 font-mono tracking-tight">
              Invite a teammate
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              They'll receive an email with an invite link valid for 48h.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input row */}
        <div className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus("idle") }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
              text-sm text-zinc-200 placeholder-zinc-600
              focus:outline-none focus:border-orange-500 transition-colors font-mono"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm
              rounded-lg px-3 py-2 font-mono cursor-pointer
              focus:outline-none focus:border-orange-500"
          >
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Role description */}
        <p className="text-xs text-zinc-500 mb-4 font-mono">
          {role === "editor"
            ? "Editor — can edit contracts, generate code, and publish."
            : "Viewer — read-only access. Cannot edit or publish."}
        </p>

        {/* Error */}
        {status === "error" && (
          <p className="text-xs text-red-400 mb-3 font-mono">{errorMsg}</p>
        )}

        {/* Success */}
        {status === "success" && (
          <p className="text-xs text-emerald-400 mb-3 font-mono">
            ✓ Invite sent successfully.
          </p>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={status === "loading" || !email.trim()}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-400
            text-white text-sm font-semibold rounded-lg
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors font-mono tracking-wide"
        >
          {status === "loading" ? "Sending…" : "Send Invite"}
        </button>

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">
              Pending invites
            </p>
            <div className="space-y-2">
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between
                    bg-zinc-800/60 border border-zinc-700/40 rounded-lg px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-zinc-300 truncate">{inv.email}</p>
                    <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                      {inv.role} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(inv.id)}
                    disabled={revoking === inv.id}
                    className="text-zinc-600 hover:text-red-400 text-xs font-mono
                      transition-colors ml-3 shrink-0 disabled:opacity-40"
                  >
                    {revoking === inv.id ? "…" : "Revoke"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}