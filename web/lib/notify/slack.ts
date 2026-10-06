// lib/notify/slack.ts
import type { DiffItem } from "@/lib/analysis/diff"

type SlackAlertOptions = {
  projectName: string
  contractTitle: string
  version: string
  changedBy: string
  diff: DiffItem[]
}

/**
 * Send a rich Slack alert with color accent bar and formatted blocks
 */
export async function sendSlackAlert(
  webhookUrl: string,
  options: SlackAlertOptions
): Promise<void> {
  const { projectName, contractTitle, version, changedBy, diff } = options

  const breakingItems = diff.filter((i) => i.breaking)
  const safeItems = diff.filter((i) => !i.breaking)
  const hasBreaking = breakingItems.length > 0

  const breakingText = breakingItems
    .map((i) => `• ❌ *${i.message}*`)
    .slice(0, 10)
    .join("\n")

  const safeText = safeItems
    .map((i) => `• ✅ ${i.message}`)
    .slice(0, 10)
    .join("\n")

  const blocks: unknown[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: hasBreaking
          ? `⚠️ ${contractTitle} — Breaking Change Detected`
          : `✅ ${contractTitle} — Contract Published`,
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Project:*\n${projectName}` },
        { type: "mrkdwn", text: `*Version:*\n\`v${version}\`` },
        { type: "mrkdwn", text: `*Published by:*\n${changedBy}` },
        { type: "mrkdwn", text: `*Total Changes:*\n${diff.length} changes` },
      ],
    },
  ]

  if (breakingItems.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*⚠️ Breaking Changes (${breakingItems.length}):*\n${breakingText}`,
      },
    })
  }

  if (safeItems.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*✨ Safe Changes (${safeItems.length}):*\n${safeText}`,
      },
    })
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "⚡ *Invokix API Contract Intelligence* • One contract. Every team. In sync.",
      },
    ],
  })

  // Using attachments to provide the colored accent bar (red for breaking, green for safe)
  const payload = {
    attachments: [
      {
        color: hasBreaking ? "#F15A3C" : "#B7FF3C",
        blocks,
      },
    ],
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Slack webhook failed: ${res.status}`)
  }
}

/**
 * Send a rich test alert to verify Slack webhook connection
 */
export async function sendSlackTestAlert(
  webhookUrl: string,
  projectName: string
): Promise<void> {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "⚡ Invokix Connected Successfully",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `This channel is now connected to *${projectName}*. You will receive instant notifications whenever contracts are published or breaking changes are detected.`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: "*Status:*\n🟢 Active & Ready",
        },
        {
          type: "mrkdwn",
          text: "*Channel Trigger:*\nBreaking Changes & Publishes",
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "⚡ *Invokix API Contract Intelligence* • One contract. Every team. In sync.",
        },
      ],
    },
  ]

  // Beautiful Slack Aubergine accent bar
  const payload = {
    attachments: [
      {
        color: "#4A154B",
        blocks,
      },
    ],
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Slack test alert failed: ${res.status}`)
  }
}