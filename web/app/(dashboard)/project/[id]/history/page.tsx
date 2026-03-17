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

type Props = { params: Promise<{ id: string }> }

export default async function HistoryPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params
  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const contract = await getContractByProjectId(id)
  if (!contract) redirect(`/project/${id}`)

  const versions = await getVersionsByContractId(contract.id)

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
              {versions.length} versions
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Every publish snapshot — diff, rollback, full audit trail
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

      <HistoryTimeline versions={versions} contractId={contract.id} projectId={id} />
    </div>
  )
}