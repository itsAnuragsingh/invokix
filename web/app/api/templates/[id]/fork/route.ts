// app/api/templates/[id]/fork/route.ts
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { forkTemplateIntoProject } from "@/lib/db/queries/templates"
import { getProjectById } from "@/lib/db/queries/projects"
import { z } from "zod"

const BodySchema = z.object({
  projectId: z.string().min(1),
})

type Props = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const { id: templateId } = await params
    const body = await req.json()
    const parsed = BodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body", code: "INVALID_BODY" },
        { status: 400 }
      )
    }

    // Verify user has access to the project
    const project = await getProjectById(parsed.data.projectId, session.user.id)
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found", code: "NOT_FOUND" },
        { status: 404 }
      )
    }

    const contractId = await forkTemplateIntoProject(templateId, parsed.data.projectId)

    return NextResponse.json({
      success: true,
      data: {
        contractId,
        projectId: parsed.data.projectId,
      },
    })
  } catch (err) {
    console.error("[templates fork POST]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}