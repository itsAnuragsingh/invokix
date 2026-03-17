// app/api/contract/publish/route.ts
import { requireSession } from "@/lib/auth/session"
import { ok, err } from "@/lib/api/response"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId, updateContract } from "@/lib/db/queries/contracts"
import { createVersion } from "@/lib/db/queries/versions"
import { getNotificationsByProjectId } from "@/lib/db/queries/notifications"
import { diffSpecs } from "@/lib/analysis/diff"
import { sendSlackAlert } from "@/lib/notify/slack"
import { db } from "@/lib/db"
import { projects } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

const schema = z.object({
  projectId: z.string().min(1),
  force: z.boolean().default(false),
})

function bumpVersion(current: string): string {
  const parts = current.split(".").map(Number)
  parts[parts.length - 1] += 1
  return parts.join(".")
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (!session) return err("Unauthorized", "UNAUTHORIZED", 401)

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return err("Invalid request", "INVALID_REQUEST", 400)

    const { projectId, force } = parsed.data

    const project = await getProjectById(projectId, session.user.id)
    if (!project) return err("Project not found", "NOT_FOUND", 404)

    const contract = await getContractByProjectId(projectId)
    if (!contract) return err("No contract found", "NO_CONTRACT", 404)

    // Diff current saved spec against last published version
    // For now diff against itself to detect any unpublished changes
    // In real flow: diff against last contractVersion snapshot
    const { getVersionsByContractId } = await import("@/lib/db/queries/versions")
    const versions = await getVersionsByContractId(contract.id)
    const lastVersion = versions[0]

    const previousSpec = lastVersion
      ? (lastVersion.openApiSpec as object)
      : {}

    const currentSpec = contract.openApiSpec as object
    const diff = diffSpecs(previousSpec, currentSpec)

    // Block if breaking and not forced
    if (diff.hasBreaking && !force) {
      return ok({ blocked: true, diff: diff.items })
    }

    const newVersion = bumpVersion(contract.version)

    await updateContract(contract.id, currentSpec, newVersion)

    const breakingItems = diff.items.filter((i) => i.breaking)

    await createVersion(
      contract.id,
      currentSpec,
      newVersion,
      session.user.id,
      diff.items.map((i) => i.message).join("; ") || "No changes",
      diff.hasBreaking,
      breakingItems.map((i) => i.message)
    )

    // Fire Slack alert — never block publish on failure
    try {
      const notifications = await getNotificationsByProjectId(projectId)
      if (notifications?.slackWebhookUrl && (notifications.alertOnAny || (notifications.alertOnBreaking && diff.hasBreaking))) {
        const projectRow = await db.query.projects.findFirst({ where: eq(projects.id, projectId) })
        await sendSlackAlert(notifications.slackWebhookUrl, {
          projectName: projectRow?.name ?? projectId,
          contractTitle: (currentSpec as { info?: { title?: string } }).info?.title ?? "API Contract",
          version: newVersion,
          changedBy: session.user.email ?? session.user.id,
          diff: diff.items,
        })
      }
    } catch {
      // Slack failure never blocks publish
    }

    return ok({ blocked: false, version: newVersion, diff: diff.items })
  } catch {
    return err("Something went wrong", "SERVER_ERROR", 500)
  }
}