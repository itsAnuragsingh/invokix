// app/(docs)/layout.tsx
import type { Metadata } from "next"
import Link from "next/link"
import { DocsNav } from "@/components/docs/DocsNav"

export const metadata: Metadata = {
  title: { template: "%s — Invokix Docs", default: "Invokix Docs" },
  description: "Documentation for Invokix — Your API contract platform.",
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">⚡</span>
              </div>
              <span className="font-display font-bold text-sm text-foreground">Invokix</span>
              <span className="text-muted-foreground/40 text-sm">/</span>
              <span className="text-sm text-muted-foreground">Docs</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard →
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-screen-xl mx-auto px-4 flex gap-0">

        {/* Sidebar */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-6 border-r border-border/40">
          <DocsNav />
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 py-10 md:pl-12 max-w-3xl">
          {children}
        </main>

      </div>
    </div>
  )
}