"use client"

import { cn } from "@/lib/utils"

type DocsImageCardProps = {
  src: string
  alt: string
  caption?: string
  className?: string
}

export function DocsImageCard({
  src,
  alt,
  caption,
  className,
}: DocsImageCardProps) {
  return (
    <figure className={cn("not-prose my-6 max-w-md mx-auto space-y-2", className)}>
      <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/40">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover block"
        />
      </div>

      {caption && (
        <figcaption className="text-center text-xs text-muted-foreground/75 leading-relaxed px-1">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}


