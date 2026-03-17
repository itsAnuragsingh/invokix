// components/dashboard/ProjectCard.tsx
"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ArrowRightIcon, LightningIcon, ClockIcon, UsersThreeIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"
import type { projects } from "@/lib/db/schema"

type Project = InferSelectModel<typeof projects>

type ProjectCardProps = {
  project: Project
  memberRole?: "owner" | "editor" | "viewer"
}

export function ProjectCard({ project, memberRole = "owner" }: ProjectCardProps) {
  const isShared = memberRole !== "owner"

  return (
    <Link href={`/project/${project.id}`} className="block group">
      <Card className={cn(
        "relative overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm",
        "hover:border-primary/40 hover:bg-card transition-all duration-200",
        "hover:shadow-lg hover:shadow-primary/5"
      )}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <LightningIcon weight="fill" className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-1.5">
              {isShared && (
                <Badge
                  variant="outline"
                  className="text-[10px] border-blue-500/30 text-blue-400 bg-blue-500/10 flex items-center gap-1"
                >
                  <UsersThreeIcon className="h-2.5 w-2.5" />
                  {memberRole}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-[10px] border-border/50 text-muted-foreground font-mono"
              >
                Free
              </Badge>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-tight">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ClockIcon className="h-3 w-3" />
              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
              Open
              <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}