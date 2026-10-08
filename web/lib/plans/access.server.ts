// lib/plans/access.server.ts
import { getPlatformSettings } from "@/lib/admin/settings"

/**
 * Server-side check for whether the given user has access to initiate checkout / upgrade.
 * Respects real-time database settings configured by the admin in the dashboard.
 */
export async function checkBillingAccess(email?: string | null): Promise<boolean> {
  if (!email) return false
  const settings = await getPlatformSettings()
  if (settings.billingMode === "all") return true
  const betaEmails = (settings.betaEmails || []).map((e) => e.toLowerCase().trim())
  return betaEmails.includes(email.toLowerCase().trim())
}
