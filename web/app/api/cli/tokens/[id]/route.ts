// app/api/cli/tokens/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { deleteCliToken } from "@/lib/db/queries/cli"

type Props = {
  params: Promise<{ id: string }>
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const { id } = await params
    await deleteCliToken(id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[cli/tokens DELETE]", err)
    return NextResponse.json({ success: false, error: "Something went wrong", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}