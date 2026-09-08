import { notFound, redirect } from "next/navigation"
import { requireSession } from "@/lib/auth/session"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { FlowsExperience } from "@/components/editor/FlowsExperience"

type Props = { params: Promise<{ id: string }> }

export default async function FlowsPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params
  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const contract = await getContractByProjectId(id)

  return (
    <FlowsExperience
      projectId={id}
      projectName={project.name}
      contractName={project.name}
      hasContract={Boolean(contract && contract.openApiSpec)}
      openApiSpec={(contract?.openApiSpec as object) ?? null}
    />
  )
}
