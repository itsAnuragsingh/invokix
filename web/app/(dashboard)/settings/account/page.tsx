// app/(dashboard)/settings/account/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AccountSettingsPage() {
  const session = await requireSession()
  if (!session) redirect("/login")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and connected services.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm"><span className="text-muted-foreground">Name:</span> {session.user.name}</p>
          <p className="text-sm"><span className="text-muted-foreground">Email:</span> {session.user.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Sign in with either method anytime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email / Password</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <Badge variant="outline" className="text-green-600">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}