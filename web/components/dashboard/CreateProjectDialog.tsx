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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
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
                      ? "border-indigo-500 bg-indigo-500/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}
                >
                  <span className={stack === option.value ? "text-indigo-400" : "text-muted-foreground"}>
                    {option.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                  {stack === option.value && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}