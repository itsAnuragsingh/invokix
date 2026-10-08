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

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Get customerId from subscriptions or users table
    const sub = await db.query.subscriptions.findFirst({
      where: eq(schema.subscriptions.userId, session.user.id),
    })

    let customerId = sub?.dodoCustomerId

    if (!customerId) {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, session.user.id),
      })
      customerId = user?.dodoCustomerId || null
    }

    if (!customerId && session.user.email) {
      try {
        const customers = await dodoPayments.customers.list({
          email: session.user.email,
        })
        if (customers.items && customers.items.length > 0) {
          customerId = customers.items[0].customer_id
        }
      } catch (err) {
        console.error("[dodo-invoices] Customer lookup error:", err)
      }
    }

    if (!customerId) {
      return NextResponse.json({ invoices: [] })
    }

    // 2. Fetch payments from Dodo for this customer
    const paymentsList = await dodoPayments.payments.list({
      customer_id: customerId,
    })

    const invoices = (paymentsList.items || []).map((p: any) => ({
      id: p.payment_id,
      amount: p.total_amount ? (p.total_amount / 100).toFixed(2) : "0.00",
      currency: p.currency || "USD",
      status: (p.status || "unknown").toLowerCase(),
      created_at: p.created_at,
    }))

    return NextResponse.json({ invoices })
  } catch (err: any) {
    console.error("[dodo-invoices-list-error]", err)
    return NextResponse.json(
      { error: err?.message || "Failed to fetch invoices" },
      { status: 500 }
    )
  }
}
