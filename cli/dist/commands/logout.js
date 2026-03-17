// src/commands/logout.ts
import * as p from "@clack/prompts";
import chalk from "chalk";
import { readAuth, clearAuth } from "../lib/config.js";
export async function logout() {
    console.log("");
    p.intro(`${chalk.bgHex("#5c6bc0").white.bold("  invokix  ")} ${chalk.dim("Logout")}`);
    const auth = readAuth();
    if (!auth?.token) {
        p.log.warn("You are not logged in.");
        p.outro("");
        return;
    }
    const confirmed = await p.confirm({
        message: `Log out of ${chalk.white(auth.email)}?`,
    });
    if (p.isCancel(confirmed) || !confirmed) {
        p.cancel("Cancelled.");
        return;
    }
    clearAuth();
    p.log.success(chalk.green(`Logged out of ${auth.email}`));
    p.outro(chalk.dim("Run npx invokix pull to log in again."));
}
//# sourceMappingURL=logout.js.map