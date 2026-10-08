import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/lib/admin/auth"
import { getPlatformSettings } from "@/lib/admin/settings"
import { db } from "@/lib/db"
import { users, projects, contracts, subscriptions } from "@/lib/db/schema"
import { sql, eq, desc } from "drizzle-orm"
import { AdminView } from "@/components/dashboard/AdminView"

export default async function AdminPage() {
  const session = await requireSession()
  if (!session?.user?.email || !(await checkIsAdmin(session.user.email))) {
    redirect("/dashboard")
  }

  // 1. Fetch system metrics
  const [usersCountRes, projectsCountRes, contractsCountRes, proCountRes] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(users),
    db.select({ count: sql<number>`count(*)::int` }).from(projects),
    db.select({ count: sql<number>`count(*)::int` }).from(contracts),
    db.select({ count: sql<number>`count(DISTINCT ${subscriptions.userId})::int` }).from(subscriptions).where(eq(subscriptions.plan, "pro")),
  ])

  // 2. Fetch users list
  const userList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      dodoCustomerId: users.dodoCustomerId,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(50)

  // 3. Map user plans
  const userSubs = await db.select().from(subscriptions)
  const subMap = new Map(userSubs.map((s) => [s.userId, s.plan]))

  const usersWithPlans = userList.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    plan: subMap.get(u.id) || "free",
    createdAt: u.createdAt ? u.createdAt.toISOString() : "",
    dodoCustomerId: u.dodoCustomerId,
  }))

  const settings = await getPlatformSettings()

  return (
    <AdminView
      stats={{
        totalUsers: usersCountRes[0]?.count ?? 0,
        totalProjects: projectsCountRes[0]?.count ?? 0,
        totalContracts: contractsCountRes[0]?.count ?? 0,
        proSubscribers: proCountRes[0]?.count ?? 0,
      }}
      users={usersWithPlans}
      initialSettings={settings}
    />
  )
}
