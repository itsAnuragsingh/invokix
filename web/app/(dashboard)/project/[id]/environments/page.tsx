// app/(dashboard)/project/[id]/environments/page.tsx
import { notFound, redirect } from "next/navigation"
import { requireSession } from "@/lib/auth/session"
import { getProjectById } from "@/lib/db/queries/projects"
import { getEnvironments } from "@/lib/db/queries/environments"
import { EnvironmentManager } from "@/components/editor/EnvironmentManager"
import { getUserPlan } from "@/lib/plans/usage"
import { PLAN_LIMITS } from "@/lib/plans/limits"
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner"

type Props = { params: Promise<{ id: string }> }

export default async function EnvironmentsPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params

  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const plan = await getUserPlan(session.user.id)
  const limits = PLAN_LIMITS[plan]

  if (!limits.canEnvironments) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <UpgradeBanner
          feature="Environment Manager"
          requiredPlan="pro"
          currentPlan={plan}
          description="Manage dev, staging, and production base URLs for your API — available on the Pro plan."
        />
      </div>
    )
  }

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