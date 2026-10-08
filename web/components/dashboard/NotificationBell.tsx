// components/dashboard/NotificationBell.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  BellIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  UsersIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export type PendingUserInvite = {
  id: string
  token: string
  role: "editor" | "viewer"
  projectId: string
  projectName: string
  inviterName: string
  inviterEmail: string
  expiresAt: string
  createdAt: string
}

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter()
  const [invites, setInvites] = useState<PendingUserInvite[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch pending invites
  async function fetchInvites() {
    try {
      const res = await fetch("/api/user/invites")
      const json = (await res.json()) as {
        success: boolean
        data?: { invites: PendingUserInvite[] }
      }
      if (json.success && json.data?.invites) {
        setInvites(json.data.invites)

        // Show Sonner toast if there are invites and haven't notified in this session yet
        if (json.data.invites.length > 0) {
          const firstInvite = json.data.invites[0]
          const storageKey = `invokix:notified-invite:${firstInvite.id}`
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, "true")
            toast.info(`You're invited to join "${firstInvite.projectName}"!`, {
              description: `Invited by ${firstInvite.inviterName} as ${firstInvite.role}. Click to review.`,
              action: {
                label: "Review",
                onClick: () => setOpen(true),
              },
              duration: 8000,
            })
          }
        }
      }
    } catch {
      // ignore background fetch errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // Accept invite directly from dashboard
  async function handleAccept(invite: PendingUserInvite) {
    setActionLoadingId(invite.id)
    try {
      const res = await fetch(`/api/invite/${invite.token}`, { method: "POST" })
      const json = (await res.json()) as {
        success: boolean
        data?: { projectId: string }
        error?: string
      }

      if (!json.success) {
        toast.error(json.error ?? "Failed to accept invite")
        return
      }

      toast.success(`Joined "${invite.projectName}" successfully!`)
      setInvites((prev) => prev.filter((i) => i.id !== invite.id))
      setOpen(false)
      router.push(`/project/${json.data!.projectId}`)
      router.refresh()
    } catch {
      toast.error("Failed to accept invitation")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Decline invite
  async function handleDecline(invite: PendingUserInvite) {
    setActionLoadingId(invite.id)
    try {
      const res = await fetch(`/api/user/invites/${invite.id}/decline`, {
        method: "POST",
      })
      const json = (await res.json()) as { success: boolean; error?: string }

      if (!json.success) {
        toast.error(json.error ?? "Failed to decline invite")
        return
      }

      toast.info(`Declined invite for "${invite.projectName}"`)
      setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    } catch {
      toast.error("Failed to decline invitation")
    } finally {
      setActionLoadingId(null)
    }
  }

  const unreadCount = invites.length

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) fetchInvites()
        }}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150",
          open
            ? "border-primary/50 bg-primary/10 text-primary"
            : unreadCount > 0
            ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:border-amber-400 hover:bg-amber-500/15"
            : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:bg-white/[0.07] hover:text-foreground"
        )}
        title={unreadCount > 0 ? `${unreadCount} pending invitation${unreadCount > 1 ? "s" : ""}` : "Notifications"}
      >
        <BellIcon
          size={16}
          weight={unreadCount > 0 ? "fill" : "regular"}
          className={cn(unreadCount > 0 && "animate-[bell-swing_2s_ease-in-out_infinite]")}
        />

        {/* Unread badge count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-black shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notifications Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-xl border border-white/10 bg-[#0E111A]/95 p-0 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 animate-in fade-in-0 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.2 text-[10px] font-bold text-primary">
                  {unreadCount} pending
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <XIcon size={14} />
            </button>
          </div>

          {/* List of Invites */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.06] p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                <CircleNotchIcon size={14} className="animate-spin text-primary" />
                <span>Checking invitations...</span>
              </div>
            ) : invites.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-muted-foreground/40">
                  <BellIcon size={16} />
                </div>
                <p className="text-xs font-medium text-foreground">All caught up</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  No pending team invitations right now.
                </p>
              </div>
            ) : (
              invites.map((invite) => {
                const isWorking = actionLoadingId === invite.id
                let expiresText = "7 days"
                try {
                  expiresText = formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })
                } catch {
                  // ignore date parsing error
                }

                return (
                  <div
                    key={invite.id}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {invite.projectName}
                          </span>
                          <span className="shrink-0 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.2 text-[9px] font-mono font-medium uppercase text-primary">
                            {invite.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          Invited by <strong className="text-foreground/90 font-medium">{invite.inviterName}</strong> ({invite.inviterEmail})
                        </p>
                      </div>
                      <div className="grid h-6 w-6 place-items-center rounded-md bg-white/[0.05] text-muted-foreground shrink-0">
                        <UsersIcon size={12} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <ClockIcon size={11} />
                        Expires {expiresText}
                      </span>
                    </div>

                    {/* Action buttons: Accept directly in dashboard or Decline */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleAccept(invite)}
                        disabled={isWorking}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-[#B7FF3C] hover:bg-[#a6ec31] px-2.5 py-1.5 text-xs font-semibold text-black transition-colors disabled:opacity-50"
                      >
                        {isWorking ? (
                          <CircleNotchIcon size={12} className="animate-spin" />
                        ) : (
                          <CheckIcon size={12} weight="bold" />
                        )}
                        <span>Accept & Join</span>
                      </button>

                      <button
                        onClick={() => handleDecline(invite)}
                        disabled={isWorking}
                        className="flex items-center justify-center gap-1 rounded-md border border-white/10 bg-white/[0.03] hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors disabled:opacity-50"
                      >
                        <XIcon size={12} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-white/[0.06] bg-black/20 px-3 py-2 text-center text-[10px] text-muted-foreground/60">
            Accept directly here or via the email invitation link.
          </div>
        </div>
      )}
    </div>
  )
}
