// app/(dashboard)/project/[id]/environments/page.tsx
import { notFound, redirect } from "next/navigation"
import { requireSession } from "@/lib/auth/session"
import { getProjectById } from "@/lib/db/queries/projects"
import { getEnvironments } from "@/lib/db/queries/environments"
import { EnvironmentManager } from "@/components/editor/EnvironmentManager"

type Props = { params: Promise<{ id: string }> }

export default async function EnvironmentsPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params

  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const environments = await getEnvironments(id, session.user.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <EnvironmentManager
        projectId={id}
        initialEnvironments={environments}
      />
    </div>
  )
}