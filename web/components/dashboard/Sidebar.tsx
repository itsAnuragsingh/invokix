"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowLineLeftIcon,
  ArrowLineRightIcon,
  BookOpenIcon,
  CaretDownIcon,
  CheckIcon,
  CpuIcon,
  GearIcon,
  GitBranchIcon,
  GlobeIcon,
  HouseIcon,
  KeyIcon,
  LightningIcon,
  ListIcon,
  ShieldCheckIcon,
  ShareNetworkIcon,
  SignOutIcon,
  SparkleIcon,
  StackIcon,
  UserCircleIcon,
  UsersIcon,
  XIcon,
  CreditCardIcon,
} from "@phosphor-icons/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth/client"
import { isAdmin } from "@/lib/admin/auth"
import type { User } from "better-auth"

type SidebarProps = {
  user: User
  projects: { id: string; name: string }[]
  isStaffAdmin?: boolean
}

const primary = [{ href: "/dashboard", label: "Overview", icon: HouseIcon }]

const resources = [
  {
    href: "/docs",
    label: "Docs",
    fullLabel: "Documentation",
    icon: BookOpenIcon,
    accentColor: "#AE8CFF", // Electric Lavender
    badge: "v1.2",
    hoverRotate: "group-hover:rotate-6",
  },
  {
    href: "/templates",
    label: "Templates",
    fullLabel: "Templates",
    icon: StackIcon,
    accentColor: "#FFD15C", // Golden Amber
    badge: "Specs",
    hoverRotate: "group-hover:-rotate-6",
  },
]

