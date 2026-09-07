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
                      "px-2.5 py-1.5 text-sm transition-all duration-150 font-sans",
                      isActive
                        ? "bg-[#B7FF3C]/10 text-[#B7FF3C] font-semibold border-l-2 border-[#B7FF3C]"
                        : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04] border-l-2 border-transparent"
                    )}
                  >
                    <span className="pl-0.5">{item.title}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span className={cn(
                        "text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 shrink-0 border",
                        item.badge === "AI"
                          ? "bg-[#AE8CFF]/15 text-[#AE8CFF] border-[#AE8CFF]/30"
                          : item.badge === "Only"
                          ? "bg-[#56B6C2]/15 text-[#56B6C2] border-[#56B6C2]/30"
                          : item.badge === "New"
                          ? "bg-[#B7FF3C]/15 text-[#B7FF3C] border-[#B7FF3C]/30"
                          : "bg-muted text-muted-foreground border-border/40"
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