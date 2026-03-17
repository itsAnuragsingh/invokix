// lib/ai/groq.ts
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

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

Always include:
- info.title and info.version
- At least one path with proper HTTP methods
- components.schemas for all data models
- Proper response schemas with 200, 401, 500 responses
- Request body schemas for POST/PUT/PATCH endpoints

CRITICAL — every schema field must follow these rules:
- Every field must have an "example" with a realistic value
  Good: "price": { "type": "number", "minimum": 0, "example": 29.99 }
  Bad:  "price": { "type": "number" }
- All number fields representing counts, prices, quantities, ages, scores must have "minimum": 0
- All ID fields must use "type": "string", "format": "uuid", "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
- All date fields must use "type": "string", "format": "date-time", "example": "2024-03-15T10:30:00Z"
- All email fields must use "format": "email", "example": "user@example.com"
- All name fields must have "minLength": 1, "example": "John Doe"
- Enum fields must list all valid values in "enum" array
- Array fields must have "minItems": 0 and items schema with examples
- securitySchemes must always be inside components, never at the root level
- Status fields must use enum with realistic values like ["pending", "active", "completed"]

Example of a well-formed schema:
"Order": {
  "type": "object",
  "required": ["id", "userId", "status", "total"],
  "properties": {
    "id": { "type": "string", "format": "uuid", "example": "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
    "userId": { "type": "string", "format": "uuid", "example": "550e8400-e29b-41d4-a716-446655440000" },
    "status": { "type": "string", "enum": ["pending", "shipped", "delivered", "cancelled"], "example": "pending" },
    "total": { "type": "number", "minimum": 0, "example": 49.99 },
    "quantity": { "type": "integer", "minimum": 1, "maximum": 100, "example": 2 },
    "createdAt": { "type": "string", "format": "date-time", "example": "2024-03-15T10:30:00Z" }
  }
}`

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: plainEnglish },
    ],
    temperature: 0.3,
    max_tokens: 4000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error("No response from AI")

  return content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()
}

export async function extractSpecFromCode(routeCode: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
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

  return content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()
}