// components/dashboard/Sidebar.tsx
"use client"

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
} from "@phosphor-icons/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth/client"
import type { User } from "better-auth"

type SidebarProps = {
  user: User
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HouseIcon },
  { href: "/settings/account", label: "Settings", icon: GearIcon },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col bg-sidebar border-r border-border/40">

      {/* Logo area */}
      <div className="px-4 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
            <LightningIcon weight="fill" className="h-4 w-4 text-white" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/20 to-transparent" />
          </div>
          <div>
            <p className="font-display font-bold text-sm tracking-tight text-foreground leading-none">Invokix</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">API Contract Platform</p>
          </div>
        </Link>
      </div>

      <Separator className="opacity-50" />

      {/* Nav section */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Menu
        </p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon
                weight={isActive ? "fill" : "regular"}
                className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary-foreground")}
              />
              {label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
              )}
            </Link>
          )
        })}

        <Separator className="my-3 opacity-30" />

        <p className="px-2 mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Resources
        </p>

        <a
          href="#"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
        >
          <CodeIcon weight="regular" className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
          Documentation
          <ArrowSquareOutIcon className="h-3 w-3 ml-auto opacity-40 group-hover:opacity-70" />
        </a>

        <a
          href="#"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
        >
          <StackIcon weight="regular" className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
          Templates
          <ArrowSquareOutIcon className="h-3 w-3 ml-auto opacity-40 group-hover:opacity-70" />
        </a>
      </div>

      <Separator className="opacity-50" />

      {/* User footer */}
      <div className="p-3">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg bg-muted/40 border border-border/30">
          <Avatar className="h-8 w-8 border-2 border-primary/30 shrink-0">
            <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-foreground">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title="Sign out"
            aria-label="Sign out"
            onClick={handleSignOut}
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <SignOutIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}