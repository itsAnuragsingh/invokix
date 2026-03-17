// lib/auth/session.ts
import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return null

  return session
}