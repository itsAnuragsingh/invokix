// app/api/mock-proxy/[contractId]/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getContractByProjectId, getContractById } from "@/lib/db/queries/contracts"
import { generateMockResponse } from "@/lib/codegen/mock"
import type { OpenAPIV3 } from "openapi-types"

type Params = { contractId: string; path: string[] }

async function handler(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { contractId, path } = await params

  // 1. Load contract from DB (checks both project ID and contract ID)
  const contract =
    (await getContractByProjectId(contractId)) ??
    (await getContractById(contractId))
  if (!contract) {
    return NextResponse.json(
      { error: "Mock not found", code: "MOCK_NOT_FOUND" },
      { status: 404 }
    )
  }

  if (!contract.openApiSpec) {
    return NextResponse.json(
      { error: "Contract has no spec yet", code: "NO_SPEC" },
      { status: 400 }
    )
  }

  // 2. Build request path
  const requestPath = "/" + path.join("/")
  const method = req.method.toUpperCase()

  // 3. Generate mock response in-process — no Prism, no child processes
  const mock = generateMockResponse(
    contract.openApiSpec as OpenAPIV3.Document,
    method,
    requestPath
  )

  // 4. Return response
  if (mock.body === null) {
    return new NextResponse(null, {
      status: mock.status,
      headers: corsHeaders(),
    })
  }

  return NextResponse.json(mock.body, {
    status: mock.status,
    headers: corsHeaders(),
  })
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler