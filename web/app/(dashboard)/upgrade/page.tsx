import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserPlan } from "@/lib/plans/usage"
import { checkBillingAccess } from "@/lib/plans/access.server"
import { UpgradeView } from "@/components/dashboard/UpgradeView"

export default async function UpgradePage() {
  const session = await requireSession()
  if (!session) redirect("/login?callbackUrl=/upgrade")

  const plan = await getUserPlan(session.user.id)
  const isBillingEnabled = await checkBillingAccess(session.user.email)

  return (
    <UpgradeView
      currentPlan={plan}
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? "User"}
      isBillingEnabled={isBillingEnabled}
    />
  )
}
