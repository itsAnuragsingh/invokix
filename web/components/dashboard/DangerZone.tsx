// components/dashboard/DangerZone.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { TrashIcon, WarningIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"

type DangerZoneProps = {
  projectId: string
  projectName: string
}

export function DangerZone({ projectId, projectName }: DangerZoneProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (confirm !== projectName) { toast.error("Project name doesn't match"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Delete failed"); return }
      toast.success("Project deleted")
      router.push("/dashboard")
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-red-500/20 bg-red-500/3 overflow-hidden">
        <div className="px-4 py-3 border-b border-red-500/20 bg-red-500/5 flex items-center gap-2">
          <WarningIcon weight="fill" className="h-4 w-4 text-red-400" />
          <span className="text-xs font-semibold text-red-400">Danger Zone</span>
        </div>
        <div className="px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Delete this project</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete <span className="font-mono text-foreground">{projectName}</span> and all its contracts, versions, and consumers. This cannot be undone.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 shrink-0 gap-1.5 h-8 text-xs"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-md bg-card border-red-500/20 p-0 overflow-hidden flex flex-col gap-0">
          <div className="px-5 py-4 border-b border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <TrashIcon weight="fill" className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <DialogTitle className="font-display font-bold text-base text-foreground">
                  Delete project
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  This action is permanent and cannot be undone
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Type <span className="font-mono font-bold text-foreground bg-muted/50 px-1.5 py-0.5 rounded">{projectName}</span> to confirm deletion.
            </p>
            <Input
              placeholder={projectName}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-muted/30 border-border/50 focus-visible:ring-red-500/30 h-10"
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-9 text-sm border-border/50" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 h-9 text-sm bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 gap-1.5"
                onClick={handleDelete}
                disabled={loading || confirm !== projectName}
              >
                {loading ? (
                  <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    Deleting...
                  </motion.span>
                ) : (
                  <><TrashIcon className="h-4 w-4" /> Delete forever</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}