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
          <CheckIcon size={11} className="text-[#B7FF3C]" />
          <span className="text-[#B7FF3C] font-mono font-bold">Copied</span>
        </>
      ) : (
        <>
          <CopyIcon size={11} />
          <span className="font-mono">Copy</span>
        </>
      )}
    </button>
  )
}