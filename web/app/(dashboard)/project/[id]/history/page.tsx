// app/(dashboard)/project/[id]/history/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { getVersionsByContractId } from "@/lib/db/queries/versions"
import { HistoryTimeline } from "@/components/editor/HistoryTimeline"
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
    <div className="mx-auto max-w-7xl animate-fade-up">

      {/* Header */}
      <div className="border-b border-border/45 pb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <Link href={`/project/${id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{project.name}</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <span className="text-xs text-foreground font-medium">History</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Version history.</h1><span className="border border-primary/30 bg-primary/5 px-2 py-1 font-mono text-[10px] text-primary">{allVersions.length} versions</span>{visibleLimit !== Infinity && <span className="border border-amber-500/30 bg-amber-500/5 px-2 py-1 font-mono text-[10px] text-amber-500">Last {visibleLimit} visible</span>}</div>
          <p className="text-muted-foreground text-sm mt-1">
            {limits.canRollback
              ? "Every publish snapshot — diff, rollback, full audit trail"
              : "Every publish snapshot — upgrade to Pro for full history & rollback"}
          </p>
        </div>
      </div>

      <div className="mt-8"><HistoryTimeline
        versions={visibleVersions}
        contractId={contract.id}
        projectId={id}
      /></div>

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
