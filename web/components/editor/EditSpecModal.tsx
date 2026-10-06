// components/editor/EditSpecModal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  PencilSimpleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import { codeToHtml } from "shiki"

type EditSpecModalProps = {
  projectId: string
  currentSpec: object
  contractId: string
  version: string
}

export function EditSpecModal({
  projectId,
  currentSpec,
  contractId,
  version,
}: EditSpecModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [spec, setSpec] = useState("")
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [preview, setPreview] = useState("")
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset spec when modal opens
  useEffect(() => {
    if (open) {
      setSpec(JSON.stringify(currentSpec, null, 2))
      setIsValid(true)
    }
  }, [open, currentSpec])

  // Validate JSON
  useEffect(() => {
    try {
      JSON.parse(spec)
      setIsValid(true)
    } catch {
      setIsValid(false)
    }
  }, [spec])

  // Debounced syntax highlight
  useEffect(() => {
    if (!open || !spec) return
    if (highlightTimer.current) clearTimeout(highlightTimer.current)
    highlightTimer.current = setTimeout(async () => {
      try {
        const html = await codeToHtml(spec, {
          lang: "json",
          theme: "github-dark-dimmed",
        })
        setPreview(html)
      } catch {
        setPreview("")
      }
    }, 400)
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current)
    }
  }, [spec, open])

  async function handleSave() {
    if (!isValid) { toast.error("Fix JSON errors before saving"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/import/openapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, spec, mode: "replace" }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Save failed"); return }
      toast.success("Spec saved!")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const lineCount = spec.split("\n").length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="group h-9 px-3.5 text-xs font-semibold bg-white/[0.04] text-muted-foreground hover:text-foreground border border-border/60 hover:border-border/90 hover:bg-white/[0.08] shadow-[2px_2px_0_rgba(0,0,0,0.6)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all duration-150 rounded-lg flex items-center gap-1.5"
        >
          <PencilSimpleIcon className="h-3.5 w-3.5 text-primary/80 group-hover:text-primary transition-colors" />
          <span>Edit Spec</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-[90vw] w-[90vw] h-[88vh] bg-[#1c2128] border-border/50 p-0 overflow-hidden flex flex-col gap-0">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border/40 bg-[#22272e] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <PencilSimpleIcon weight="fill" className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display font-bold text-sm text-foreground leading-none">
                Edit API Spec
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 font-mono py-0 h-4">
                  v{version}
                </Badge>
                <span className="text-[10px] text-muted-foreground/50 font-mono">{lineCount} lines</span>
                <div className={`flex items-center gap-1 text-[10px] ${isValid ? "text-emerald-400" : "text-red-400"}`}>
                  {isValid
                    ? <><CheckCircleIcon weight="fill" className="h-3 w-3" />Valid JSON</>
                    : <><WarningIcon weight="fill" className="h-3 w-3" />Invalid JSON</>
                  }
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading || !isValid}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 h-8 text-xs shadow-lg shadow-primary/20"
          >
            {loading ? "Saving..." : (
              <>Save Changes <ArrowRightIcon className="h-3.5 w-3.5 ml-1.5" /></>
            )}
          </Button>
        </div>

        {/* Split editor */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* LEFT — editable textarea with line numbers */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-border/30">
            <div className="px-4 py-1.5 border-b border-border/30 bg-[#22272e] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Editor</span>
              <span className="text-[10px] text-muted-foreground/30 font-mono">openapi.json</span>
            </div>
            <div className="flex flex-1 min-h-0 overflow-hidden bg-[#22272e]">
              {/* Line numbers */}
              <div
                className="w-9 shrink-0 bg-[#1c2128] border-r border-border/20 overflow-hidden select-none"
                aria-hidden="true"
              >
                <div className="py-3">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div
                      key={i}
                      className="text-[10px] text-muted-foreground/20 font-mono text-right pr-2 leading-5"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              {/* Textarea */}
              <textarea
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                className="flex-1 bg-transparent text-foreground font-mono text-xs leading-5 px-3 py-3 resize-none outline-none overflow-auto w-full border-none focus:ring-0"
                spellCheck={false}
                style={{ caretColor: "oklch(0.62 0.22 265)" }}
              />
            </div>
          </div>

          {/* RIGHT — syntax highlighted preview */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-1.5 border-b border-border/30 bg-[#22272e] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">Preview</span>
              <span className="text-[10px] text-muted-foreground/30">Syntax highlighted</span>
            </div>
            <div className="flex-1 overflow-auto bg-[#22272e]">
              {preview ? (
                <div
                  className="p-3 text-xs leading-5 [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:font-mono [&>pre]:text-xs [&>pre]:leading-5"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <div className="p-3 text-[11px] text-muted-foreground/30 font-mono">
                  {spec ? "Rendering..." : "Start typing to see preview"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-border/40 bg-[#22272e] shrink-0 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground/40">
            Saved changes update the contract and regenerate all outputs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !isValid}
              size="sm"
              className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground px-4"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}