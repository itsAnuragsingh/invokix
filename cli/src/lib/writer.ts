// src/lib/writer.ts
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs"
import { join, dirname } from "path"

const FILE_NAMES: Record<string, string> = {
  types: "types.ts",
  hooks: "hooks.ts",
  schemas: "schemas.ts",
  "hooks-native": "hooks.native.ts",
}

const SUBFOLDER: Record<string, string> = {
  types: "types",
  hooks: "hooks",
  schemas: "schemas",
  "hooks-native": "hooks",
}

export type WriteResult = {
  key: string
  filePath: string
  status: "written" | "updated" | "unchanged"
}

export function writeFiles(
  files: Record<string, string>,
  outputDir: string,
  projectName: string
): WriteResult[] {
  const results: WriteResult[] = []
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")

  for (const [key, content] of Object.entries(files)) {
    const fileName = FILE_NAMES[key] ?? `${key}.ts`
    const subFolder = SUBFOLDER[key] ?? key
    const filePath = join(process.cwd(), outputDir, subFolder, slug, fileName)
    const dir = dirname(filePath)

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    // Check if content changed
    let status: WriteResult["status"] = "written"
    if (existsSync(filePath)) {
      try {
        const existing = readFileSync(filePath, "utf-8")
        status = existing === content ? "unchanged" : "updated"
      } catch {
        status = "updated"
      }
    }

    writeFileSync(filePath, content, "utf-8")
    results.push({
      key,
      filePath: filePath.replace(process.cwd(), "."),
      status,
    })
  }

  return results
}