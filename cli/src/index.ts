#!/usr/bin/env node
// src/index.ts
import chalk from "chalk"
import { pull } from "./commands/pull.js"
import { logout } from "./commands/logout.js"

const args = process.argv.slice(2)
const command = args[0]

const VERSION = "0.1.0"

function showHelp(): void {
  console.log("")
  console.log(
    `  ${chalk.bgHex("#5c6bc0").white.bold("  invokix  ")}  ${chalk.dim(`v${VERSION}`)}`
  )
  console.log("")
  console.log(chalk.dim("  Pull your API contract outputs into any project."))
  console.log("")
  console.log("  " + chalk.white("Commands"))
  console.log("")
  console.log(`  ${chalk.cyan("pull")}      ${chalk.dim("Pull latest types, hooks, and schemas")}`)
  console.log(`  ${chalk.cyan("logout")}    ${chalk.dim("Log out of your Invokix account")}`)
  console.log(`  ${chalk.cyan("--version")} ${chalk.dim("Show version")}`)
  console.log(`  ${chalk.cyan("--help")}    ${chalk.dim("Show this help")}`)
  console.log("")
  console.log("  " + chalk.dim("Example"))
  console.log("")
  console.log(`  ${chalk.dim("$")} npx invokix pull`)
  console.log("")
}

async function main(): Promise<void> {
  if (!command || command === "--help" || command === "-h") {
    showHelp()
    return
  }

  if (command === "--version" || command === "-v") {
    console.log(`invokix v${VERSION}`)
    return
  }

  if (command === "pull") {
    await pull()
    return
  }

  if (command === "logout") {
    await logout()
    return
  }

  console.log("")
  console.log(chalk.red(`  Unknown command: ${command}`))
  showHelp()
  process.exit(1)
}

main().catch((err) => {
  console.error(chalk.red("\n  Error: " + (err instanceof Error ? err.message : String(err))))
  process.exit(1)
})