// lib/analysis/diff.ts
type OpenApiSpec = {
  paths?: Record<string, Record<string, {
    summary?: string
    description?: string
    parameters?: Array<{ name: string; in: string; required?: boolean }>
    requestBody?: object
    responses?: Record<string, object>
  }>>
  components?: {
    schemas?: Record<string, {
      properties?: Record<string, { type?: string; format?: string }>
      required?: string[]
    }>
  }
}

export type DiffItem = {
  type: "added" | "removed" | "changed"
  breaking: boolean
  path: string
  message: string
}

export type DiffResult = {
  items: DiffItem[]
  hasBreaking: boolean
}

export function diffSpecs(oldSpec: object, newSpec: object): DiffResult {
  const old = oldSpec as OpenApiSpec
  const next = newSpec as OpenApiSpec
  const items: DiffItem[] = []

  const oldPaths = old.paths ?? {}
  const newPaths = next.paths ?? {}

  // Removed endpoints — always breaking
  for (const path of Object.keys(oldPaths)) {
    if (!newPaths[path]) {
      items.push({
        type: "removed",
        breaking: true,
        path,
        message: `Endpoint removed: ${path}`,
      })
      continue
    }

    for (const method of Object.keys(oldPaths[path])) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue
      if (!newPaths[path][method]) {
        items.push({
          type: "removed",
          breaking: true,
          path,
          message: `${method.toUpperCase()} ${path} — endpoint removed`,
        })
      }
    }
  }

  // Added endpoints — never breaking
  for (const path of Object.keys(newPaths)) {
    if (!oldPaths[path]) {
      items.push({
        type: "added",
        breaking: false,
        path,
        message: `New endpoint: ${path}`,
      })
    }
  }

  // Schema changes
  const oldSchemas = old.components?.schemas ?? {}
  const newSchemas = next.components?.schemas ?? {}

  for (const [name, oldSchema] of Object.entries(oldSchemas)) {
    const newSchema = newSchemas[name]

    // Schema removed — breaking
    if (!newSchema) {
      items.push({
        type: "removed",
        breaking: true,
        path: `components/schemas/${name}`,
        message: `Schema removed: ${name}`,
      })
      continue
    }

    const oldProps = oldSchema.properties ?? {}
    const newProps = newSchema.properties ?? {}

    // Field removed — breaking
    for (const field of Object.keys(oldProps)) {
      if (!newProps[field]) {
        items.push({
          type: "removed",
          breaking: true,
          path: `components/schemas/${name}/${field}`,
          message: `Field removed: ${name}.${field}`,
        })
      }
    }

    // Field type changed — breaking
    for (const [field, oldProp] of Object.entries(oldProps)) {
      const newProp = newProps[field]
      if (!newProp) continue
      if (oldProp.type !== newProp.type) {
        items.push({
          type: "changed",
          breaking: true,
          path: `components/schemas/${name}/${field}`,
          message: `Type changed: ${name}.${field} — ${oldProp.type} → ${newProp.type}`,
        })
      }
    }

    // New required field added — breaking
    const oldRequired = oldSchema.required ?? []
    const newRequired = newSchema.required ?? []
    for (const field of newRequired) {
      if (!oldRequired.includes(field)) {
        items.push({
          type: "added",
          breaking: true,
          path: `components/schemas/${name}/${field}`,
          message: `Required field added: ${name}.${field}`,
        })
      }
    }

    // Optional field added — not breaking
    for (const field of Object.keys(newProps)) {
      if (!oldProps[field] && !newRequired.includes(field)) {
        items.push({
          type: "added",
          breaking: false,
          path: `components/schemas/${name}/${field}`,
          message: `Optional field added: ${name}.${field}`,
        })
      }
    }
  }

  // New schema added — not breaking
  for (const name of Object.keys(newSchemas)) {
    if (!oldSchemas[name]) {
      items.push({
        type: "added",
        breaking: false,
        path: `components/schemas/${name}`,
        message: `New schema: ${name}`,
      })
    }
  }

  return {
    items,
    hasBreaking: items.some((i) => i.breaking),
  }
}