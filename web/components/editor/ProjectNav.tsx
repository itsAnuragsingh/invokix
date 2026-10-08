"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CpuIcon, GearIcon, GitBranchIcon, GlobeIcon, LightningIcon, ShareNetworkIcon, ShieldCheckIcon, UsersIcon } from "@phosphor-icons/react"

type ProjectNavProps = { id: string; contractId: string }

export function ProjectNav({ id, contractId }: ProjectNavProps) {
  const pathname = usePathname()
  const tabs = [{ href: `/project/${id}`, label: "Contract", icon: LightningIcon, exact: true }, { href: `/project/${id}/history`, label: "History", icon: GitBranchIcon }, { href: `/project/${id}/consumers`, label: "Consumers", icon: UsersIcon }, { href: `/project/${id}/mock`, label: "Mock", icon: CpuIcon }, { href: `/project/${id}/environments`, label: "Environments", icon: GlobeIcon }, { href: `/project/${id}/validator`, label: "Validator", icon: ShieldCheckIcon }, { href: `/project/${id}/settings`, label: "Settings", icon: GearIcon }, { href: `/share/${contractId}`, label: "Share", icon: ShareNetworkIcon, external: true }]
  return <nav className="overflow-x-auto"><div className="flex min-w-max gap-1 px-1 py-1">{tabs.map(({ href, label, icon: Icon, exact, external }) => { const selected = external ? false : exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} target={external ? "_blank" : undefined} className={cn("flex h-9 items-center gap-2 px-3 text-xs font-semibold transition-colors", selected ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-white/[.05] hover:text-foreground")}><Icon size={14} weight={selected ? "fill" : "regular"} />{label}{external && <span className="text-[10px] opacity-55">↗</span>}</Link> })}</div></nav>
}
