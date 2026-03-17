// src/commands/pull.ts
import * as p from "@clack/prompts"
import chalk from "chalk"
import ora from "ora"
import { execSync } from "child_process"
import { existsSync } from "fs"
import { join } from "path"
import {
  readAuth,
  writeAuth,
  clearAuth,
  readConfig,
  writeConfig,
} from "../lib/config.js"
import {
  startBrowserAuth,
  pollBrowserAuth,
  verifyApiKey,
  fetchProjects,
  pullContract,
} from "../lib/api.js"
import { writeFiles } from "../lib/writer.js"

// ── Open URL in default browser ───────────────────────────────────────────────
function openBrowser(url: string): void {
  const cmd =
    process.platform === "win32" ? `start "" "${url}"` :
    process.platform === "darwin" ? `open "${url}"` :
    `xdg-open "${url}"`
  try {
    execSync(cmd, { stdio: "ignore" })
  } catch { /* ignore */ }
}

// ── Auth flow ─────────────────────────────────────────────────────────────────
async function authenticate(): Promise<{ token: string; email: string; name: string }> {
  const authChoice = await p.select({
    message: "How would you like to authenticate?",
    options: [
      {
        value: "browser",
        label: "Browser login",
        hint: "Opens invokix.com in your browser — recommended",
      },
      {
        value: "apikey",
        label: "API key",
        hint: "Paste a key from your dashboard → Settings → API Keys",
      },
    ],
  })

  if (p.isCancel(authChoice)) {
    p.cancel("Cancelled.")
    process.exit(0)
  }

  // ── Browser auth ──────────────────────────────────────────────────────────
  if (authChoice === "browser") {
    const spinner = ora("Creating auth session...").start()
    const startRes = await startBrowserAuth()

    if (!startRes.success) {
      spinner.fail("Could not connect to invokix.dev")
      process.exit(1)
    }

    spinner.stop()

    const { sessionId, confirmUrl } = startRes.data

    p.note(
      `${chalk.cyan(confirmUrl)}\n\n${chalk.dim("If the browser did not open, copy and paste the URL above.")}`,
      "Opening browser"
    )

    openBrowser(confirmUrl)

    const pollSpinner = ora(chalk.dim("Waiting for you to confirm in the browser...")).start()

    let token: string | null = null
    const maxAttempts = 150
    let attempts = 0

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2000))
      attempts++

      const pollRes = await pollBrowserAuth(sessionId)

      if (!pollRes.success) {
        if (pollRes.code === "SESSION_EXPIRED") {
          pollSpinner.fail("Session expired. Run the command again.")
          process.exit(1)
        }
        continue
      }

      if (pollRes.data.confirmed && pollRes.data.token) {
        token = pollRes.data.token
        break
      }
    }

    if (!token) {
      pollSpinner.fail("Timed out. Run the command again and confirm within 5 minutes.")
      process.exit(1)
    }

    pollSpinner.stop()

    const verifySpinner = ora("Verifying...").start()
    const verifyRes = await verifyApiKey(token)

    if (!verifyRes.success) {
      verifySpinner.fail("Authentication failed")
      process.exit(1)
    }

    verifySpinner.succeed(chalk.green(`Authenticated as ${chalk.bold(verifyRes.data.email)}`))
    return { token, email: verifyRes.data.email, name: verifyRes.data.name }
  }

  // ── API key auth ──────────────────────────────────────────────────────────
  const apiKey = await p.text({
    message: "Paste your API key",
    placeholder: "ik_live_...",
    validate(value: string | undefined) {
      if (!value) return "API key is required"
      if (!value.startsWith("ik_live_")) return "Key must start with ik_live_"
      if (value.length < 20) return "Key is too short"
    },
  })

  if (p.isCancel(apiKey)) {
    p.cancel("Cancelled.")
    process.exit(0)
  }

  const spinner = ora("Verifying API key...").start()
  const verifyRes = await verifyApiKey(apiKey as string)

  if (!verifyRes.success) {
    spinner.fail(chalk.red("Invalid API key. Check invokix.dev → Settings → API Keys"))
    process.exit(1)
  }

  spinner.succeed(chalk.green(`Authenticated as ${chalk.bold(verifyRes.data.email)}`))
  return { token: apiKey as string, email: verifyRes.data.email, name: verifyRes.data.name }
}

