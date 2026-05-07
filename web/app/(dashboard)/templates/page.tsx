// app/(dashboard)/templates/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getPublicTemplates } from "@/lib/db/queries/templates"
import { getProjectsByUserId } from "@/lib/db/queries/projects"
import { TemplateGrid } from "@/components/templates/TemplateGrid"

export default async function TemplatesPage() {
  const session = await requireSession()
  if (!session) redirect("/login")

  const [templates, projects] = await Promise.all([
    getPublicTemplates(),
    getProjectsByUserId(session.user.id),
  ])

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Templates
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fork a pre-built API contract into any project. Types, hooks, schemas, and mock server ready in seconds.
        </p>
      </div>

      <TemplateGrid
        templates={templates}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  )
}