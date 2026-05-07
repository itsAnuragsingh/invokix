// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation"
import { requireSession } from "@/lib/auth/session"
import { Sidebar } from "@/components/dashboard/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session.user} />
      {/*
        Mobile: sidebar is hidden, a fixed topbar (h-14) shows instead.
        pt-14 offsets content below the topbar on mobile.
        md: sidebar is fixed at 256px, CSS variable drives margin via globals.css:
          #dashboard-main { margin-left: 256px; transition: margin-left 0.3s ease; }
          body[data-sidebar="collapsed"] #dashboard-main { margin-left: 60px; }
      */}
      <main
        id="dashboard-main"
        className="flex-1 min-h-screen pt-14 md:pt-7 px-4 py-4 md:p-8 w-full"
      >
        {children}
      </main>
    </div>
  )
}