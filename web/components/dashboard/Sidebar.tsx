// components/dashboard/Sidebar.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  HouseIcon,
  GearIcon,
  SignOutIcon,
  CodeIcon,
  LightningIcon,
  ArrowSquareOutIcon,
  StackIcon,
  KeyIcon,
  UserCircleIcon,
  CaretRightIcon,
  ArrowLineLeftIcon,
  ArrowLineRightIcon,
  ListIcon,
  XIcon,
} from "@phosphor-icons/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth/client"
import type { User } from "better-auth"

type SidebarProps = { user: User }

const mainNav    = [{ href: "/dashboard",        label: "Dashboard", icon: HouseIcon }]
const settingsNav = [
  { href: "/settings/account",  label: "Account",  icon: UserCircleIcon },
  { href: "/settings/api-keys", label: "API Keys", icon: KeyIcon },
]
const resourcesNav = [
  { href: "/docs", label: "Documentation", icon: CodeIcon,   external: true },
  { href: "#", label: "Templates",     icon: StackIcon,  external: true },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [collapsed,    setCollapsed]    = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/settings"))

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    document.body.dataset.sidebar = collapsed ? "collapsed" : "expanded"
  }, [collapsed])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  /** Shared nav tree — rendered in both desktop sidebar and mobile drawer */
  function NavTree({ isMobile = false }: { isMobile?: boolean }) {
    const isExpanded = isMobile || !collapsed
    return (
      <>
        {/* Logo row */}
        <div className={cn("flex items-center gap-3 px-4 pt-5 pb-4", !isExpanded && "px-[14px]")}>
          <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="relative h-10 w-10 rounded-xl flex items-center justify-center overflow-hidden ">
           <img src='/logo-1.png' alt='invoix' className="w-full h-full object-cover"/>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/20 to-transparent" />
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <p className="font-display font-bold text-sm tracking-tight text-foreground leading-none">Invokix<span className="text-[#B7FF3C]">.</span></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">API Contract Platform</p>
              </div>
            )}
          </Link>

          {/* Desktop: collapse button */}
          {!isMobile && isExpanded && (
            <button onClick={() => setCollapsed(true)}
              className="ml-auto h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all shrink-0"
              title="Collapse">
              <ArrowLineLeftIcon className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Mobile: close X */}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)}
              className="ml-auto h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all shrink-0">
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop collapsed expand button */}
        {!isMobile && !isExpanded && (
          <button onClick={() => setCollapsed(false)}
            className="mx-auto mb-2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            title="Expand">
            <ArrowLineRightIcon className="h-3.5 w-3.5" />
          </button>
        )}

        <Separator className="opacity-50" />

        {/* Nav */}
        <div className={cn("flex-1 py-4 space-y-1 overflow-y-auto", isExpanded ? "px-3" : "px-[10px]")}>

          {isExpanded && <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Menu</p>}

          {mainNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} title={!isExpanded ? label : undefined}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  !isExpanded && "px-2.5 justify-center",
                  active ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                         : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}>
                <Icon weight={active ? "fill" : "regular"} className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                {isExpanded && <>{label}{active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />}</>}
              </Link>
            )
          })}

          <Separator className="my-3 opacity-30" />

          {isExpanded && <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Settings</p>}

          {isExpanded ? (
            <>
              <button onClick={() => setSettingsOpen(!settingsOpen)}
                className={cn(
                  "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  pathname.startsWith("/settings") ? "text-foreground bg-muted/60" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}>
                <GearIcon weight={pathname.startsWith("/settings") ? "fill" : "regular"} className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
                Settings
                <CaretRightIcon className={cn("h-3 w-3 ml-auto transition-transform duration-200", settingsOpen && "rotate-90")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-200", settingsOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
                <div className="ml-3 pl-3 border-l border-border/40 space-y-0.5 pt-1">
                  {settingsNav.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href)
                    return (
                      <Link key={href} href={href}
                        className={cn(
                          "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}>
                        <Icon weight={active ? "fill" : "regular"} className="h-3.5 w-3.5 shrink-0" />
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            settingsNav.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link key={href} href={href} title={label}
                  className={cn(
                    "group flex items-center justify-center px-2.5 py-2.5 rounded-lg transition-all duration-150",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}>
                  <Icon weight={active ? "fill" : "regular"} className="h-4 w-4" />
                </Link>
              )
            })
          )}

          <Separator className="my-3 opacity-30" />

          {isExpanded && <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Resources</p>}

          {resourcesNav.map(({ href, label, icon: Icon }) => (
            <a key={label} href={href} title={!isExpanded ? label : undefined}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150",
                !isExpanded && "px-2.5 justify-center"
              )}>
              <Icon weight="regular" className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
              {isExpanded && <>{label}<ArrowSquareOutIcon className="h-3 w-3 ml-auto opacity-40 group-hover:opacity-70" /></>}
            </a>
          ))}
        </div>

        <Separator className="opacity-50" />

        {/* User footer */}
        <div className={cn("p-3", !isExpanded && "px-[10px]")}>
          {!isExpanded ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-primary/30">
                <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <SignOutIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg bg-muted/40 border border-border/30">
              <Avatar className="h-8 w-8 border-2 border-primary/30 shrink-0">
                <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0">
                <SignOutIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {/* ── Mobile topbar ──────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center gap-3 px-4 bg-sidebar border-b border-border/40">
        <button onClick={() => setMobileOpen(true)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
          <ListIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 rounded-md bg-primary flex items-center justify-center shadow shadow-primary/30">
            <LightningIcon weight="fill" className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-foreground">Invokix<span className="text-[#B7FF3C]">.</span></span>
        </div>
      </div>

      {/* ── Mobile overlay ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 h-full w-72 z-[60] flex flex-col bg-sidebar border-r border-border/40 transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavTree isMobile />
      </aside>

      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside className={cn(
        "hidden md:flex fixed left-0 top-0 h-full flex-col bg-sidebar border-r border-border/40 transition-all duration-300 ease-in-out z-40",
        collapsed ? "w-[60px]" : "w-64"
      )}>
        <NavTree />
      </aside>
    </>
  )
}