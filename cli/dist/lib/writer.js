// src/lib/writer.ts
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
const FILE_NAMES = {
    types: "types.ts",
    hooks: "hooks.ts",
    schemas: "schemas.ts",
    "hooks-native": "hooks.native.ts",
};
const SUBFOLDER = {
    types: "types",
    hooks: "hooks",
    schemas: "schemas",
    "hooks-native": "hooks",
};
export function writeFiles(files, outputDir, projectName) {
    const results = [];
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    for (const [key, content] of Object.entries(files)) {
        const fileName = FILE_NAMES[key] ?? `${key}.ts`;
        const subFolder = SUBFOLDER[key] ?? key;
        const filePath = join(process.cwd(), outputDir, subFolder, slug, fileName);
        const dir = dirname(filePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        // Check if content changed
        let status = "written";
        if (existsSync(filePath)) {
            try {
                const existing = readFileSync(filePath, "utf-8");
                status = existing === content ? "unchanged" : "updated";
            }
            catch {
                status = "updated";
            }
        }
        writeFileSync(filePath, content, "utf-8");
        results.push({
            key,
            filePath: filePath.replace(process.cwd(), "."),
            status,
        });
    }
    return results;
}
//# sourceMappingURL=writer.js.map