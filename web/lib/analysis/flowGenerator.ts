// lib/analysis/flowGenerator.ts

export type FlowField = {
  name: string
  type: string
  required?: boolean
  description?: string
}

export type FlowStep = {
  id: string
  number: number
  title: string
  method: string
  path: string
  summary: string
  description: string
  input: FlowField[]
  output: FlowField[]
  color: string
  mockOutput: Record<string, any>
  latency: number
}

export type GeneratedFlow = {
  steps: FlowStep[]
  connectors: string[]
  hasDynamicContract: boolean
  contractTitle?: string
}

const PALETTE = [
  "#AE8CFF", // Purple (Trigger/Auth)
  "#5C9DFF", // Blue (Items/Fetch)
  "#FFD15C", // Amber (Process/Checkout)
  "#F15A3C", // Red/Orange (Authorize/Gateway)
  "#B7FF3C", // Lime (Order/Success)
  "#00F0FF", // Cyan (Webhook/Sync)
  "#E06C75", // Rose
]

export function generateFlowFromOpenApi(spec: object | null): GeneratedFlow {
  if (!spec || typeof spec !== "object") {
    return {
      steps: DEFAULT_STEPS,
      connectors: DEFAULT_CONNECTORS,
      hasDynamicContract: false,
    }
  }

  const s = spec as {
    info?: { title?: string; description?: string }
    paths?: Record<string, Record<string, any>>
    components?: { schemas?: Record<string, any> }
  }

  const paths = s.paths ?? {}
  const rawEndpoints: Array<{
    method: string
    path: string
    detail: any
  }> = []

  const validMethods = ["post", "get", "put", "patch", "delete"]

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, detail] of Object.entries(methods)) {
      if (validMethods.includes(method.toLowerCase())) {
        rawEndpoints.push({
          method: method.toUpperCase(),
          path,
          detail,
        })
      }
    }
  }

  if (rawEndpoints.length === 0) {
    return {
      steps: DEFAULT_STEPS,
      connectors: DEFAULT_CONNECTORS,
      hasDynamicContract: false,
    }
  }

  // Sort endpoints logically for a workflow:
  // 1. POST/Auth or creation endpoints first
  // 2. Collection or action endpoints
  // 3. Nested/item sub-paths
  // 4. Verification/finalize/delete last
  const sortedEndpoints = [...rawEndpoints].sort((a, b) => {
    const aPath = a.path.toLowerCase()
    const bPath = b.path.toLowerCase()

    const getScore = (e: { method: string; path: string }) => {
      let score = 50
      const p = e.path.toLowerCase()
      if (p.includes("auth") || p.includes("login") || p.includes("register") || p.includes("cart") || p.includes("session")) {
        score -= 40
      }
      if (e.method === "POST" && !p.includes("{")) {
        score -= 20
      }
      if (p.includes("{")) {
        score += 15
      }
      if (p.includes("checkout") || p.includes("pay") || p.includes("confirm")) {
        score += 25
      }
      if (p.includes("order") || p.includes("complete") || p.includes("fulfill") || p.includes("receipt")) {
        score += 40
      }
      return score
    }

    return getScore(a) - getScore(b)
  })

  // Select up to 5-6 key steps for a clean, readable workflow
  const selected = sortedEndpoints.slice(0, 5)

  const steps: FlowStep[] = selected.map((ep, idx) => {
    const detail = ep.detail
    const color = PALETTE[idx % PALETTE.length]

    // Extract inputs from parameters and requestBody
    const input: FlowField[] = []
    if (Array.isArray(detail.parameters)) {
      for (const p of detail.parameters) {
        if (p?.name) {
          input.push({
            name: p.name,
            type: p.schema?.type ?? (p.in === "path" ? "string" : "any"),
            required: Boolean(p.required),
            description: p.description,
          })
        }
      }
    }

    // Check request body
    const bodySchema =
      detail.requestBody?.content?.["application/json"]?.schema ??
      detail.requestBody?.content?.["*/*"]?.schema

    if (bodySchema?.properties) {
      const requiredList = Array.isArray(bodySchema.required) ? bodySchema.required : []
      for (const [propName, propDef] of Object.entries(bodySchema.properties as Record<string, any>)) {
        input.push({
          name: propName,
          type: propDef?.type ?? "string",
          required: requiredList.includes(propName),
          description: propDef?.description,
        })
      }
    }

    // Extract outputs from 200/201 response schema
    const output: FlowField[] = []
    const successResponse = detail.responses?.["200"] ?? detail.responses?.["201"] ?? detail.responses?.["default"]
    const responseSchema =
      successResponse?.content?.["application/json"]?.schema ??
      successResponse?.content?.["*/*"]?.schema

    if (responseSchema?.properties) {
      for (const [propName, propDef] of Object.entries(responseSchema.properties as Record<string, any>)) {
        output.push({
          name: propName,
          type: propDef?.type ?? "string",
          description: propDef?.description,
        })
      }
    }

    // If no output properties explicitly defined, infer meaningful return identifier
    if (output.length === 0) {
      const lastSegment = ep.path.split("/").filter(Boolean).pop()?.replace(/[{}]/g, "") ?? "id"
      output.push({
        name: `${lastSegment}Id`,
        type: "string",
        description: `Identifier generated by ${ep.method} ${ep.path}`,
      })
      output.push({
        name: "status",
        type: "string",
        description: "Execution status",
      })
    }

    // Build realistic mock output
    const mockOutput: Record<string, any> = {}
    for (const out of output) {
      if (out.type === "number" || out.type === "integer") {
        mockOutput[out.name] = out.name.toLowerCase().includes("count") ? 2 : 129.5
      } else if (out.type === "boolean") {
        mockOutput[out.name] = true
      } else if (out.name.toLowerCase().includes("id")) {
        mockOutput[out.name] = `${out.name}_${Math.random().toString(36).substring(2, 9)}`
      } else if (out.name.toLowerCase().includes("status")) {
        mockOutput[out.name] = "success"
      } else {
        mockOutput[out.name] = `${out.name}_val`
      }
    }

    // Generate clean human-readable title
    let title = detail.summary?.trim()
    if (!title && detail.operationId) {
      title = detail.operationId
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .trim()
    }
    if (!title) {
      const seg = ep.path.split("/").filter(Boolean).pop() ?? "endpoint"
      title = `${ep.method} ${seg}`
    }

    // Capitalize title
    title = title.charAt(0).toUpperCase() + title.slice(1)

    const summary =
      detail.summary ?? detail.description ?? `Executes ${ep.method} on ${ep.path} within the active contract.`

    return {
      id: `step_${idx + 1}_${ep.method.toLowerCase()}`,
      number: idx + 1,
      title,
      method: ep.method,
      path: ep.path,
      summary,
      description: detail.description ?? summary,
      input,
      output,
      color,
      mockOutput,
      latency: 35 + Math.floor(Math.random() * 65),
    }
  })

  // Generate dynamic connector labels based on parameter flow
  const connectors: string[] = []
  for (let i = 0; i < steps.length - 1; i++) {
    const currentStep = steps[i]
    const nextStep = steps[i + 1]

    // Check if next step requires any field produced by current step
    const match = currentStep.output.find((out) =>
      nextStep.input.some((inp) => inp.name.toLowerCase() === out.name.toLowerCase())
    )

    if (match) {
      connectors.push(match.name)
    } else if (currentStep.output.length > 0) {
      connectors.push(currentStep.output[0].name)
    } else {
      connectors.push("status: 200")
    }
  }

  return {
    steps,
    connectors,
    hasDynamicContract: true,
    contractTitle: s.info?.title,
  }
}

