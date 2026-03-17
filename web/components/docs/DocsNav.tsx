// components/docs/DocsNav.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavItem = { title: string; href: string; badge?: string }
type NavSection = { title: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/quick-start" },
    ],
  },
  {
    title: "Importing Your API",
    items: [
      { title: "OpenAPI / Swagger", href: "/docs/import/openapi" },
      { title: "Postman Collection", href: "/docs/import/postman" },
      { title: "Plain English", href: "/docs/import/ai", badge: "AI" },
      { title: "Route Code", href: "/docs/import/code", badge: "AI" },
    ],
  },
  {
    title: "Code Generation",
    items: [
      { title: "TypeScript Types", href: "/docs/codegen/types" },
      { title: "React Query v5 Hooks", href: "/docs/codegen/hooks", badge: "Only" },
      { title: "Zod Schemas", href: "/docs/codegen/zod", badge: "Only" },
      { title: "React Native Hooks", href: "/docs/codegen/react-native" },
    ],
  },
  {
    title: "Features",
    items: [
      { title: "Mock Server", href: "/docs/mock-server" },
      { title: "Breaking Changes", href: "/docs/breaking-changes" },
      { title: "Health Score", href: "/docs/health-score" },
      { title: "Environments", href: "/docs/environments" },
      { title: "Team & Invites", href: "/docs/team" },
      { title: "Slack Alerts", href: "/docs/slack-alerts" },
      { title: "Version History", href: "/docs/versions" },
      { title: "Share Page", href: "/docs/share" },
    ],
  },
  {
    title: "CLI",
    items: [
      { title: "npx invokix pull", href: "/docs/cli", badge: "New" },
    ],
  },
  {
    title: "Stacks",
    items: [
      { title: "Next.js / React", href: "/docs/stacks/nextjs" },
      { title: "React Native", href: "/docs/stacks/react-native" },
      { title: "Express / Node", href: "/docs/stacks/express" },
      { title: "Angular", href: "/docs/stacks/angular" },
    ],
  },
]

export function DocsNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      {NAV.map((section) => (
        <div key={section.title}>
          {/* Section label */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-1.5 px-2">
            {section.title}
          </p>

          {/* Items */}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center justify-between gap-2",
                      "px-2 py-1.5 rounded-lg text-sm transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]"
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
                    )}

                    <span className="pl-1">{item.title}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0",
                        item.badge === "AI"
                          ? "bg-violet-500/15 text-violet-400 border border-violet-500/20"
                          : item.badge === "Only"
                          ? "bg-primary/15 text-primary border border-primary/20"
                          : item.badge === "New"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}