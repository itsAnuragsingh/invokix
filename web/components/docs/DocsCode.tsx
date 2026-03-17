// components/docs/DocsCode.tsx
"use client"

import { useEffect, useRef } from "react"
import Prism from "prismjs"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-json"
import "prismjs/components/prism-yaml"
import "prismjs/components/prism-css"
import { CopyDocsCode } from "@/components/docs/CopyDocsCode"

type DocsCodeProps = {
  children: string
  lang?: string
  title?: string
}

export function DocsCode({ children, lang = "typescript", title }: DocsCodeProps) {
  const code = String(children).trim()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current)
    }
  }, [code, lang])

  const prismLang = lang === "text" ? "plain" : lang

  return (
    <div className="not-prose my-5 rounded-xl border border-white/[0.08] overflow-hidden select-none">

      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1c2128] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {title ?? (lang !== "text" ? lang : "")}
          </span>
        </div>
        <CopyDocsCode code={code} />
      </div>

      {/* Code block */}
      <div className="overflow-x-auto bg-[#22272e]">
        <pre className="!m-0 !p-4 !bg-transparent !text-xs !leading-relaxed !outline-none !border-none !shadow-none">
          <code
            ref={ref}
            className={`language-${prismLang} !bg-transparent !text-xs !font-mono border-none`}
          >
            {code}
          </code>
        </pre>
      </div>

    </div>
  )
}