export function Sidebar({ user, projects, isStaffAdmin }: SidebarProps) {
  const userIsAdmin = isStaffAdmin !== undefined ? isStaffAdmin : isAdmin(user?.email)
  const settings = [
    ...(userIsAdmin ? [{ href: "/admin", label: "Admin Panel", icon: ShieldCheckIcon }] : []),
    { href: "/billing", label: "Billing & Plans", icon: CreditCardIcon },
    { href: "/upgrade", label: "Upgrade Plan", icon: SparkleIcon },
    { href: "/settings/account", label: "Account", icon: UserCircleIcon },
    { href: "/settings/api-keys", label: "API keys", icon: KeyIcon },
  ]
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const active = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  const projectMatch = pathname.match(/^\/project\/([^/]+)/)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const projectId = projectMatch?.[1] ?? selectedProjectId
  const projectTools = projectId
    ? [
      { href: `/project/${projectId}`, label: "Contract", icon: LightningIcon, exact: true },
      { href: `/project/${projectId}/history`, label: "History", icon: GitBranchIcon },
      { href: `/project/${projectId}/consumers`, label: "Consumers", icon: UsersIcon },
      { href: `/project/${projectId}/mock`, label: "Mock server", icon: CpuIcon },
      { href: `/project/${projectId}/environments`, label: "Environments", icon: GlobeIcon },
      { href: `/project/${projectId}/validator`, label: "Validator", icon: ShieldCheckIcon },
      { href: `/project/${projectId}/settings`, label: "Project settings", icon: GearIcon },
    ]
    : []

  useEffect(() => {
    document.body.dataset.sidebar = collapsed ? "collapsed" : "expanded"
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (projectMatch?.[1]) {
      setSelectedProjectId(projectMatch[1])
      localStorage.setItem("invokix:active-project", projectMatch[1])
      return
    }
    const saved = localStorage.getItem("invokix:active-project")
    if (saved && projects.some((project) => project.id === saved)) setSelectedProjectId(saved)
    else if (projects[0]) setSelectedProjectId(projects[0].id)
  }, [pathname, projects])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const Nav = ({ mobile = false }: { mobile?: boolean }) => {
    const expanded = mobile || !collapsed
    const selectedProject = projects.find((project) => project.id === projectId)
    const chooseProject = (id: string) => {
      setSelectedProjectId(id)
      localStorage.setItem("invokix:active-project", id)
      setProjectMenuOpen(false)
      router.push(`/project/${id}`)
    }

    const renderNavGroup = (
      items: { href: string; label: string; icon: typeof HouseIcon; exact?: boolean }[],
      sectionLabel: string,
      isProjectGroup = false
    ) => (
      <div className="mt-7">
        <p
          className={cn(
            "mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground/50",
            !expanded && "sr-only"
          )}
        >
          {sectionLabel}
        </p>
        {isProjectGroup && expanded && (
          <p className="mb-3 truncate border-l-2 border-[#B7FF3C] px-3 text-xs font-semibold text-foreground">
            Active project
          </p>
        )}
        <div className={cn("space-y-1", isProjectGroup && "border-l border-border/40 pl-2")}>
          {items.map(({ href, label: itemLabel, icon: Icon, exact }) => {
            const isActive = active(href, exact)
            return (
              <Link
                key={href}
                href={href}
                title={!expanded ? itemLabel : undefined}
                className={cn(
                  "group relative flex h-10 items-center gap-3 px-3 text-sm font-medium transition-colors",
                  !expanded && "justify-center px-0",
                  isActive
                    ? "border-l-2 border-[#B7FF3C] bg-primary/15 text-foreground"
                    : "border-l-2 border-transparent text-muted-foreground hover:bg-white/[.045] hover:text-foreground"
                )}
              >
                <Icon size={17} weight={isActive ? "fill" : "regular"} className={cn(isActive && "text-[#B7FF3C]")} />
                <span className={!expanded ? "sr-only" : ""}>{itemLabel}</span>
                {isActive && expanded && <span className="ml-auto h-1.5 w-1.5 bg-[#B7FF3C]" />}
              </Link>
            )
          })}
        </div>
      </div>
    )

    return (
      <>
        {/* Header */}
        <div className={cn("flex h-20 items-center px-5", !expanded && "justify-center px-0")}>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/15 shadow-lg shadow-primary/25 shrink-0 p-1">
              <img src="/logo.png" alt="Invokix" className="h-full w-full object-cover" />
            </div>
            <div className={!expanded ? "sr-only" : ""}>
              <p className="font-display text-lg font-bold tracking-tight text-foreground">
                Invokix<span className="text-[#B7FF3C]">.</span>
              </p>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[.14em] text-muted-foreground">
                Contract console
              </p>
            </div>
          </Link>
          {!mobile && expanded && (
            <button onClick={() => setCollapsed(true)} className="ml-auto text-muted-foreground/60 hover:text-foreground">
              <ArrowLineLeftIcon size={16} />
            </button>
          )}
        </div>

        {!mobile && !expanded && (
          <button
            onClick={() => setCollapsed(false)}
            className="mb-2 grid w-full place-items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLineRightIcon size={16} />
          </button>
        )}

        {/* Scrollable Navigation Area */}
        <div className={cn("flex-1 overflow-y-auto border-t border-border/40 px-3 pb-4", !expanded && "px-2")}>
          {renderNavGroup(primary, "Workspace")}

          {/* Project Selector */}
          {projects.length > 0 && (
            <div className="mt-7">
              <p
                className={cn(
                  "mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground/50",
                  !expanded && "sr-only"
                )}
              >
                Current project
              </p>
              <div className="relative">
                {expanded ? (
                  <button
                    onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                    className="flex w-full items-center gap-3 border border-border/45 bg-white/[.035] px-3 py-3 text-left hover:border-primary/40"
                  >
                    <span className="grid h-7 w-7 place-items-center bg-primary/15 text-primary">
                      <LightningIcon size={15} weight="fill" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {selectedProject?.name ?? "Select project"}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">Contract workspace</span>
                    </span>
                    <CaretDownIcon
                      size={14}
                      className={cn("text-muted-foreground transition-transform", projectMenuOpen && "rotate-180")}
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => setCollapsed(false)}
                    title={selectedProject?.name ?? "Select project"}
                    className="grid h-10 w-full place-items-center bg-primary/10 text-primary"
                  >
                    <LightningIcon size={17} weight="fill" />
                  </button>
                )}
                {projectMenuOpen && expanded && (
                  <div className="absolute inset-x-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto border border-border/50 bg-[#11141C] p-1 shadow-2xl shadow-black/35">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => chooseProject(project.id)}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-white/[.06]",
                          project.id === projectId && "bg-primary/10 text-primary"
                        )}
                      >
                        <span className="grid h-6 w-6 place-items-center bg-muted/40 font-display font-bold text-[10px]">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="flex-1 truncate font-medium">{project.name}</span>
                        {project.id === projectId && <CheckIcon size={14} weight="bold" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {projectTools.length > 0 && renderNavGroup(projectTools, "Project tools", true)}

          {/* Resources Section (Docs & Templates - Horizontal Rows) */}
          <div className="mt-7">
            <p
              className={cn(
                "mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground/50",
                !expanded && "sr-only"
              )}
            >
              Resources
            </p>
            <div className="space-y-1">
              {resources.map((item) => {
                const isActive = active(item.href)
                const Icon = item.icon
                const isLavender = item.accentColor === "#AE8CFF"

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!expanded ? item.fullLabel : undefined}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 px-3 text-sm font-medium transition-all duration-150 rounded-md",
                      !expanded && "justify-center px-0 rounded-none",
                      isActive
                        ? isLavender
                          ? "border-l-2 border-[#AE8CFF] bg-[#AE8CFF]/15 text-foreground"
                          : "border-l-2 border-[#FFD15C] bg-[#FFD15C]/15 text-foreground"
                        : isLavender
                          ? "border-l-2 border-transparent text-muted-foreground hover:bg-[#AE8CFF]/10 hover:text-[#AE8CFF] hover:border-l-2 hover:border-[#AE8CFF]/80"
                          : "border-l-2 border-transparent text-muted-foreground hover:bg-[#FFD15C]/10 hover:text-[#FFD15C] hover:border-l-2 hover:border-[#FFD15C]/80"
                    )}
                  >
                    <div
                      className={cn(
                        "transition-transform duration-200 group-hover:scale-110",
                        item.hoverRotate
                      )}
                    >
                      <Icon
                        size={17}
                        weight={isActive ? "fill" : "duotone"}
                        style={{ color: isActive ? item.accentColor : undefined }}
                        className={cn(!isActive && (isLavender ? "group-hover:text-[#AE8CFF]" : "group-hover:text-[#FFD15C]"))}
                      />
                    </div>
                    <span className={!expanded ? "sr-only" : ""}>{item.fullLabel}</span>
                    {expanded && (
                      <span
                        className={cn(
                          "ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors",
                          isLavender
                            ? "border-[#AE8CFF]/30 bg-[#AE8CFF]/15 text-[#AE8CFF] group-hover:border-[#AE8CFF]/60"
                            : "border-[#FFD15C]/30 bg-[#FFD15C]/15 text-[#FFD15C] group-hover:border-[#FFD15C]/60"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && expanded && (
                      <span
                        className="h-1.5 w-1.5 rounded-full ml-1"
                        style={{ backgroundColor: item.accentColor }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {renderNavGroup(settings, "Account")}
        </div>

        {/* Footer User Profile Card (Linear / Supabase Dark Sleek) */}
        <div className={cn("border-t border-border/40 p-2.5", !expanded && "p-1.5")}>
          <div
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0D0F17] p-2.5 shadow-md shadow-black/40 transition-all duration-200 hover:border-white/20 hover:bg-[#131622]",
              !expanded && "justify-center p-1 border-transparent bg-transparent shadow-none"
            )}
          >
            {/* User Avatar */}
            <Avatar className="h-8 w-8 rounded-lg border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] shrink-0 shadow-inner">
              <AvatarFallback className="bg-transparent text-xs font-bold text-foreground">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className={cn("min-w-0 flex-1 space-y-0.5", !expanded && "sr-only")}>
              <p className="truncate text-xs font-semibold text-foreground tracking-tight group-hover:text-white transition-colors">
                {user.name}
              </p>
              <p className="truncate text-[10px] font-mono text-muted-foreground/60 leading-none">
                {user.email}
              </p>
            </div>

            {/* Logout Action Button */}
            <button
              onClick={async () => {
                await signOut()
                router.push("/login")
              }}
              title={`Sign out (${user.email})`}
              className={cn(
                "group/logout grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-muted-foreground/70 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 active:scale-95 transition-all duration-150 shadow-sm",
                !expanded && "h-8 w-8 bg-[#0D0F17] border-white/10"
              )}
            >
              <SignOutIcon
                size={14}
                weight="bold"
                className="group-hover/logout:translate-x-0.5 transition-transform duration-150"
              />
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-border/40 bg-background/90 px-4 backdrop-blur md:hidden">
        <button onClick={() => setMobileOpen(true)}>
          <ListIcon size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-md border border-white/15">
            <img src="/logo.png" alt="Invokix" className="h-full w-full object-cover" />
          </div>
          <span className="font-display font-bold">
            Invokix<span className="text-[#B7FF3C]">.</span>
          </span>
        </div>
      </div>

      {/* Mobile Overlay & Drawer */}
      {mobileOpen && (
        <>
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-50 bg-black/60 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-[60] flex w-72 flex-col bg-sidebar md:hidden">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 text-muted-foreground">
              <XIcon size={18} />
            </button>
            <Nav mobile />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border/45 bg-sidebar md:flex",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <Nav />
      </aside>
    </>
  )
}
