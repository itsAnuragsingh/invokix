// components/editor/ProjectNav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LightningIcon,
  GitBranchIcon,
  UsersIcon,
  GearIcon,
  CpuIcon,
  GlobeIcon,
  ShieldCheckIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react"

type ProjectNavProps = {
  id: string
  contractId: string
}

export function ProjectNav({ id, contractId }: ProjectNavProps) {
  const pathname = usePathname()

  const tabs = [
    { href: `/project/${id}`, label: "Contract", icon: LightningIcon, exact: true },
    { href: `/project/${id}/history`, label: "History", icon: GitBranchIcon },
    { href: `/project/${id}/consumers`, label: "Consumers", icon: UsersIcon },
    { href: `/project/${id}/mock`, label: "Mock", icon: CpuIcon },
    { href: `/project/${id}/environments`, label: "Environments", icon: GlobeIcon },
    { href: `/project/${id}/validator`, label: "Validator", icon: ShieldCheckIcon },
    { href: `/project/${id}/settings`, label: "Settings", icon: GearIcon },
    { href: `/share/${contractId}`, label: "Share", icon: ShareNetworkIcon, external: true },
  ]

  return (
    <div className="relative">
      {/* Bottom border full width */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border/40" />

      <div className="flex items-center gap-0.5 overflow-x-auto">
        {tabs.map(({ href, label, icon: Icon, exact, external }, i) => {
          const isActive = external
            ? false
            : exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/")

          // Separator before Settings and Share
          const hasSeparator = i === 6

          return (
            <div key={href} className="flex items-center shrink-0">
              {hasSeparator && (
                <div className="w-px h-4 bg-border/50 mx-2" />
              )}
              <Link
                href={href}
                target={external ? "_blank" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium",
                  "whitespace-nowrap transition-all duration-150",
                  "border-b-2 -mb-px",
                  isActive
                    ? "text-foreground border-primary"
                    : "text-muted-foreground/60 border-transparent hover:text-foreground hover:border-border"
                )}
              >
                <Icon
                  size={13}
                  weight={isActive ? "duotone" : "regular"}
                  className={cn(isActive ? "text-primary" : "")}
                />
                {label}
                {external && (
                  <span className="text-[10px] text-muted-foreground/40">↗</span>
                )}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}