// app/(dashboard)/templates/page.tsx
import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getPublicTemplates } from "@/lib/db/queries/templates"
import { getProjectsByUserId } from "@/lib/db/queries/projects"
import { TemplateGrid } from "@/components/templates/TemplateGrid"
import { StackIcon, LightningIcon } from "@phosphor-icons/react/dist/ssr"

export default async function TemplatesPage() {
  const session = await requireSession()
  if (!session) redirect("/login")

  const [templates, projects] = await Promise.all([
    getPublicTemplates(),
    getProjectsByUserId(session.user.id),
  ])

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#11131C] via-[#161824] to-[#11131C] p-6 shadow-xl shadow-black/40">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#FFD15C]/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFD15C]/30 bg-[#FFD15C]/10 px-3 py-1 text-xs font-mono font-bold text-[#FFD15C]">
              <StackIcon size={14} weight="duotone" />
              <span>CONTRACT PRESETS</span>
              <span className="h-1 w-1 rounded-full bg-[#FFD15C]" />
              <span className="text-[10px] opacity-80">{templates.length} READY TO FORK</span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              API Templates<span className="text-[#FFD15C]">.</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fork battle-tested API specs into any workspace. Types, Zod validators, React Query hooks, and mock servers generated instantly in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 shadow-inner">
              <LightningIcon size={18} weight="fill" className="text-[#FFD15C]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">Instant Deploy</p>
                <p className="text-xs font-bold text-foreground">Zero Boilerplate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TemplateGrid
        templates={templates}
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  )
}