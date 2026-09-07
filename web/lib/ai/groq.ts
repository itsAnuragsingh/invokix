// lib/ai/groq.ts
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

/** Robustly extract the first valid JSON object from raw LLM output */
function extractJson(raw: string): string {
  // 1. Strip <think>...</think> reasoning blocks emitted by models
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()

  // 2. Strip common markdown fences
  cleaned = cleaned
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim()

  // 3. Find the first { and last } to slice out the JSON object
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")

  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in AI response")
  }

  return cleaned.slice(start, end + 1)
}

export async function generateSpecFromText(
  plainEnglish: string,
  existingSpec?: object
): Promise<string> {
  const systemPrompt = existingSpec
    ? `You are an OpenAPI 3.0 spec generator in EXTEND mode.
The user already has an existing API spec. Your job is to generate ONLY the new endpoints they describe.
Do NOT include any existing endpoints in your response.
Match the existing spec's naming conventions, auth patterns, and response shapes exactly.

Existing spec for context:
${JSON.stringify(existingSpec, null, 2)}

Rules:
- Respond with ONLY a valid OpenAPI 3.0 JSON spec — no explanation, no markdown, no code fences
- Only include the NEW endpoints the user describes
- Use the same auth scheme as the existing spec
- Use the same response envelope shape as existing endpoints
- Reuse existing schema names from components.schemas where appropriate
- Every schema field must have a realistic example value
- Number fields must have minimum: 0 unless negative values make sense
- String IDs must have format: uuid and a realistic example
- Enum fields must list all valid values`
    : `You are an OpenAPI 3.0 spec generator.
The user will describe an API in plain English.
You must respond with ONLY a valid OpenAPI 3.0 JSON spec — no explanation, no markdown, no code fences.

CRITICAL INSTRUCTIONS FOR COMPLETE ENDPOINT COVERAGE:
- You MUST generate an OpenAPI path entry for EVERY single endpoint listed or implied in the user prompt.
- Do NOT truncate, sample, or omit any endpoints. If the user lists 9 endpoints, your "paths" object MUST contain all 9 endpoints.
- Convert path parameters from Express ":id" syntax to OpenAPI "{id}" syntax (e.g. /events/:id -> /events/{id}).
- Define core entities in "components.schemas" (e.g. Event, Booking, Seat, User) and reference them using "$ref": "#/components/schemas/ModelName".
- Include all requested HTTP status codes (200, 201, 400, 401, 403, 409, 410, 500).
- Keep endpoint summaries and descriptions concise (max 1 sentence) so the specification stays complete and compact.

CRITICAL SCHEMA RULES:
- Every field in components.schemas must have a realistic "example" value
- All ID fields must use "type": "string", "format": "uuid", "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
- All date fields must use "type": "string", "format": "date-time", "example": "2024-03-15T10:30:00Z"
- Enum fields must list all valid values in an "enum" array
- securitySchemes must be placed inside components.securitySchemes`

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: plainEnglish },
    ],
    temperature: 0.1,
    max_tokens: 8000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("No response from AI")

  return extractJson(content)
}

export async function extractSpecFromCode(routeCode: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an OpenAPI 3.0 spec extractor.
The user will paste Express.js or Next.js route code.
Analyze the routes and respond with ONLY a valid OpenAPI 3.0 JSON spec — no explanation, no markdown, no code fences.
Infer request/response shapes from the code as best you can.
Every field must have a realistic example value and proper constraints (minimum: 0 for numbers, format: uuid for IDs).`,
      },
      { role: "user", content: routeCode },
    ],
    temperature: 0.2,
    max_tokens: 4000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("No response from AI")

  return extractJson(content)
}