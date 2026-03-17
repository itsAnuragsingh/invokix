// proxy.ts
import { betterFetch } from "@better-fetch/fetch"
import type { Session } from "@/lib/auth/server"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: { cookie: request.headers.get("cookie") ?? "" },
  })

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}