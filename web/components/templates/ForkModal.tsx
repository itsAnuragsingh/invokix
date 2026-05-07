// components/templates/ForkModal.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import {
  XIcon,
  GitForkIcon,
  ArrowsClockwiseIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"

type ForkModalProps = {
  template: {
    id: string
    title: string
    description: string
    endpointCount: number
  }
  projects: { id: string; name: string }[]
  onClose: () => void
}

export function ForkModal({ template, projects, onClose }: ForkModalProps) {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id ?? "")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleFork() {
    if (!selectedProject) {
      toast.error("Select a project first")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/templates/${template.id}/fork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject }),
      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.error ?? "Fork failed")
        return
      }

      setDone(true)

      // Redirect to project after short delay
      setTimeout(() => {
        router.push(`/project/${selectedProject}`)
        router.refresh()
      }, 1500)
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl z-10"
      >
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <GitForkIcon size={16} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{template.title}</h2>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      {template.endpointCount} endpoints · Fork into your project
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <XIcon size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fork into project
                  </label>

                  {projects.length === 0 ? (
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
                      <p className="text-sm text-muted-foreground">No projects yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Create a project first from your dashboard
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProject(project.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                            selectedProject === project.id
                              ? "border-primary/30 bg-primary/5 text-foreground"
                              : "border-border/50 bg-card/30 text-muted-foreground hover:text-foreground hover:bg-muted/20"
                          }`}
                        >
                          <div className={`h-2 w-2 rounded-full shrink-0 ${
                            selectedProject === project.id ? "bg-primary" : "bg-border"
                          }`} />
                          <span className="text-sm font-medium">{project.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-[11px] text-amber-400/80 leading-relaxed">
                    If the selected project already has a contract, it will be replaced with this template.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 px-5 pb-5">
                <button
                  onClick={onClose}
                  className="flex-1 h-9 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFork}
                  disabled={loading || projects.length === 0}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold
                    hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <ArrowsClockwiseIcon size={14} className="animate-spin" />
                      Forking...
                    </>
                  ) : (
                    <>
                      <GitForkIcon size={14} weight="duotone" />
                      Fork template
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-10 gap-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircleIcon size={28} weight="duotone" className="text-emerald-400" />
              </motion.div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Template forked</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Redirecting to your project...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}