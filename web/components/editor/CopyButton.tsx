// components/editor/CopyButton.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

type CopyButtonProps = {
  content: string
}

export function CopyButton({ content }: CopyButtonProps) {
  function handleCopy() {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
      <Copy className="h-3 w-3" />
    </Button>
  )
}