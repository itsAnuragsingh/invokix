// app/(dashboard)/project/[id]/history/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { getVersionsByContractId } from "@/lib/db/queries/versions"
import { HistoryTimeline } from "@/components/editor/HistoryTimeline"
import { Badge } from "@/components/ui/badge"
import {
  GitBranchIcon,
  LightningIcon,
  UsersIcon,
  GearIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { getUserPlan } from "@/lib/plans/usage"
import { PLAN_LIMITS } from "@/lib/plans/limits"
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner"

type Props = { params: Promise<{ id: string }> }

export default async function HistoryPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params
  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const contract = await getContractByProjectId(id)
  if (!contract) redirect(`/project/${id}`)

  const plan = await getUserPlan(session.user.id)
  const limits = PLAN_LIMITS[plan]

  const allVersions = await getVersionsByContractId(contract.id)

  // Free plan: only last N versions visible
  const visibleLimit = limits.maxVisibleVersions
  const visibleVersions = visibleLimit === Infinity
    ? allVersions
    : allVersions.slice(0, visibleLimit)
  const hiddenCount = allVersions.length - visibleVersions.length

  return (
    <div className="space-y-0 animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <Link href={`/project/${id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{project.name}</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <span className="text-xs text-foreground font-medium">History</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Version History</h1>
            <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5">
              {allVersions.length} versions
            </Badge>
            {visibleLimit !== Infinity && (
              <Badge variant="outline" className="font-mono text-xs border-amber-500/30 text-amber-500 bg-amber-500/5">
                Showing last {visibleLimit}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {limits.canRollback
              ? "Every publish snapshot — diff, rollback, full audit trail"
              : "Every publish snapshot — upgrade to Pro for full history & rollback"}
          </p>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 mb-8">
        {[
          { href: `/project/${id}`, label: "Contract", icon: LightningIcon },
          { href: `/project/${id}/history`, label: "History", icon: GitBranchIcon, active: true },
          { href: `/project/${id}/consumers`, label: "Consumers", icon: UsersIcon },
          { href: `/project/${id}/settings`, label: "Settings", icon: GearIcon },
          { href: `/share/${contract.id}`, label: "Share ↗", icon: ShareNetworkIcon, external: true },
        ].map(({ href, label, icon: Icon, active, external }) => (
          <Link
            key={href}
            href={href}
            target={external ? "_blank" : undefined}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-all duration-150 -mb-px ${
              active
                ? "text-foreground border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground hover:border-primary/50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>

      <HistoryTimeline
        versions={visibleVersions}
        contractId={contract.id}
        projectId={id}
      />

      {/* Upgrade banner when older versions are hidden */}
      {hiddenCount > 0 && (
        <div className="mt-8">
          <UpgradeBanner
            feature="Full Version History"
            requiredPlan="pro"
            currentPlan={plan}
            description={`${hiddenCount} older version${hiddenCount !== 1 ? "s" : ""} hidden. Upgrade to Pro for full history, one-click rollback, and complete audit trail.`}
            inline
          />
        </div>
      )}

      {/* Rollback gate notice */}
      {!limits.canRollback && visibleVersions.length > 0 && (
        <div className="mt-4">
          <UpgradeBanner
            feature="One-Click Rollback"
            requiredPlan="pro"
            currentPlan={plan}
            description="Instantly restore any previous version of your contract with one click."
            inline
          />
        </div>
      )}
    </div>
  )
}