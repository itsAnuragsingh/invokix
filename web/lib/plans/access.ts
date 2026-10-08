// lib/plans/access.ts

/**
 * Client or server check.
 * If dynamic settings are passed, evaluates against them; otherwise falls back to environment variables.
 * This function has no database dependencies and is safe to use in Client Components.
 */
export function isBillingEnabledForUser(
  email?: string | null,
  settings?: { billingMode: "beta" | "all"; betaEmails: string[] }
): boolean {
  if (settings) {
    if (settings.billingMode === "all") return true
    if (!email) return false
    return (settings.betaEmails || [])
      .map((e) => e.toLowerCase().trim())
      .includes(email.toLowerCase().trim())
  }

  const mode = process.env.NEXT_PUBLIC_BILLING_ACCESS_MODE || "beta"
  if (mode === "all") return true
  if (!email) return false

  const rawList = process.env.NEXT_PUBLIC_BILLING_BETA_EMAILS || ""
  const allowed = rawList
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  return allowed.includes(email.toLowerCase().trim())
}
