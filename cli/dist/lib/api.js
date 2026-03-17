// src/lib/api.ts
// const BASE_URL = process.env.INVOKIX_API_URL ?? "https://invokix.com"
const BASE_URL = "http://localhost:3000";
async function request(path, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
        const json = await res.json();
        return json;
    }
    catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Network error",
            code: "NETWORK_ERROR",
        };
    }
}
function authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
}
// ── Auth ──────────────────────────────────────────────────────────────────────
export async function startBrowserAuth() {
    return request("/api/cli/auth/start", { method: "POST" });
}
export async function pollBrowserAuth(sessionId) {
    return request(`/api/cli/auth/poll?session=${sessionId}`);
}
export async function verifyApiKey(token) {
    return request("/api/cli/auth/verify", {
        method: "POST",
        body: JSON.stringify({ token }),
    });
}
export async function fetchProjects(token) {
    return request("/api/cli/projects", {
        headers: authHeaders(token),
    });
}
export async function pullContract(token, projectId, outputs) {
    return request("/api/cli/pull", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ projectId, outputs }),
    });
}
//# sourceMappingURL=api.js.map