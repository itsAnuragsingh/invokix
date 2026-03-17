// app/cli-auth/page.tsx
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { getCliSession } from "@/lib/db/queries/cli"
import { CliAuthConfirm } from "@/components/cli/CliAuthConfirm"
import Link from "next/link"

type Props = {
  searchParams: Promise<{ session?: string }>
}

export default async function CliAuthPage({ searchParams }: Props) {
  const { session: sessionId } = await searchParams

  // No session id in URL
  if (!sessionId) {
    return <CliAuthError message="Invalid link. Go back to your terminal and run npx invokix pull again." />
  }

  // Check session exists and is not expired
  const cliSession = await getCliSession(sessionId)
  if (!cliSession) {
    return <CliAuthError message="This link has expired. Go back to your terminal and run npx invokix pull again." />
  }

  // Already confirmed
  if (cliSession.confirmedAt) {
    return (
      <CliAuthLayout>
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <span className="text-emerald-400 text-xl">✓</span>
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Already confirmed</h1>
          <p className="text-sm text-muted-foreground">
            This CLI session was already authorized. Check your terminal.
          </p>
        </div>
      </CliAuthLayout>
    )
  }

  // Check if user is logged in
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    // Not logged in — redirect to login with next param
    redirect(`/login?next=/cli-auth?session=${sessionId}`)
  }

  return (
    <CliAuthLayout>
      <CliAuthConfirm
        sessionId={sessionId}
        userName={session.user.name}
        userEmail={session.user.email}
      />
    </CliAuthLayout>
  )
}

function CliAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white text-sm font-bold">⚡</span>
        </div>
        <span className="font-display font-bold text-foreground">Invokix</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-card/50 p-8 shadow-2xl">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground/40 text-center">
        Only authorize CLI access from your own terminal.{" "}
        <Link href="/dashboard" className="text-primary hover:underline">
          Go to dashboard
        </Link>
      </p>
    </div>
  )
}

function CliAuthError({ message }: { message: string }) {
  return (
    <CliAuthLayout>
      <div className="text-center space-y-3">
        <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <span className="text-red-400 text-xl">✕</span>
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">Link invalid</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </CliAuthLayout>
  )
}