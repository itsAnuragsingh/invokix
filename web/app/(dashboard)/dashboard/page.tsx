// app/(dashboard)/dashboard/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getProjectsByUserId } from "@/lib/db/queries/projects"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog"
import { LightningIcon } from "@phosphor-icons/react/dist/ssr"
import { getUserPlan, countMonthlyAiGenerations, checkContractLimit } from "@/lib/plans/usage"
import { PLAN_LIMITS, PLAN_DISPLAY } from "@/lib/plans/limits"

export default async function DashboardPage() {
  const session = await requireSession()
  if (!session) redirect("/login")

  const [projects, plan, aiUsed, contractLimit] = await Promise.all([
    getProjectsByUserId(session.user.id),
    getUserPlan(session.user.id),
    countMonthlyAiGenerations(session.user.id),
    checkContractLimit(session.user.id),
  ])

  const limits = PLAN_LIMITS[plan]
  const planDisplay = PLAN_DISPLAY[plan]
  const firstName = session.user.name?.split(" ")[0] ?? "there"
  const aiMax = limits.maxAiGenerationsPerMonth
  const aiPercent = aiMax === Infinity ? 0 : Math.min((aiUsed / aiMax) * 100, 100)

  return (
    <div className="space-y-10 animate-fade-up">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/70">
              Welcome back
            </p>
            <span className="inline-flex items-center rounded-full border border-[#B7FF3C]/30 bg-[#B7FF3C]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#B7FF3C]">
              {planDisplay.badge}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-none">
            {firstName}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>
              {projects.length === 0
                ? "Create your first API contract to get started."
                : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 pl-1 border-l border-border/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B7FF3C] animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
        <CreateProjectDialog />
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Projects / Contract Limit */}
          <div className="group relative rounded-2xl border border-border/40 bg-card/40 px-5 py-4 overflow-hidden transition-all duration-200 hover:border-border/70 hover:bg-card/60">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#B7FF3C]/40 to-transparent" />
            <p className="font-display text-3xl font-bold text-foreground">
              {contractLimit.current}
              {contractLimit.limit !== Infinity && (
                <span className="text-lg text-muted-foreground font-normal">/{contractLimit.limit}</span>
              )}
            </p>
            <p className="text-xs font-semibold text-foreground/70 mt-1">Contracts</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {contractLimit.limit === Infinity
                ? "Unlimited on your plan"
                : contractLimit.allowed
                  ? `${contractLimit.limit - contractLimit.current} remaining`
                  : "Limit reached — upgrade to add more"}
            </p>
          </div>

          {/* AI Generations */}
          <div className="group relative rounded-2xl border border-border/40 bg-card/40 px-5 py-4 overflow-hidden transition-all duration-200 hover:border-border/70 hover:bg-card/60">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#B7FF3C]/40 to-transparent" />
            <p className="font-display text-3xl font-bold text-foreground">
              {aiUsed}
              {aiMax !== Infinity && (
                <span className="text-lg text-muted-foreground font-normal">/{aiMax}</span>
              )}
            </p>
            <p className="text-xs font-semibold text-foreground/70 mt-1">AI Generations</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">This month</p>
            {aiMax !== Infinity && (
              <div className="mt-2 h-1 w-full rounded-full bg-border/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    aiPercent >= 90 ? "bg-red-500" : aiPercent >= 70 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${aiPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Health Score */}
          <div className="group relative rounded-2xl border border-border/40 bg-card/40 px-5 py-4 overflow-hidden transition-all duration-200 hover:border-border/70 hover:bg-card/60">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#B7FF3C]/40 to-transparent" />
            <p className="font-display text-3xl font-bold text-foreground">—</p>
            <p className="text-xs font-semibold text-foreground/70 mt-1">Avg Health Score</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Publish a contract to track</p>
          </div>
        </div>
      )}

      {/* ── Projects ────────────────────────────────────────────────── */}
      {projects.length === 0 ? (
        <div className="relative rounded-2xl border border-dashed border-border/50 bg-card/20 p-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <LightningIcon weight="fill" className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">No projects yet</h2>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
                Create your first project and generate TypeScript types, React Query hooks, and Zod schemas instantly.
              </p>
            </div>
            <CreateProjectDialog />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
              Projects · {projects.length}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="animate-fade-up"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <ProjectCard
                  project={project}
                  memberRole={
                    (project as { memberRole?: "owner" | "editor" | "viewer" }).memberRole
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}