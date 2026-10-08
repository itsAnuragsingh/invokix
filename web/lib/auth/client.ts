// lib/auth/client.ts
"use client"
import { createAuthClient } from "better-auth/react"
import { dodopaymentsClient } from "@dodopayments/better-auth/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [dodopaymentsClient()],
})

export const { signIn, signOut, signUp, useSession } = authClient