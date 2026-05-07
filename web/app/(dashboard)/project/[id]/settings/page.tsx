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
import {
  LightningIcon, GitBranchIcon, UsersIcon,
  GearIcon, ShareNetworkIcon,
} from "@phosphor-icons/react/dist/ssr"
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
    <div className="space-y-0 animate-fade-up">
      <div className="flex items-start justify-between pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <Link href={`/project/${id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{project.name}</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <span className="text-xs text-foreground font-medium">Settings</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Settings</h1>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              {planDisplay.badge} plan
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Notifications, integrations, and danger zone</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-1 border-b border-border/50 mb-8">
        {[
          { href: `/project/${id}`, label: "Contract", icon: LightningIcon },
          { href: `/project/${id}/history`, label: "History", icon: GitBranchIcon },
          { href: `/project/${id}/consumers`, label: "Consumers", icon: UsersIcon },
          { href: `/project/${id}/settings`, label: "Settings", icon: GearIcon, active: true },
          { href: `/share/${contract?.id ?? ""}`, label: "Share ↗", icon: ShareNetworkIcon, external: true },
        ].map(({ href, label, icon: Icon, active, external }) => (
          <Link key={href} href={href} target={external ? "_blank" : undefined}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-all duration-150 -mb-px ${
              active ? "text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground hover:border-primary/50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />{label}
          </Link>
        ))}
      </div>

      <div className="max-w-2xl space-y-8">
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