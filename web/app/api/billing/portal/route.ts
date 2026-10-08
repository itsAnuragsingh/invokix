import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { DodoPayments } from "dodopayments"

const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment: "test_mode",
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Check subscriptions table for customerId
    const sub = await db.query.subscriptions.findFirst({
      where: eq(schema.subscriptions.userId, session.user.id),
    })

    let customerId = sub?.dodoCustomerId

    // 2. Fallback to users table
    if (!customerId) {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, session.user.id),
      })
      customerId = user?.dodoCustomerId || null
    }

    // 3. Fallback: Lookup by email in Dodo
    if (!customerId && session.user.email) {
      try {
        const customers = await dodoPayments.customers.list({
          email: session.user.email,
        })
        if (customers.items && customers.items.length > 0) {
          customerId = customers.items[0].customer_id
          // Save customerId for future calls
          await db
            .update(schema.users)
            .set({ dodoCustomerId: customerId })
            .where(eq(schema.users.id, session.user.id))
        }
      } catch (err) {
        console.error("[dodo-portal] Customer search failed:", err)
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "No active subscription customer found." },
        { status: 404 }
      )
    }

    // Generate secure self-service portal session
    const customerSession = await dodoPayments.customers.customerPortal.create(customerId)

    return NextResponse.json({ url: customerSession.link })
  } catch (err: any) {
    console.error("[dodo-portal-error]", err)
    return NextResponse.json(
      { error: err?.message || "Failed to create billing portal session" },
      { status: 500 }
    )
  }
}
