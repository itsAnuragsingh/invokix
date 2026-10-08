import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { checkIsAdmin } from "@/lib/admin/auth"
import { getPlatformSettings, updatePlatformSettings } from "@/lib/admin/settings"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.email || !(await checkIsAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const settings = await getPlatformSettings()
    return NextResponse.json(settings)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.email || !(await checkIsAdmin(session.user.email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const updated = await updatePlatformSettings(body)

    return NextResponse.json({ success: true, settings: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update settings" }, { status: 500 })
  }
}
