// lib/db/queries/notifications.ts
import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function getNotificationsByProjectId(projectId: string) {
  return db.query.notifications.findFirst({
    where: eq(notifications.projectId, projectId),
  })
}

export async function upsertNotifications(
  projectId: string,
  data: {
    slackWebhookUrl?: string
    discordWebhookUrl?: string
    emailList?: string[]
    alertOnBreaking?: boolean
    alertOnAny?: boolean
  }
) {
  const existing = await getNotificationsByProjectId(projectId)

  if (existing) {
    const [updated] = await db.update(notifications)
      .set(data)
      .where(eq(notifications.id, existing.id))
      .returning()
    return updated
  }

  const [created] = await db.insert(notifications).values({
    id: nanoid(),
    projectId,
    slackWebhookUrl: data.slackWebhookUrl,
    discordWebhookUrl: data.discordWebhookUrl,
    emailList: data.emailList,
    alertOnBreaking: data.alertOnBreaking ?? true,
    alertOnAny: data.alertOnAny ?? false,
  }).returning()

  return created
}