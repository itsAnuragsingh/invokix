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
import { ProjectNav } from "@/components/editor/ProjectNav"
import { ProjectStatBar } from "@/components/editor/ProjectStatBar"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
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
    <div className="animate-fade-up">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Projects
        </Link>
        <span className="text-muted-foreground/30 text-xs">/</span>
        <span className="text-xs text-foreground/70">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary font-display font-bold text-sm">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              {contract && (
                <span className="font-mono text-[11px] text-primary border border-primary/30 bg-primary/5 px-2 py-0.5 rounded-full">
                  v{contract.version}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-xs text-muted-foreground/60 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>

        {contract && (
          <div className="flex items-center gap-2 shrink-0">
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

      {/* Stat bar */}
      {contract && (
        <ProjectStatBar
          healthScore={contract.healthScore}
          endpointCount={endpointCount}
          version={contract.version}
          updatedAt={updatedAt!}
          mockUrl={mockUrl!}
          projectId={id}
          contractId={contract.id}
        />
      )}

      {/* Nav */}
      {contract && (
        <div className="mt-6">
          <ProjectNav id={id} contractId={contract.id} />
        </div>
      )}

      {/* Content */}
      <div className="mt-6">
        {!contract ? (
          <ImportPanel projectId={id} />
        ) : (
          <div className="space-y-6">
            <EndpointList contract={contract} projectId={id} />
            <GenerateButton projectId={id} />
          </div>
        )}
      </div>

    </div>
  )
}