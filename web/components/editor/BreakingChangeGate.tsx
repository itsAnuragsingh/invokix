// components/editor/BreakingChangeGate.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { AlertTriangle, CheckCircle, XCircle, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DiffItem } from "@/lib/analysis/diff"

type BreakingChangeGateProps = {
  projectId: string
  currentSpec: object
}

export function BreakingChangeGate({ projectId, currentSpec }: BreakingChangeGateProps) {
  const router = useRouter()
  const [spec, setSpec] = useState(JSON.stringify(currentSpec, null, 2))
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [diff, setDiff] = useState<DiffItem[]>([])
  const [showGate, setShowGate] = useState(false)

  async function handlePublish(force = false) {
    setLoading(true)
    try {
      const res = await fetch("/api/contract/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, spec, force }),
      })

      const json = await res.json()
      if (!json.success) {
        toast.error(json.error ?? "Publish failed")
        return
      }

      if (json.data.blocked) {
        setDiff(json.data.diff)
        setBlocked(true)
        setShowGate(true)
        return
      }

      toast.success(`Published v${json.data.version}!`)
      setShowGate(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const breakingItems = diff.filter((i) => i.breaking)
  const safeItems = diff.filter((i) => !i.breaking)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Publish Contract Update
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            className="font-mono text-xs min-h-64 resize-none"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
          />
          <Button
            onClick={() => handlePublish(false)}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Checking changes..." : "Publish Update"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showGate} onOpenChange={setShowGate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Breaking Changes Detected
            </DialogTitle>
            <DialogDescription>
              Review the changes below before publishing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {breakingItems.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-destructive uppercase tracking-wide">
                  Breaking ({breakingItems.length})
                </p>
                {breakingItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-md bg-red-500/10 text-red-700">
                    <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {item.message}
                  </div>
                ))}
              </div>
            )}

            {safeItems.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                  Safe ({safeItems.length})
                </p>
                {safeItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-md bg-green-500/10 text-green-700">
                    <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {item.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowGate(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handlePublish(true)}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Force Publish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}