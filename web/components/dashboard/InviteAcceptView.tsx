// components/dashboard/InviteAcceptView.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  WarningIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

type InviteAcceptViewProps =
  | { status: "invalid" | "used" | "expired"; token: string }
  | {
      status: "valid"
      token: string
      invite: {
        email: string
        role: "editor" | "viewer"
        project: { id: string; name: string }
        inviter: { name: string; email: string }
      }
      currentUserEmail: string
    }

export function InviteAcceptView(props: InviteAcceptViewProps) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)

  async function handleAccept() {
    if (props.status !== "valid") return
    setAccepting(true)
    try {
      const res = await fetch(`/api/invite/${props.token}`, { method: "POST" })
      const json = await res.json() as { success: boolean; data?: { projectId: string }; error?: string }
      if (!json.success) {
        toast.error(json.error ?? "Failed to accept invite")
        return
      }
      toast.success(`Welcome to ${props.invite.project.name}!`)
      router.push(`/project/${json.data!.projectId}`)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setAccepting(false)
    }
  }

  // ── Error states ────────────────────────────────────────────────────────────
  if (props.status !== "valid") {
    const config = {
      invalid: {
        icon: <XCircleIcon size={40} weight="fill" className="text-red-400" />,
        title: "Invalid invite",
        message: "This invite link doesn't exist or has been revoked.",
      },
      used: {
        icon: <CheckCircleIcon size={40} weight="fill" className="text-emerald-400" />,
        title: "Already accepted",
        message: "This invite has already been used.",
      },
      expired: {
        icon: <ClockIcon size={40} weight="fill" className="text-amber-400" />,
        title: "Invite expired",
        message: "This invite link expired after 7 days. Ask the project owner to send a new one.",
      },
    }[props.status]

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-border/50 bg-card/30 p-8 text-center space-y-4"
        >
          <div className="flex justify-center">{config.icon}</div>
          <h1 className="font-display text-xl font-bold text-foreground">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.message}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-primary hover:underline"
          >
            Go to dashboard →
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Valid invite ────────────────────────────────────────────────────────────
  const { invite, currentUserEmail } = props
  const emailMismatch = currentUserEmail.toLowerCase() !== invite.email.toLowerCase()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-4"
      >
        {/* Header */}
        <div className="text-center space-y-1 mb-6">
          <span className="text-2xl">⚡</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Invokix</h1>
        </div>

        {/* Invite card */}
        <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-foreground">
              You&apos;ve been invited
            </h2>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{invite.inviter.name}</strong> invited you to join a project
            </p>
          </div>

          {/* Project info */}
          <div className="rounded-xl bg-muted/20 border border-border/40 p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Project
            </p>
            <p className="text-base font-semibold text-foreground">{invite.project.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Your role:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${
                invite.role === "editor"
                  ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                  : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
              }`}>
                {invite.role}
              </span>
            </div>
          </div>

          {/* Email mismatch warning */}
          {emailMismatch && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <WarningIcon size={14} weight="fill" className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed">
                This invite was sent to <strong>{invite.email}</strong> but you&apos;re signed in as{" "}
                <strong>{currentUserEmail}</strong>. You can still accept it.
              </p>
            </div>
          )}

          {/* Accept button */}
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              bg-primary text-white font-semibold text-sm hover:bg-primary/90
              disabled:opacity-50 transition-all duration-150"
          >
            {accepting ? (
              <>Joining...</>
            ) : (
              <>
                Accept invitation
                <ArrowRightIcon size={14} weight="bold" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground/50">
            Signed in as <strong className="text-muted-foreground">{currentUserEmail}</strong>
          </p>
        </div>
      </motion.div>
    </div>
  )
}