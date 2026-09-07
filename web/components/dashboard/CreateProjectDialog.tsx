// components/dashboard/CreateProjectDialog.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { AtomIcon, Plus } from "lucide-react"
import {
  
  DeviceMobileIcon,
  TerminalIcon,
  CirclesThreeIcon,
  AngularLogoIcon,
} from "@phosphor-icons/react"

type Stack = "nextjs" | "react-native" | "express" | "angular" | "other"

const STACK_OPTIONS: {
  value: Stack
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    value: "nextjs",
    label: "Next.js / React",
    description: "Types + React Query v5 + Zod",
    icon: <AtomIcon size={18} />,
  },
  {
    value: "react-native",
    label: "React Native",
    description: "Types + Native hooks + Zod",
    icon: <DeviceMobileIcon size={18} />,
  },
  {
    value: "express",
    label: "Express / Node",
    description: "Types + Zod only",
    icon: <TerminalIcon size={18} />,
  },
  {
    value: "angular",
    label: "Angular",
    description: "Types + Zod only",
    icon: <AngularLogoIcon size={18} />,
  },
  {
    value: "other",
    label: "Other",
    description: "Types + Zod only",
    icon: <CirclesThreeIcon size={18} />,
  },
]

export function CreateProjectDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [stack, setStack] = useState<Stack>("nextjs")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, stack }),
      })

      const json = await res.json()

      if (!json.success) {
        toast.error(json.error ?? "Could not create project")
        return
      }

      toast.success("Project created!")
      setOpen(false)
      setName("")
      setDescription("")
      setStack("nextjs")
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
        <Button className="group h-9 px-4 text-xs font-bold tracking-wide bg-foreground text-background hover:bg-foreground/95 border border-foreground/30 shadow-[3px_3px_0_rgba(183,255,60,0.9)] hover:shadow-[5px_5px_0_rgba(183,255,60,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all duration-150 rounded-lg flex items-center gap-2">
          <span className="grid h-4 w-4 place-items-center rounded bg-background/20 group-hover:rotate-90 transition-transform duration-200">
            <Plus className="h-3 w-3 stroke-[3]" />
          </span>
          <span>New Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            A project holds your API contract, generated code, and team settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              placeholder="Orders API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Handles order creation, history, and cancellation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Stack</Label>
            <div className="grid grid-cols-1 gap-2">
              {STACK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStack(option.value)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all ${
                    stack === option.value
                      ? "border-[#B7FF3C] bg-[#B7FF3C]/10 text-foreground shadow-[2px_2px_0_rgba(183,255,60,0.3)]"
                      : "border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  <span className={stack === option.value ? "text-[#B7FF3C]" : "text-muted-foreground"}>
                    {option.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground/70">{option.description}</span>
                  </span>
                  {stack === option.value && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF3C] shadow-[0_0_8px_#B7FF3C] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border/60 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-foreground text-background font-bold text-xs hover:bg-foreground/90 shadow-[2px_2px_0_rgba(183,255,60,0.9)]">
              {loading ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}