// ── Main pull command ─────────────────────────────────────────────────────────
export async function pull(): Promise<void> {
  console.log("")
  p.intro(
    `${chalk.bgHex("#5c6bc0").white.bold("  invokix  ")} ${chalk.dim("API contract outputs")}`
  )

  // ── Step 1: Auth ─────────────────────────────────────────────────────────
  let auth = readAuth()

  if (!auth?.token) {
    p.log.warn(chalk.yellow("Not logged in."))
    const user = await authenticate()
    writeAuth(user)
    auth = user
  } else {
    p.log.step(chalk.dim(`Authenticated as ${chalk.white(auth.email)}`))
  }

  // ── Step 2: Config ───────────────────────────────────────────────────────
  let config = readConfig()

  if (!config) {
    console.log("")
    p.log.info("First time setup — configuring your project.")

    const projectsSpinner = ora("Fetching your projects...").start()
    const projectsRes = await fetchProjects(auth.token)

    if (!projectsRes.success) {
      projectsSpinner.fail(chalk.red("Failed to fetch projects."))
      if (projectsRes.code === "UNAUTHORIZED") clearAuth()
      process.exit(1)
    }

    projectsSpinner.stop()

    if (projectsRes.data.length === 0) {
      p.log.error("No projects found. Create one at invokix.dev first.")
      process.exit(1)
    }

    const projectId = await p.select({
      message: "Which project do you want to pull from?",
      options: projectsRes.data.map((proj) => ({
        value: proj.id,
        label: proj.name,
        hint: proj.description ?? proj.stack,
      })),
    })

    if (p.isCancel(projectId)) {
      p.cancel("Cancelled.")
      process.exit(0)
    }

    const outputDir = await p.text({
      message: "Where should outputs be written?",
      placeholder: "src/",
      initialValue: "src/",
      validate(value: string | undefined) {
        if (!value || !value.trim()) return "Output directory is required"
      },
    })

    if (p.isCancel(outputDir)) {
      p.cancel("Cancelled.")
      process.exit(0)
    }

    const selectedOutputs = await p.multiselect({
      message: "Which outputs do you need?",
      options: [
        { value: "types", label: "TypeScript types", hint: "always recommended" },
        { value: "hooks", label: "React Query v5 hooks", hint: "Next.js / React" },
        { value: "schemas", label: "Zod schemas", hint: "runtime validation" },
        { value: "hooks-native", label: "React Native hooks", hint: "mobile" },
      ],
      initialValues: ["types", "hooks", "schemas"],
    })

    if (p.isCancel(selectedOutputs)) {
      p.cancel("Cancelled.")
      process.exit(0)
    }

    config = {
      projectId: projectId as string,
      contractId: "",
      outputDir: (outputDir as string).trim().replace(/\/?$/, "/"),
      outputs: selectedOutputs as string[],
    }
  } else {
    p.log.step(chalk.dim(`Project: ${chalk.white(config.projectId)}`))
  }

  // ── Step 3: Pull ─────────────────────────────────────────────────────────
  console.log("")
  const pullSpinner = ora("Pulling latest contract outputs...").start()

  const pullRes = await pullContract(auth.token, config.projectId, config.outputs)

  if (!pullRes.success) {
    pullSpinner.fail(chalk.red(pullRes.error))
    if (pullRes.code === "UNAUTHORIZED") {
      p.log.warn("Session expired — run the command again to re-authenticate.")
      clearAuth()
    }
    process.exit(1)
  }

  pullSpinner.stop()

  // ── Step 4: Write files ──────────────────────────────────────────────────
  const results = writeFiles(pullRes.data.files, config.outputDir, pullRes.data.projectName)

  // ── Step 5: Save config ──────────────────────────────────────────────────
  config.contractId = pullRes.data.contractId
  writeConfig(config)

  // ── Step 6: Print results ────────────────────────────────────────────────
  console.log("")

  for (const result of results) {
    const icon =
      result.status === "unchanged" ? chalk.dim("·") :
      result.status === "updated" ? chalk.yellow("↑") :
      chalk.green("✔")

    const filePath =
      result.status === "unchanged"
        ? chalk.dim(result.filePath)
        : chalk.white(result.filePath)

    const label =
      result.status === "unchanged" ? chalk.dim("no changes") :
      result.status === "updated" ? chalk.yellow("updated") :
      chalk.green("written")

    console.log(`  ${icon}  ${filePath}  ${chalk.dim(label)}`)
  }

  console.log("")
  p.log.success(chalk.green(`Synced to ${chalk.bold(`v${pullRes.data.version}`)}`))

  if (!existsSync(join(process.cwd(), "invokix.config.json"))) {
    p.log.info(chalk.dim(`Config saved → ${chalk.white("invokix.config.json")} — commit this file`))
  }

  p.outro(chalk.dim("Run npx invokix pull any time to stay in sync."))
}