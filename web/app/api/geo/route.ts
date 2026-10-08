// app/api/geo/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const override = (searchParams.get("country") || searchParams.get("geo") || "").toUpperCase()
  if (override) {
    return NextResponse.json(
      {
        country: override,
        isIndia: override === "IN",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    )
  }

  const headers = request.headers
  let country = (
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    headers.get("x-country") ||
    ""
  ).toUpperCase()

  // If running locally or header is missing, detect via public IP lookup
  if (!country || country === "XX") {
    try {
      const res = await fetch("https://api.country.is/", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        country = (data?.country || "").toUpperCase()
      }
    } catch {
      // fallback
    }
  }

  const isIndia = country === "IN"

  return NextResponse.json(
    {
      country,
      isIndia,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    }
  )
}
