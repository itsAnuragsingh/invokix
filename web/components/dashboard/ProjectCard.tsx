"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpRightIcon, ClockIcon, LightningIcon, UsersThreeIcon } from "@phosphor-icons/react"
import type { InferSelectModel } from "drizzle-orm"
import type { projects } from "@/lib/db/schema"

type Project = InferSelectModel<typeof projects>
type ProjectCardProps = { project: Project; memberRole?: "owner" | "editor" | "viewer" }

export function ProjectCard({ project, memberRole = "owner" }: ProjectCardProps) {
  const shared = memberRole !== "owner"
  return <Link href={`/project/${project.id}`} className="group block"><article className="relative min-h-[218px] overflow-hidden border border-border/45 bg-card/45 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/70 hover:shadow-xl hover:shadow-black/10"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" /><div className="flex items-start justify-between"><div className="grid h-10 w-10 place-items-center border border-primary/20 bg-primary/10 text-primary"><LightningIcon size={18} weight="fill" /></div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide"><span className="border border-border/50 px-2 py-1 text-muted-foreground">Free</span>{shared && <span className="flex items-center gap-1 bg-blue-500/10 px-2 py-1 text-blue-400"><UsersThreeIcon size={12} /> {memberRole}</span>}</div></div><div className="mt-7"><h3 className="font-display text-lg font-bold tracking-tight text-foreground group-hover:text-primary">{project.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.description || "No description yet. Start defining the contract for this project."}</p></div><div className="absolute inset-x-5 bottom-5 flex items-center justify-between border-t border-border/35 pt-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><ClockIcon size={13} /> {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span><span className="flex items-center gap-1 font-semibold text-foreground group-hover:text-primary">Open workspace <ArrowUpRightIcon size={14} /></span></div></article></Link>
}
