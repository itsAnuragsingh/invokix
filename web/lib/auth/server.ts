// lib/auth/server.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"
import { sendWelcomeEmail } from "@/lib/notify/email"
import { DodoPayments } from "dodopayments"
import { dodopayments, checkout, portal, webhooks } from "@dodopayments/better-auth"
import { eq } from "drizzle-orm"

const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment: "test_mode",
})

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  plugins: [
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.DODO_PRODUCT_ID || "pdt_0NpI8TmURTMmwQ5CeFR8U",
              slug: "pro",
            },
          ],
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/upgrade?success=true`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "",
          onPayload: async (payload: any) => {
            try {
              const eventType = payload?.type || payload?.event_type || ""
              const data = payload?.data || {}

              if (
                eventType === "subscription.active" ||
                eventType === "subscription.renewed" ||
                eventType === "payment.succeeded"
              ) {
                const customerId = data?.customer?.customer_id || data?.customer_id
                const subscriptionId = data?.subscription_id
                const userEmail = data?.customer?.email

                let targetUserId: string | null = null

                if (customerId) {
                  const user = await db.query.users.findFirst({
                    where: eq(schema.users.dodoCustomerId, customerId),
                  })
                  if (user) targetUserId = user.id
                }

                if (!targetUserId && userEmail) {
                  const user = await db.query.users.findFirst({
                    where: eq(schema.users.email, userEmail),
                  })
                  if (user) {
                    targetUserId = user.id
                    if (customerId) {
                      await db
                        .update(schema.users)
                        .set({ dodoCustomerId: customerId })
                        .where(eq(schema.users.id, user.id))
                    }
                  }
                }

                if (targetUserId) {
                  const existingSub = await db.query.subscriptions.findFirst({
                    where: eq(schema.subscriptions.userId, targetUserId),
                  })

                  const nextBilling = data?.next_billing_date ? new Date(data.next_billing_date) : null

                  if (existingSub) {
                    await db
                      .update(schema.subscriptions)
                      .set({
                        plan: "pro",
                        dodoCustomerId: customerId || existingSub.dodoCustomerId,
                        dodoSubscriptionId: subscriptionId || existingSub.dodoSubscriptionId,
                        expiresAt: nextBilling || existingSub.expiresAt,
                      })
                      .where(eq(schema.subscriptions.id, existingSub.id))
                  } else {
                    await db.insert(schema.subscriptions).values({
                      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                      userId: targetUserId,
                      plan: "pro",
                      dodoCustomerId: customerId,
                      dodoSubscriptionId: subscriptionId,
                      expiresAt: nextBilling,
                    })
                  }
                }
              } else if (
                eventType === "subscription.cancelled" ||
                eventType === "subscription.expired"
              ) {
                const subscriptionId = data?.subscription_id
                if (subscriptionId) {
                  await db
                    .update(schema.subscriptions)
                    .set({ plan: "free" })
                    .where(eq(schema.subscriptions.dodoSubscriptionId, subscriptionId))
                }
              }
            } catch (err) {
              console.error("[dodo-webhook] Error processing webhook:", err)
            }
          },
        }),
      ],
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (user.email) {
              await sendWelcomeEmail({
                to: user.email,
                name: user.name,
              })
            }
          } catch (err) {
            console.error("[welcome-email] Failed to send welcome email:", err)
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
    google: {
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
})

export type Session = typeof auth.$Infer.Session