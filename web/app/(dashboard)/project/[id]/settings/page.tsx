// app/(dashboard)/project/[id]/settings/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { getNotificationsByProjectId } from "@/lib/db/queries/notifications"
import { getTeamMembers, getPendingInvites } from "@/lib/db/queries/team"
import { NotificationSettings } from "@/components/dashboard/NotificationSettings"
import { DangerZone } from "@/components/dashboard/DangerZone"
import { TeamManager } from "@/components/dashboard/TeamManager"
import Link from "next/link"
import { StackSelector } from "@/components/dashboard/StackSelector"
import { getUserPlan } from "@/lib/plans/usage"
import { PLAN_LIMITS, PLAN_DISPLAY } from "@/lib/plans/limits"
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner"

type Props = { params: Promise<{ id: string }> }

export default async function SettingsPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params
  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const plan = await getUserPlan(session.user.id)
  const limits = PLAN_LIMITS[plan]
  const planDisplay = PLAN_DISPLAY[plan]

  const contract = await getContractByProjectId(id)
  const notifications = contract
    ? await getNotificationsByProjectId(id)
    : null

  const [members, pending] = await Promise.all([
    getTeamMembers(id, session.user.id),
    getPendingInvites(id, session.user.id),
  ])

  const teamCount = members.length
  const teamMax = limits.maxTeamMembers
  const teamLimitReached = teamMax !== Infinity && teamCount >= teamMax

  return (
    <div className="mx-auto max-w-7xl animate-fade-up">
      <div className="border-b border-border/45 pb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <Link href={`/project/${id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{project.name}</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <span className="text-xs text-foreground font-medium">Settings</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Project settings.</h1>
            <span className="inline-flex items-center border border-primary/30 bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
              {planDisplay.badge} plan
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Notifications, integrations, and danger zone</p>
        </div>
      </div>

      <div className="mt-8 max-w-3xl space-y-8">
        <StackSelector
          projectId={id}
          currentStack={project.stack as "nextjs" | "react-native" | "express" | "angular" | "other"}
        />

        {/* Team */}
        <div className="rounded-xl border border-border/50 bg-card/20 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Team</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invite teammates to view or edit this project.
                </p>
              </div>
              {teamMax !== Infinity && (
                <span className="text-xs text-muted-foreground">
                  {teamCount}/{teamMax} members
                </span>
              )}
            </div>
            {teamLimitReached && (
              <div className="mt-3">
                <UpgradeBanner
                  feature="More Team Members"
                  requiredPlan={plan === "free" ? "pro" : "team"}
                  currentPlan={plan}
                  description={`You've reached the ${planDisplay.label} plan limit of ${teamMax} team members.`}
                  inline
                />
              </div>
            )}
          </div>
          <TeamManager
            projectId={id}
            currentUserId={session.user.id}
            initialMembers={members}
            initialPending={pending}
          />
        </div>

        {/* Notifications */}
        {limits.canAlerts ? (
          <NotificationSettings projectId={id} initial={notifications ?? null} />
        ) : (
          <div className="rounded-xl border border-border/50 bg-card/20 p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Slack & Discord alerts for contract changes.
              </p>
            </div>
            <UpgradeBanner
              feature="Slack & Discord Alerts"
              requiredPlan="pro"
              currentPlan={plan}
              description="Get notified in Slack or Discord when contracts change or breaking changes are detected."
              inline
            />
          </div>
        )}

        <DangerZone projectId={id} projectName={project.name} />
      </div>
    </div>
  )
}
