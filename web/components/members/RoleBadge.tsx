// components/members/RoleBadge.tsx
"use client"
import type { Role } from "@/lib/permissions"

const STYLES: Record<Role, string> = {
  owner:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20 ring-0",
  editor:
    "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  viewer:
    "bg-zinc-700/60 text-zinc-400 border border-zinc-600/40",
}

const DOTS: Record<Role, string> = {
  owner: "bg-amber-400",
  editor: "bg-blue-400",
  viewer: "bg-zinc-400",
}

type Props = {
  role: Role
  size?: "sm" | "md"
}

export function RoleBadge({ role, size = "md" }: Props) {
  const textSize = size === "sm" ? "text-[10px]" : "text-xs"
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wide
        ${STYLES[role]} ${textSize} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[role]}`} />
      {role}
    </span>
  )
}
