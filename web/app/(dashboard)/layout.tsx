// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation"
import { requireSession } from "@/lib/auth/session"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { getProjectsByUserId } from "@/lib/db/queries/projects"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  if (!session) redirect("/login")
  const projects = await getProjectsByUserId(session.user.id)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_72%_-12%,rgba(99,102,241,.10),transparent_28%),#080A0F]">
      <Sidebar user={session.user} projects={projects.map((project) => ({ id: project.id, name: project.name }))} />
      {/*
        Mobile: sidebar is hidden, a fixed topbar (h-14) shows instead.
        pt-14 offsets content below the topbar on mobile.
        md: sidebar is fixed at 256px, CSS variable drives margin via globals.css:
          #dashboard-main { margin-left: 256px; transition: margin-left 0.3s ease; }
          body[data-sidebar="collapsed"] #dashboard-main { margin-left: 60px; }
      */}
      <main
        id="dashboard-main"
        className="min-h-screen min-w-0 pt-20 px-4 pb-8 md:px-8 md:pt-10 md:pb-10"
      >
        {children}
      </main>
    </div>
  )
}
