// app/(dashboard)/project/[id]/consumers/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { db } from "@/lib/db"
import { consumers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { ConsumerTable } from "@/components/dashboard/ConsumerTable"
import { Badge } from "@/components/ui/badge"
import {
  LightningIcon,
  GitBranchIcon,
  UsersIcon,
  GearIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react/dist/ssr"
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
    <div className="space-y-0 animate-fade-up">
      <div className="flex items-start justify-between pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Projects</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <Link href={`/project/${id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{project.name}</Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <span className="text-xs text-foreground font-medium">Consumers</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Consumers</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Every team consuming this contract — version, source, last seen
          </p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-1 border-b border-border/50 mb-8">
        {[
          { href: `/project/${id}`, label: "Contract", icon: LightningIcon },
          { href: `/project/${id}/history`, label: "History", icon: GitBranchIcon },
          { href: `/project/${id}/consumers`, label: "Consumers", icon: UsersIcon, active: true },
          { href: `/project/${id}/settings`, label: "Settings", icon: GearIcon },
          { href: `/share/${contract.id}`, label: "Share ↗", icon: ShareNetworkIcon, external: true },
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

      {/* Plan gate */}
      {!limits.canConsumerTracking ? (
        <UpgradeBanner
          feature="Consumer Tracking"
          requiredPlan="pro"
          currentPlan={plan}
          description="See who's consuming your API contracts, what versions they're on, and when they last pulled — available on the Pro plan."
        />
      ) : (
        <ConsumerTableWrapper contractId={contract.id} contractVersion={contract.version} />
      )}
    </div>
  )
}

async function ConsumerTableWrapper({ contractId, contractVersion }: { contractId: string; contractVersion: string }) {
  const contractConsumers = await db.query.consumers.findMany({
    where: eq(consumers.contractId, contractId),
    orderBy: (consumers, { desc }) => [desc(consumers.lastPulledAt)],
  })

  return (
    <>
      <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5 mb-4">
        {contractConsumers.length} total
      </Badge>
      <ConsumerTable consumers={contractConsumers} currentVersion={contractVersion} />
    </>
  )
}