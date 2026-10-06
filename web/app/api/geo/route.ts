// app/api/geo/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const headers = request.headers
  const country = (
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    headers.get("x-country") ||
    ""
  ).toUpperCase()

  const isIndia = country === "IN"

  return NextResponse.json(
    {
      country,
      isIndia,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  )
}
