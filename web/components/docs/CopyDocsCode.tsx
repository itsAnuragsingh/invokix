// components/docs/CopyDocsCode.tsx
"use client"

import { useState } from "react"
import { CopyIcon, CheckIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

export function CopyDocsCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[11px] text-zinc-600
        hover:text-zinc-400 transition-colors"
    >
      {copied ? (
        <>
          <CheckIcon size={11} className="text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <CopyIcon size={11} />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}