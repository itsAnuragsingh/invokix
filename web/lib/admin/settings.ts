// lib/admin/settings.ts
import { db } from "@/lib/db"
import { platformSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export type PlatformSettings = {
  billingMode: "beta" | "all"
  betaEmails: string[]
  adminEmails: string[]
}

const envBetaEmails = process.env.NEXT_PUBLIC_BILLING_BETA_EMAILS
  ? process.env.NEXT_PUBLIC_BILLING_BETA_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
  : ["itsanurag707@gmail.com", "2004shrutigupta@gmail.com"]

const envBillingMode = (process.env.NEXT_PUBLIC_BILLING_ACCESS_MODE === "all" ? "all" : "beta") as "beta" | "all"

const envAdminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
  : ["itsanurag707@gmail.com"]

const DEFAULT_SETTINGS: PlatformSettings = {
  billingMode: envBillingMode,
  betaEmails: envBetaEmails,
  adminEmails: envAdminEmails,
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const rows = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.id, "default"))
      .limit(1)

    const existing = rows[0]

    if (existing) {
      return {
        billingMode: (existing.billingMode as "beta" | "all") || DEFAULT_SETTINGS.billingMode,
        betaEmails: existing.betaEmails?.length ? existing.betaEmails : DEFAULT_SETTINGS.betaEmails,
        adminEmails: existing.adminEmails?.length ? existing.adminEmails : DEFAULT_SETTINGS.adminEmails,
      }
    }

    // Initialize default row
    await db.insert(platformSettings).values({
      id: "default",
      billingMode: DEFAULT_SETTINGS.billingMode,
      betaEmails: DEFAULT_SETTINGS.betaEmails,
      adminEmails: DEFAULT_SETTINGS.adminEmails,
    }).catch(() => {})

    return DEFAULT_SETTINGS
  } catch (err) {
    // Fallback if table not pushed yet
    return DEFAULT_SETTINGS
  }
}

export async function updatePlatformSettings(
  updates: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  const current = await getPlatformSettings()
  const next: PlatformSettings = {
    billingMode: updates.billingMode ?? current.billingMode,
    betaEmails: updates.betaEmails ?? current.betaEmails,
    adminEmails: updates.adminEmails ?? current.adminEmails,
  }

  try {
    const rows = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.id, "default"))
      .limit(1)

    if (rows.length > 0) {
      await db
        .update(platformSettings)
        .set({
          billingMode: next.billingMode,
          betaEmails: next.betaEmails,
          adminEmails: next.adminEmails,
          updatedAt: new Date(),
        })
        .where(eq(platformSettings.id, "default"))
    } else {
      await db.insert(platformSettings).values({
        id: "default",
        billingMode: next.billingMode,
        betaEmails: next.betaEmails,
        adminEmails: next.adminEmails,
      })
    }
  } catch (err) {
    console.error("[settings-update-error]", err)
  }

  return next
}
