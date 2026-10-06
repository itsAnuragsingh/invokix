// lib/notify/discord.ts
import type { DiffItem } from "@/lib/analysis/diff"

export type DiscordAlertOptions = {
  projectName: string
  contractTitle: string
  version: string
  changedBy: string
  diff: DiffItem[]
}

/**
 * Send a rich Discord Embed alert via webhook URL
 */
export async function sendDiscordAlert(
  webhookUrl: string,
  options: DiscordAlertOptions
): Promise<void> {
  const { projectName, contractTitle, version, changedBy, diff } = options

  const breakingItems = diff.filter((i) => i.breaking)
  const safeItems = diff.filter((i) => !i.breaking)
  const hasBreaking = breakingItems.length > 0

  const breakingText = breakingItems
    .map((i) => `❌ **${i.message}**`)
    .slice(0, 10)
    .join("\n")

  const safeText = safeItems
    .map((i) => `✅ ${i.message}`)
    .slice(0, 10)
    .join("\n")

  const fields = [
    { name: "Project", value: projectName, inline: true },
    { name: "Version", value: `\`v${version}\``, inline: true },
    { name: "Published by", value: changedBy, inline: true },
  ]

  if (breakingItems.length > 0) {
    fields.push({
      name: `⚠️ Breaking Changes (${breakingItems.length})`,
      value: breakingText || "None",
      inline: false,
    })
  }

  if (safeItems.length > 0) {
    fields.push({
      name: `✨ Safe Changes (${safeItems.length})`,
      value: safeText || "None",
      inline: false,
    })
  }

  const payload = {
    username: "Invokix",
    avatar_url: "https://invokix.com/favicon.ico",
    embeds: [
      {
        title: hasBreaking
          ? `⚠️ ${contractTitle} — Breaking Change Detected`
          : `✅ ${contractTitle} — Contract Published`,
        color: hasBreaking ? 0xf15a3c : 0xb7ff3c, // Red-orange for breaking, Neon green for safe
        fields,
        footer: {
          text: "Invokix API Contract Intelligence • One contract. Every team. In sync.",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => "")
    throw new Error(`Discord webhook failed (${res.status}): ${errorText}`)
  }
}

/**
 * Send a test notification to verify Discord webhook setup
 */
export async function sendDiscordTestAlert(
  webhookUrl: string,
  projectName: string
): Promise<void> {
  const payload = {
    username: "Invokix",
    avatar_url: "https://invokix.com/favicon.ico",
    embeds: [
      {
        title: "⚡ Invokix Connected Successfully",
        description: `This channel is now connected to **${projectName}**. You will receive instant signals whenever API contracts are updated or breaking changes are detected.`,
        color: 0x5865f2, // Discord Blurple
        fields: [
          { name: "Status", value: "🟢 Active & Ready", inline: true },
          { name: "Channel Trigger", value: "Breaking Changes & Publishes", inline: true },
        ],
        footer: {
          text: "Invokix API Contract Intelligence",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => "")
    throw new Error(`Discord test alert failed (${res.status}): ${errorText}`)
  }
}
