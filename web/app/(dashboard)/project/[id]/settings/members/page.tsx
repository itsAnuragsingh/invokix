// app/(dashboard)/project/[id]/settings/members/page.tsx
import { redirect, notFound } from "next/navigation"
import { requireProjectRole } from "@/lib/auth/session"
import { getProjectById } from "@/lib/db/queries/projects"
import { getContractByProjectId } from "@/lib/db/queries/contracts"
import { getProjectMembers } from "@/lib/db/queries/members"
import { getPendingInvites } from "@/lib/db/queries/invites"
import { MembersPanel } from "@/components/members/MembersPanel"
import {
  LightningIcon,
  GitBranchIcon,
  UsersIcon,
  GearIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

type Props = { params: Promise<{ id: string }> }

export default async function MembersSettingsPage({ params }: Props) {
  const { id } = await params

  const access = await requireProjectRole(id, "viewer")
  if (!access) redirect("/login")

  const project = await getProjectById(id, access.session!.user.id)
  if (!project) notFound()

  const contract = await getContractByProjectId(id)

  const [members, pending] = await Promise.all([
    getProjectMembers(id),
    getPendingInvites(id),
  ])

  return (
    <div className="space-y-0 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Projects
            </Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <Link
              href={`/project/${id}`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {project.name}
            </Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <Link
              href={`/project/${id}/settings`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <span className="text-xs text-foreground font-medium">Members</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Team Members
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage who has access to this project and their roles.
          </p>
        </div>
      </div>

      {/* Nav — same as settings page */}
      <div className="flex items-center gap-1 border-b border-border/50 mb-8">
        {[
          { href: `/project/${id}`, label: "Contract", icon: LightningIcon },
          { href: `/project/${id}/history`, label: "History", icon: GitBranchIcon },
          { href: `/project/${id}/consumers`, label: "Consumers", icon: UsersIcon },
          { href: `/project/${id}/settings`, label: "Settings", icon: GearIcon },
          {
            href: `/share/${contract?.id ?? ""}`,
            label: "Share ↗",
            icon: ShareNetworkIcon,
            external: true,
          },
        ].map(({ href, label, icon: Icon, external }) => (
          <Link
            key={href}
            href={href}
            target={external ? "_blank" : undefined}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-all duration-150 -mb-px text-muted-foreground border-transparent hover:text-foreground hover:border-primary/50"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-2xl">
        <div className="rounded-xl border border-border/50 bg-card/20 p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-foreground">Team</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {members.length} member{members.length !== 1 ? "s" : ""} · Only owners can invite or
              remove members.
            </p>
          </div>

          <MembersPanel
            projectId={id}
            currentUserId={access.session!.user.id}
            currentUserRole={access.role}
            initialMembers={members}
            initialPending={pending}
          />
        </div>
      </div>
    </div>
  )
}