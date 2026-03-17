// components/editor/GenerateFromText.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { SparkleIcon, CodeIcon, LightningIcon, ArrowRightIcon, PlusCircleIcon } from "@phosphor-icons/react"

type GenerateFromTextProps = {
  projectId: string
  hasExistingContract?: boolean
  trigger?: React.ReactNode
}

const EXAMPLE_PROMPT = `Orders API — users can create orders, view history, and cancel pending orders. Each order has line items, total price, and status (pending, shipped, delivered). JWT auth. Razorpay payments.`

export function GenerateFromText({ projectId, hasExistingContract = false, trigger }: GenerateFromTextProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [plainEnglish, setPlainEnglish] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const isExtendMode = hasExistingContract

  async function handleGenerate(type: "text" | "code") {
    const content = type === "text" ? plainEnglish : code
    if (!content.trim()) {
      toast.error(type === "text" ? "Describe your API first" : "Paste your route code first")
      return
    }

    setLoading(true)
    try {
      const endpoint = type === "text" ? "/api/generate" : "/api/import/code"
      const bodyKey = type === "text" ? "plainEnglish" : "code"

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, [bodyKey]: content }),
      })

      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Generation failed"); return }

      const mode = json.data?.mode
      if (mode === "merged") toast.success("New endpoints added to your contract")
      else if (mode === "replaced") toast.success("Contract generated")
      else toast.success("Contract created")

      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
            <SparkleIcon className="h-3.5 w-3.5 mr-1.5" />
            {isExtendMode ? "Extend with AI" : "Generate with AI"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-card border-border/50 p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <LightningIcon weight="fill" className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display font-bold text-base text-foreground flex items-center gap-2">
                {isExtendMode ? "Extend API Contract" : "Generate API Contract"}
                {isExtendMode && (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                    <PlusCircleIcon className="h-2.5 w-2.5 mr-1" />
                    Extend mode — existing endpoints safe
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isExtendMode
                  ? "Describe new endpoints to add — existing ones will never be removed"
                  : "Describe your API or paste route code — get a full OpenAPI spec in seconds"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <Tabs defaultValue="text">
            <TabsList className="mb-4 bg-muted/40 border border-border/40">
              <TabsTrigger value="text" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <SparkleIcon className="h-3.5 w-3.5" />
                Plain English
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CodeIcon className="h-3.5 w-3.5" />
                Route Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3 mt-0">
              <div className="relative">
                <Textarea
                  placeholder={isExtendMode
                    ? "Describe the new endpoints to add..."
                    : "Describe your API in plain English..."}
                  className="min-h-40 resize-none bg-muted/30 border-border/50 font-sans text-sm placeholder:text-muted-foreground/40 focus-visible:ring-primary/30"
                  value={plainEnglish}
                  onChange={(e) => setPlainEnglish(e.target.value)}
                />
              </div>
              {!isExtendMode && (
                <button
                  type="button"
                  onClick={() => setPlainEnglish(EXAMPLE_PROMPT)}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                >
                  Use example prompt →
                </button>
              )}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
                    Groq Llama 4
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">~3 seconds</span>
                </div>
                <Button
                  onClick={() => handleGenerate("text")}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-6"
                >
                  {loading ? (
                    <>
                      <SparkleIcon className="h-4 w-4 mr-2 animate-spin" />
                      {isExtendMode ? "Extending..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      {isExtendMode ? "Add Endpoints" : "Generate Contract"}
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-3 mt-0">
              <Textarea
                placeholder="Paste your Express.js or Next.js route code here..."
                className="min-h-40 resize-none bg-muted/30 border-border/50 font-mono text-xs placeholder:text-muted-foreground/40 focus-visible:ring-primary/30"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
                    Groq Llama 4
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">~4 seconds</span>
                </div>
                <Button
                  onClick={() => handleGenerate("code")}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-6"
                >
                  {loading ? (
                    <>
                      <CodeIcon className="h-4 w-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      Extract from Code
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}