// src/lib/config.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs"
import { join } from "path"
import { homedir } from "os"

// ── Project config — committed to version control ─────────────────────────────

export type InvokixConfig = {
  projectId: string
  contractId: string
  outputDir: string
  outputs: string[]
}

const CONFIG_FILE = "invokix.config.json"

export function readConfig(): InvokixConfig | null {
  const path = join(process.cwd(), CONFIG_FILE)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as InvokixConfig
  } catch {
    return null
  }
}

export function writeConfig(config: InvokixConfig): void {
  const path = join(process.cwd(), CONFIG_FILE)
  writeFileSync(path, JSON.stringify(config, null, 2), "utf-8")
}

export function configExists(): boolean {
  return existsSync(join(process.cwd(), CONFIG_FILE))
}

// ── Auth token — never committed, stored in home dir ─────────────────────────

const AUTH_DIR = join(homedir(), ".invokix")
const AUTH_FILE = join(AUTH_DIR, "auth.json")

type AuthData = {
  token: string
  email: string
  name: string
}

export function readAuth(): AuthData | null {
  if (!existsSync(AUTH_FILE)) return null
  try {
    return JSON.parse(readFileSync(AUTH_FILE, "utf-8")) as AuthData
  } catch {
    return null
  }
}

export function writeAuth(data: AuthData): void {
  if (!existsSync(AUTH_DIR)) {
    mkdirSync(AUTH_DIR, { recursive: true })
  }
  writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2), "utf-8")
}

export function clearAuth(): void {
  if (existsSync(AUTH_FILE)) {
    unlinkSync(AUTH_FILE)  // deletes the file completely
  }
}

export function isAuthenticated(): boolean {
  const auth = readAuth()
  return !!auth?.token
}