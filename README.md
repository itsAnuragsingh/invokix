<div align="center">

# ⚡ Invokix
### **The API Contract Intelligence Platform**

**One contract. Every team. In sync.**  
Stop shipping surprises. Invokix is the living home for your API contracts, auto-generated typed clients, mock servers, and release context.

<br />

[![Live Platform](https://img.shields.io/badge/Platform-invokix.com-4431D9?style=for-the-badge&logo=google-chrome&logoColor=white)](https://invokix.com)
[![CLI](https://img.shields.io/badge/CLI-npx_invokix_pull-B7FF3C?style=for-the-badge&logo=terminal&logoColor=10100B)](https://invokix.com/docs)
[![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI-3.0_Compliant-6BA539?style=for-the-badge&logo=openapi-initiative&logoColor=white)](https://invokix.com)
[![TypeScript Ready](https://img.shields.io/badge/Codegen-Types%20%7C%20Zod%20%7C%20Hooks-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://invokix.com)

<br />

[Explore Platform](https://invokix.com) • [Documentation](https://invokix.com/docs) • [Get Started Free](https://invokix.com/register) • [CLI Reference](#-the-invokix-cli)

</div>

---

## 💡 What is Invokix?

In modern software development, **API drift is the #1 silent killer of velocity**. A backend engineer renames a response key or deprecates a parameter, and frontend builds crash hours later in production.

**Invokix turns your API contract into an active, intelligent governance layer.**  
From a natural-language description or imported route code, Invokix synthesizes production-ready OpenAPI 3.0 contracts, provides instant zero-latency mock endpoints, detects breaking changes before code ships, and pulls strongly typed SDKs directly into consumer repositories.

---

## ⚡ The Four-Stage Workflow

```
   01. COMPOSE                   02. MOCK                   03. PROTECT                   04. SYNC
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Plain English or │       │ Instant In-App   │       │ Semantic Diff &  │       │ npx invokix pull │
│ Route Code In    │ ───►  │ Live Mock Proxy  │ ───►  │ Blast-Radius Gate│ ───►  │ Types, Zod &     │
│ OpenAPI 3.0 Out  │       │ Zero Wait Time   │       │ Slack / Discord  │       │ React Hooks Out  │
└──────────────────┘       └──────────────────┘       └──────────────────┘       └──────────────────┘
```

### 1. Compose: Brief in. Contract out.
Describe your API in plain English or paste raw route handlers (Express, Next.js, Fastify). Invokix's AI engine synthesizes a comprehensive, standards-compliant OpenAPI 3.0 specification with typed models, status codes, and idempotency safeguards. Spec updates are always non-destructive and additive.

### 2. Mock: Frontend builds on Day Zero
No more waiting for backend PRs to merge. Every Invokix contract instantly provisions an in-process, zero-cold-start mock proxy:
```
https://invokix.com/api/mock-proxy/:contractId/v1/orders
```
Mock endpoints dynamically respond with context-aware, schema-conformant payloads tailored to your contract definitions.

### 3. Protect: No breaking surprises
Every revision passes through a deterministic AST semantic diff engine. Invokix scores contract health (0–100) and maps the exact blast radius of every change. If an endpoint or required field is modified, affected consumers receive instant signals across Slack, Discord, and Email before changes reach production.

### 4. Sync: Pull directly into your codebase
Keep client applications continuously in sync with the contract via the developer CLI.

---

## 💻 The Invokix CLI

Zero configuration. Authenticate once via your browser or CI token and sync all generated clients directly into your repository:

```bash
npx invokix pull
```

### What gets generated:
- **`api.types.ts`**: Pure, zero-overhead TypeScript type definitions.
- **`api.schemas.ts`**: Runtime Zod validation schemas for forms and API requests.
- **`api.hooks.ts`**: Fully typed React Query / TanStack Query hooks for instant data fetching.

```typescript
// Auto-generated and ready to use in your client app
import { useGetOrderById } from "@/lib/api/api.hooks"
import { OrderSchema } from "@/lib/api/api.schemas"

export function OrderDetails({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useGetOrderById(orderId)

  if (isLoading) return <div>Loading order...</div>
  return <h1>Order #{order.id}</h1>
}
```

---

## 🌟 Platform Capabilities

| Capability | What It Does | Benefit |
| :--- | :--- | :--- |
| **AI Contract Composer** | Generates OpenAPI 3.0 specs from natural language or backend route code | Eliminates blank-spec paralysis |
| **Dynamic Mock Server** | Live HTTP endpoints powered directly by your active schema | Unblocks frontend teams immediately |
| **Breaking-Change Gate** | Semantic AST diffing detecting deletions, type changes, and new required params | Prevents breaking changes from leaking |
| **Consumer Blast Radius** | Tracks which repositories and teams are pinned to which contract versions | Targeted, zero-noise notifications |
| **Automated SDK Codegen** | Generates TypeScript interfaces, Zod validators, and TanStack Query hooks | 100% type-safe client engineering |
| **Multi-Channel Alerts** | Real-time notifications via Slack, Discord, and Email (Resend) | Transparent release choreography |
| **Role-Based Access** | Multi-tenant workspaces with Owner, Editor, and Viewer permission tiers | Enterprise team governance |

---

## 🧩 Integration Ecosystem

Invokix seamlessly integrates into the modern development stack:

- **Frameworks:** Next.js, React, React Native, Vite, Remix, Angular, Vue
- **Backend Runtimes:** Express, Fastify, NestJS, Hono, Node.js, Python, Go
- **Specs & Formats:** OpenAPI 3.0, Swagger 2.0, Postman Collections, JSON Schema
- **Signals & Alerts:** Slack Webhooks, Discord Webhooks, Resend Email

---

## 🛡️ Enterprise Security & Privacy

- **Data Privacy:** Your API contracts and route schemas are never used to train public LLM models.
- **Tenant Isolation:** Rigorous multi-tenant authorization boundaries and workspace scoping.
- **Scoped Credentials:** Revocable, fine-grained CLI access tokens (`ik_live_...`) with automated expiration.
- **Audit Trails:** Immutable version histories detailing every change, author, and impact assessment.

---

## 📊 Plans & Availability

- **Free Plan:** 1 API Contract, 2 Teammates, 10 AI generations/mo. Perfect for side-projects and evaluation.
- **Pro Plan:** Unlimited Contracts, Breaking-Change Gate, Team Alerts & Consumer Map, Full CLI access.
- **Team Plan:** Unlimited Teammates, Role-Based Access Control, Custom Webhooks, Priority Support.

---

## 🌐 Get Started

Visit **[invokix.com](https://invokix.com)** to create your first API contract in seconds.

<div align="center">
  <br />
  <sub>© 2026 Invokix. One contract. Every team. In sync.</sub>
</div>
