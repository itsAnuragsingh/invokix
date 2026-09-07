// app/(dashboard)/project/[id]/consumers/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { getConsumersByContractId } from "@/lib/db/queries/consumers"
import { ConsumerTable } from "@/components/dashboard/ConsumerTable"
import Link from "next/link"
import { getUserPlan } from "@/lib/plans/usage"
import { PLAN_LIMITS } from "@/lib/plans/limits"
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner"

type Props = { params: Promise<{ id: string }> }

export default async function ConsumersPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params
  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const plan = await getUserPlan(session.user.id)
  const limits = PLAN_LIMITS[plan]

  const contract = await getContractByProjectId(id)
  if (!contract) redirect(`/project/${id}`)

  return (
    <div className="mx-auto max-w-7xl animate-fade-up">
      <div className="border-b border-border/45 pb-7">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <Link href={`/project/${id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{project.name}</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <span className="text-xs text-foreground font-medium">Consumers</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground">Consumers.</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Every team consuming this contract — version, source, last seen
          </p>
        </div>
      </div>

      {/* Plan gate */}
      <div className="mt-8">{!limits.canConsumerTracking ? (
        <UpgradeBanner
          feature="Consumer Tracking"
          requiredPlan="pro"
          currentPlan={plan}
          description="See who's consuming your API contracts, what versions they're on, and when they last pulled — available on the Pro plan."
        />
      ) : (
        <ConsumerTableWrapper contractId={contract.id} contractVersion={contract.version} />
      )}</div>
    </div>
  )
}

async function ConsumerTableWrapper({ contractId, contractVersion }: { contractId: string; contractVersion: string }) {
  const contractConsumers = await getConsumersByContractId(contractId)

  return (
    <>
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">{contractConsumers.length} tracked consumer{contractConsumers.length === 1 ? "" : "s"}</p>
      <ConsumerTable consumers={contractConsumers} currentVersion={contractVersion} />
    </>
  )
}
