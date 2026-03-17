// app/(dashboard)/dashboard/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getProjectsByUserId } from "@/lib/db/queries/projects"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog"
import { PlusIcon, LightningIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"

export default async function DashboardPage() {
  const session = await requireSession()
  if (!session) redirect("/login")

  const projects = await getProjectsByUserId(session.user.id)

  return (
    <div className="space-y-8 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Welcome back
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {session.user.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {projects.length === 0
              ? "Create your first project to get started"
              : `${projects.length} project${projects.length !== 1 ? "s" : ""} · All systems operational`}
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Stats bar */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-3 animate-fade-up animate-fade-up-delay-1">
          {[
            { label: "Total Projects", value: projects.length },
            { label: "Active Contracts", value: projects.length },
            { label: "Health Score", value: "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/50 bg-card/50 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length === 0 ? (
        <div className="animate-fade-up animate-fade-up-delay-2">
          <div className="relative rounded-2xl border border-dashed border-border/50 bg-card/30 p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative">
              <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <LightningIcon weight="fill" className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground">No projects yet</h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                Create your first project and generate TypeScript types, React Query hooks, and Zod schemas in seconds.
              </p>
              <div className="mt-6">
                <CreateProjectDialog />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up animate-fade-up-delay-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Projects
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <ProjectCard
  project={project}
  memberRole={(project as { memberRole?: "owner" | "editor" | "viewer" }).memberRole}
/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}