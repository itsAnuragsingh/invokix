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
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#0E1017] shadow-2xl shadow-black/90 z-10 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FFD15C]/15 border border-[#FFD15C]/30 flex items-center justify-center text-[#FFD15C] shadow-sm">
                    <GitForkIcon size={18} weight="duotone" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{template.title}</h2>
                    <p className="text-[11px] font-mono text-muted-foreground/70 mt-0.5">
                      {template.endpointCount} endpoints · Fork into workspace
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  <XIcon size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    Select Target Project
                  </label>

                  {projects.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
                      <p className="text-sm text-muted-foreground">No projects found</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Create a project first from your dashboard console
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {projects.map((project) => {
                        const isSelected = selectedProject === project.id
                        return (
                          <button
                            key={project.id}
                            onClick={() => setSelectedProject(project.id)}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-[#FFD15C]/50 bg-[#FFD15C]/15 text-foreground font-semibold shadow-sm"
                                : "border-white/10 bg-white/[0.02] text-muted-foreground/80 hover:text-foreground hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                              isSelected ? "bg-[#FFD15C] shadow-[0_0_8px_rgba(255,209,92,0.8)]" : "bg-white/20"
                            }`} />
                            <span className="text-xs">{project.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#FFD15C]/30 bg-[#FFD15C]/10 p-3">
                  <p className="text-[11px] text-[#FFD15C] leading-relaxed">
                    Forking will populate your project with preset endpoints, Zod contract schemas, and mock data handlers.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-5 pb-5">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 rounded-xl border border-white/15 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFork}
                  disabled={loading || projects.length === 0}
                  className="flex-1 h-10 rounded-xl bg-[#FFD15C] text-black text-xs font-bold
                    hover:bg-[#ffe18d] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[2px_2px_0_rgba(0,0,0,0.6)] active:translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <ArrowsClockwiseIcon size={15} className="animate-spin" />
                      Forking...
                    </>
                  ) : (
                    <>
                      <GitForkIcon size={15} weight="bold" />
                      Fork Template
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
                className="h-16 w-16 rounded-full bg-[#B7FF3C]/15 border border-[#B7FF3C]/40 flex items-center justify-center shadow-lg shadow-[#B7FF3C]/10"
              >
                <CheckCircleIcon size={32} weight="bold" className="text-[#B7FF3C]" />
              </motion.div>
              <div>
                <h3 className="text-base font-bold text-foreground">Template Forked Successfully</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Redirecting to your project contract console...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}