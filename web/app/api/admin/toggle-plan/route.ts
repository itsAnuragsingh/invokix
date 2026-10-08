import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { checkIsAdmin } from "@/lib/admin/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.email || !(await checkIsAdmin(session.user.email))) {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 })
    }

    const { targetUserId, plan } = await req.json()

    if (!targetUserId || !["free", "pro"].includes(plan)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const existingSub = await db.query.subscriptions.findFirst({
      where: eq(schema.subscriptions.userId, targetUserId),
    })

    if (existingSub) {
      await db
        .update(schema.subscriptions)
        .set({ plan: plan as "free" | "pro" })
        .where(eq(schema.subscriptions.id, existingSub.id))
    } else {
      await db.insert(schema.subscriptions).values({
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: targetUserId,
        plan: plan as "free" | "pro",
      })
    }

    return NextResponse.json({ success: true, plan })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 })
  }
}
