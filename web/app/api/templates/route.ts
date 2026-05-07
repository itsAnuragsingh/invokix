// app/api/templates/route.ts
import { NextResponse } from "next/server"
import { getPublicTemplates } from "@/lib/db/queries/templates"

export async function GET() {
  try {
    const data = await getPublicTemplates()
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("[templates GET]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}