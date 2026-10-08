// lib/admin/auth.ts
import { getPlatformSettings } from "./settings"

export const DEFAULT_ADMINS = [
  "itsanurag707@gmail.com",
]

export async function checkIsAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false
  const settings = await getPlatformSettings()
  const allAdmins = Array.from(new Set([...DEFAULT_ADMINS, ...(settings.adminEmails || [])]))
  return allAdmins.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}

export function isAdmin(email?: string | null): boolean {
  if (!email) return false
  const envAdmins = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : []
  const all = [...DEFAULT_ADMINS, ...envAdmins]
  return all.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}
