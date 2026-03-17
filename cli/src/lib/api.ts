// src/lib/api.ts

// const BASE_URL = process.env.INVOKIX_API_URL ?? "https://invokix.com"

const BASE_URL = "http://localhost:3000"

type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  code: string
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    const json = await res.json() as ApiResponse<T>
    return json
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
      code: "NETWORK_ERROR",
    }
  }
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function startBrowserAuth() {
  return request<{ sessionId: string; confirmUrl: string; expiresAt: string }>(
    "/api/cli/auth/start",
    { method: "POST" }
  )
}

export async function pollBrowserAuth(sessionId: string) {
  return request<{ confirmed: boolean; token?: string }>(
    `/api/cli/auth/poll?session=${sessionId}`
  )
}

export async function verifyApiKey(token: string) {
  return request<{ userId: string; name: string; email: string }>(
    "/api/cli/auth/verify",
    {
      method: "POST",
      body: JSON.stringify({ token }),
    }
  )
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type Project = {
  id: string
  name: string
  description: string | null
  stack: string
}

export async function fetchProjects(token: string) {
  return request<Project[]>("/api/cli/projects", {
    headers: authHeaders(token),
  })
}

// ── Pull ──────────────────────────────────────────────────────────────────────

export type PullResult = {
  version: string
  contractId: string
  projectName: string
  files: Record<string, string>
}

export async function pullContract(
  token: string,
  projectId: string,
  outputs: string[]
) {
  return request<PullResult>("/api/cli/pull", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ projectId, outputs }),
  })
}