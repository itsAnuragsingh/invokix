// lib/notify/slack.ts
import type { DiffItem } from "@/lib/analysis/diff"

type SlackAlertOptions = {
  projectName: string
  contractTitle: string
  version: string
  changedBy: string
  diff: DiffItem[]
}

export async function sendSlackAlert(
  webhookUrl: string,
  options: SlackAlertOptions
): Promise<void> {
  const { projectName, contractTitle, version, changedBy, diff } = options

  const breakingItems = diff.filter((i) => i.breaking)
  const safeItems = diff.filter((i) => !i.breaking)
  const hasBreaking = breakingItems.length > 0

  const breakingText = breakingItems
    .map((i) => `❌ ${i.message}`)
    .join("\n")

  const safeText = safeItems
    .map((i) => `✅ ${i.message}`)
    .join("\n")

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: hasBreaking
          ? `⚠️ ${contractTitle} — Breaking Change`
          : `✅ ${contractTitle} — Updated`,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Project:*\n${projectName}` },
        { type: "mrkdwn", text: `*Version:*\nv${version}` },
        { type: "mrkdwn", text: `*Published by:*\n${changedBy}` },
        { type: "mrkdwn", text: `*Changes:*\n${diff.length} total` },
      ],
    },
  ]

  if (breakingItems.length > 0) {
    blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Breaking Changes (${breakingItems.length}):*\n${breakingText}`,
        },
        { type: "mrkdwn", text: " " },
      ],
    })
  }

  if (safeItems.length > 0) {
    blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Safe Changes (${safeItems.length}):*\n${safeText}`,
        },
        { type: "mrkdwn", text: " " },
      ],
    })
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  })

  if (!res.ok) {
    throw new Error(`Slack webhook failed: ${res.status}`)
  }
}