// app/(dashboard)/project/[id]/validator/page.tsx
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { ResponseValidator } from "@/components/editor/ResponseValidator"
import { getUserPlan } from "@/lib/plans/usage"
import { PLAN_LIMITS } from "@/lib/plans/limits"
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner"
import type { OpenAPIV3 } from "openapi-types"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ValidatorPage({ params }: Props) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const project = await getProjectById(id, session.user.id)
  if (!project) notFound()

  const plan = await getUserPlan(session.user.id)
  const limits = PLAN_LIMITS[plan]

  if (!limits.canMockAndValidator) {
    return (
      <div className="py-8 px-6 max-w-6xl">
        <UpgradeBanner
          feature="API Response Validator"
          requiredPlan="pro"
          currentPlan={plan}
          description="Validate live API responses against your contract schema to catch drift — available on the Pro plan."
        />
      </div>
    )
  }

  const contract = await getContractByProjectId(id)
  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <p className="text-sm font-semibold text-foreground">No contract yet</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Import or generate a contract first, then come back to validate your API responses.
        </p>
      </div>
    )
  }

  const spec = contract.openApiSpec as OpenAPIV3.Document
  const endpoints: { method: string; path: string }[] = []

  if (spec.paths) {
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      if (!pathItem) continue
      const methods = ["get", "post", "put", "patch", "delete"] as const
      for (const method of methods) {
        if (pathItem[method]) {
          endpoints.push({ method, path })
        }
      }
    }
  }

  if (endpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <p className="text-sm font-semibold text-foreground">No endpoints found</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your contract has no endpoints defined yet. Add some endpoints and publish before validating.
        </p>
      </div>
    )
  }

  return (
    <div className="py-8 px-6 max-w-6xl">
      <ResponseValidator
        contractId={contract.id}
        endpoints={endpoints}
      />
    </div>
  )
}