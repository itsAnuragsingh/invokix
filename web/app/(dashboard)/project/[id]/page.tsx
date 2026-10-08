// app/(dashboard)/project/[id]/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { ImportPanel } from "@/components/editor/ImportPanel"
import { EndpointList } from "@/components/editor/EndpointList"
import { GenerateButton } from "@/components/editor/GenerateButton"
import { GenerateFromText } from "@/components/editor/GenerateFromText"
import { PublishButton } from "@/components/editor/PublishButton"
import { EditSpecModal } from "@/components/editor/EditSpecModal"
import { ProjectStatBar } from "@/components/editor/ProjectStatBar"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowSquareOutIcon, ShareNetworkIcon } from "@phosphor-icons/react/dist/ssr"
import { NotificationBell } from "@/components/dashboard/NotificationBell"
import type { OpenAPIV3 } from "openapi-types"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params
  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const contract = await getContractByProjectId(id)

  const endpointCount = contract
    ? Object.values(
        (contract.openApiSpec as OpenAPIV3.Document).paths ?? {}
      ).reduce(
        (acc, pathItem) =>
          acc +
          Object.keys(pathItem ?? {}).filter((m) =>
            ["get", "post", "put", "patch", "delete"].includes(m)
          ).length,
        0
      )
    : 0

  const mockUrl = contract
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/mock-proxy/${id}`
    : null

  const updatedAt = contract
    ? formatDistanceToNow(new Date(contract.updatedAt), { addSuffix: true })
    : null

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-7">

      {/* ── Breadcrumb & Actions ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <span className="text-muted-foreground/30 text-xs">/</span>
          <span className="text-xs text-foreground/80 font-medium">{project.name}</span>
        </div>
        <NotificationBell />
      </div>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border border-border/45 bg-card/30 px-5 py-5 sm:px-7 sm:py-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-lg overflow-hidden shrink-0 border border-border/40">
            <img
              src={`https://api.dicebear.com/10.x/moods/svg?tags=animation&seed=Felix-${Math.random().toString(36).slice(2, 8)}`}
              alt={project.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              {contract && (
                <span className="font-mono text-[11px] text-primary border border-primary/30 bg-primary/5 px-2 py-0.5 shrink-0">
                  v{contract.version}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{project.description}</p>
            )}
          </div>
        </div>

        {contract && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Link
              href={`/share/${contract.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
              title="Open public interactive share page"
            >
              <ShareNetworkIcon size={14} weight="bold" />
              <span>Share Page</span>
              <ArrowSquareOutIcon size={12} />
            </Link>
            <EditSpecModal
              projectId={id}
              currentSpec={contract.openApiSpec as object}
              contractId={contract.id}
              version={contract.version}
            />
            <GenerateFromText projectId={id} hasExistingContract={!!contract} />
            <PublishButton projectId={id} />
          </div>
        )}
        </div>
      </div>

      {/* ── Stat bar ────────────────────────────────────────────────── */}
      {contract && (
        <div className="border border-border/45 bg-card/20 px-1 py-1"><ProjectStatBar
          healthScore={contract.healthScore}
          endpointCount={endpointCount}
          version={contract.version}
          updatedAt={updatedAt!}
          mockUrl={mockUrl!}
          projectId={id}
          contractId={contract.id}
        /></div>
      )}

      {/* ── Content ─────────────────────────────────────────────────── */}
      {!contract ? (
        <ImportPanel projectId={id} />
      ) : (
        <div className="space-y-6">
          <EndpointList contract={contract} projectId={id} />
          <GenerateButton projectId={id} />
        </div>
      )}
    </div>
  )
}
