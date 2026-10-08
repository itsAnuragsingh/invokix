// app/api/checkout/route.ts
// Custom checkout removed — Better Auth Dodo Payments plugin handles checkout natively under /api/auth/*
import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { message: "Custom checkout removed. Handled directly via Better Auth Dodo plugin." },
    { status: 410 }
  )
}
