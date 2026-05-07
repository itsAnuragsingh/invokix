// app/(dashboard)/project/[id]/mock/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId, getMockUrl } from "@/lib/db/queries/contracts"
import { MockPanel } from "@/components/editor/MockPanel"
import { getUserPlan } from "@/lib/plans/usage"
import { PLAN_LIMITS } from "@/lib/plans/limits"
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner"

type Props = {
  params: Promise<{ id: string }>
}

export default async function MockPage({ params }: Props) {
  const session = await requireSession()
  if (!session) redirect("/login")

  const { id } = await params
  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const plan = await getUserPlan(session.user.id)
  const limits = PLAN_LIMITS[plan]

  if (!limits.canMockAndValidator) {
    return (
      <div className="py-8 px-6 max-w-6xl">
        <UpgradeBanner
          feature="Mock Server"
          requiredPlan="pro"
          currentPlan={plan}
          description="Spin up a mock server from your contract and test endpoints without a real backend — available on the Pro plan."
        />
      </div>
    )
  }

  const contract = await getContractByProjectId(id)
  if (!contract || !contract.openApiSpec) notFound()

  const mockUrl = getMockUrl(id)
  const spec = contract.openApiSpec as {
    paths?: Record<string, Record<string, { summary?: string; description?: string }>>
  }

  const endpoints: { method: string; path: string; summary?: string }[] = []
  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(methods)) {
      if (["get", "post", "put", "patch", "delete"].includes(method)) {
        endpoints.push({
          method: method.toUpperCase(),
          path,
          summary: operation.summary,
        })
      }
    }
  }

  return (
    <MockPanel
      projectId={id}
      mockUrl={mockUrl}
      endpoints={endpoints}
      contractVersion={contract.version}
    />
  )
}