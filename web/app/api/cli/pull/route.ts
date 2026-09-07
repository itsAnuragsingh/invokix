// app/api/cli/pull/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyCliToken } from "@/lib/db/queries/cli"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { getProjectById } from "@/lib/db/queries/projects"
import { logConsumer } from "@/lib/db/queries/consumers"
import { generateTypes } from "@/lib/codegen/types"
import { generateHooks, generateNativeHooks } from "@/lib/codegen/hooks"
import { generateZodSchemas } from "@/lib/codegen/zod"
import type { OpenAPIV3 } from "openapi-types"

export async function POST(req: NextRequest) {
  try {
    // Auth via Bearer token
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ik_live_")) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid authorization header", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const cliToken = await verifyCliToken(token)
    if (!cliToken) {
      return NextResponse.json(
        { success: false, error: "Invalid or revoked API key", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { projectId, outputs = ["types", "hooks", "schemas"] } = body as {
      projectId: string
      outputs: string[]
    }

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Missing projectId", code: "MISSING_PROJECT_ID" },
        { status: 400 }
      )
    }

    // Verify user has access to this project
    const project = await getProjectById(projectId, cliToken.userId)
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found or access denied", code: "NOT_FOUND" },
        { status: 404 }
      )
    }

    // Get contract & latest published version
    const contract = await getContractByProjectId(projectId)
    if (!contract) {
      return NextResponse.json(
        { success: false, error: "No contract found for this project. Import or generate a contract first.", code: "NO_CONTRACT" },
        { status: 404 }
      )
    }

    const { getVersionsByContractId } = await import("@/lib/db/queries/versions")
    const versions = await getVersionsByContractId(contract.id)
    const latestPublished = versions[0]

    const spec = (latestPublished?.openApiSpec ?? contract.openApiSpec) as OpenAPIV3.Document
    const currentVersion = latestPublished?.version ?? contract.version

    const files: Record<string, string> = {}

    // Generate requested outputs
    if (outputs.includes("types")) {
      files["types"] = await generateTypes(spec)
    }
    if (outputs.includes("hooks")) {
      files["hooks"] = generateHooks(spec)
    }
    if (outputs.includes("schemas")) {
      files["schemas"] = generateZodSchemas(spec)
    }
    if (outputs.includes("hooks-native")) {
      files["hooks-native"] = generateNativeHooks(spec)
    }

    // Log consumer pull (upserting unique consumer state)
    await logConsumer(contract.id, currentVersion, "cli", cliToken.userId)

    return NextResponse.json({
      success: true,
      data: {
        version: currentVersion,
        contractId: contract.id,
        projectName: project.name,
        files,
      },
    })
  } catch (err) {
    console.error("[cli/pull]", err)
    return NextResponse.json(
      { success: false, error: "Something went wrong", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}