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
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}