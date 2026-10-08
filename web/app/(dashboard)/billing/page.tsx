import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getUserLimits, countUserContracts, countMonthlyAiGenerations } from "@/lib/plans/usage"
import { checkBillingAccess } from "@/lib/plans/access.server"
import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { BillingView } from "@/components/dashboard/BillingView"

export default async function BillingPage() {
  const session = await requireSession()
  if (!session) redirect("/login?callbackUrl=/billing")

  const limits = await getUserLimits(session.user.id)
  const contractsCount = await countUserContracts(session.user.id)
  const aiCount = await countMonthlyAiGenerations(session.user.id)
  const isBillingEnabled = await checkBillingAccess(session.user.email)

  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, session.user.id),
    columns: { expiresAt: true },
  })

  return (
    <BillingView
      currentPlan={limits.plan}
      limits={limits}
      usage={{
        contracts: contractsCount,
        aiGenerations: aiCount,
      }}
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? "User"}
      expiresAt={sub?.expiresAt ? sub.expiresAt.toISOString() : null}
      isBillingEnabled={isBillingEnabled}
    />
  )
}
