// app/(dashboard)/settings/api-keys/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getCliTokensByUserId } from "@/lib/db/queries/cli"
import { ApiKeysManager } from "@/components/settings/ApiKeysManager"

export default async function ApiKeysPage() {
  const session = await requireSession()
  if (!session) redirect("/login")

  const tokens = await getCliTokensByUserId(session.user.id)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">API Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create API keys to authenticate the Invokix CLI. Each key can be named so you know which machine or pipeline it belongs to.
        </p>
      </div>
      <ApiKeysManager initialTokens={tokens} />
    </div>
  )
}