// Default Fallback Steps if no contract exists
const DEFAULT_STEPS: FlowStep[] = [
  {
    id: "cart",
    number: 1,
    title: "Create cart",
    method: "POST",
    path: "/carts",
    summary: "Initialize a shopper session and open cart.",
    description: "Creates an empty shopping cart entity in the database and returns a scoped session cartId.",
    input: [],
    output: [{ name: "cartId", type: "string" }],
    color: "#AE8CFF",
    mockOutput: { cartId: "cart_902bf41a", status: "open", currency: "USD" },
    latency: 38,
  },
  {
    id: "items",
    number: 2,
    title: "Add cart items",
    method: "POST",
    path: "/carts/{cartId}/items",
    summary: "Attach line items and compute subtotal.",
    description: "Validates product stock, calculates quantity totals, applies taxes, and updates the active cart.",
    input: [
      { name: "cartId", type: "string", required: true },
      { name: "quantity", type: "integer", required: true },
    ],
    output: [{ name: "cartTotal", type: "number" }],
    color: "#5C9DFF",
    mockOutput: { cartId: "cart_902bf41a", cartTotal: 129.5, itemCount: 2 },
    latency: 48,
  },
  {
    id: "checkout",
    number: 3,
    title: "Create checkout",
    method: "POST",
    path: "/checkout",
    summary: "Lock price total and prepare payment session.",
    description: "Freezes cart pricing against inventory shifts and yields payment intents for the gateway.",
    input: [
      { name: "cartId", type: "string", required: true },
      { name: "couponCode", type: "string", required: false },
    ],
    output: [
      { name: "checkoutId", type: "string" },
      { name: "paymentId", type: "string" },
    ],
    color: "#FFD15C",
    mockOutput: {
      checkoutId: "chk_7721e0a",
      paymentId: "pi_3391ba90",
      amountDue: 129.5,
    },
    latency: 64,
  },
  {
    id: "payment",
    number: 4,
    title: "Process payment",
    method: "POST",
    path: "/payments",
    summary: "Authorize transaction via payment gateway.",
    description: "Charges the specified payment instrument and verifies 3D-Secure or bank authorization.",
    input: [
      { name: "paymentId", type: "string", required: true },
      { name: "amount", type: "number", required: true },
    ],
    output: [{ name: "status", type: "string" }],
    color: "#F15A3C",
    mockOutput: {
      paymentId: "pi_3391ba90",
      status: "paid",
      authorized: true,
      transactionId: "txn_55019",
    },
    latency: 120,
  },
  {
    id: "order",
    number: 5,
    title: "Create order",
    method: "POST",
    path: "/orders",
    summary: "Persist the paid purchase and fulfill delivery.",
    description: "Emits order receipt, marks invoice paid, and routes fulfillment payload to inventory services.",
    input: [
      { name: "checkoutId", type: "string", required: true },
      { name: "paymentId", type: "string", required: true },
    ],
    output: [{ name: "orderId", type: "string" }],
    color: "#B7FF3C",
    mockOutput: {
      orderId: "ord_884910",
      checkoutId: "chk_7721e0a",
      status: "fulfilled",
      trackingNumber: "TRK-29401",
    },
    latency: 82,
  },
]

const DEFAULT_CONNECTORS = ["cartId", "cartTotal", "paymentId", "paid"]
