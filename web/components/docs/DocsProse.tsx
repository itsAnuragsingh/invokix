// components/docs/DocsProse.tsx
import { cn } from "@/lib/utils"

export function DocsProse({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        "prose prose-invert prose-sm max-w-none",
        // Headings
        "prose-h1:font-display prose-h1:text-3xl prose-h1:font-bold prose-h1:tracking-tight prose-h1:text-foreground prose-h1:mb-4",
        "prose-h2:font-display prose-h2:text-xl prose-h2:font-semibold prose-h2:text-foreground prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-6 prose-h2:border-t prose-h2:border-border/40",
        "prose-h3:font-display prose-h3:text-base prose-h3:font-semibold prose-h3:text-foreground prose-h3:mt-6 prose-h3:mb-3",
        // Body
        "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-sm",
        "prose-p:first-of-type:text-base",
        // Lead paragraph
        "[&_.lead]:text-base [&_.lead]:text-foreground/80 [&_.lead]:leading-relaxed [&_.lead]:font-normal",
        // Lists
        "prose-ul:text-muted-foreground prose-ul:text-sm prose-li:my-1",
        "prose-ol:text-muted-foreground prose-ol:text-sm",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Code inline
        "prose-code:text-primary prose-code:bg-primary/10 prose-code:border prose-code:border-primary/20 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
        // Strong
        "prose-strong:text-foreground prose-strong:font-semibold",
        // HR
        "prose-hr:border-border/40",
        className
      )}
    >
      {children}
    </article>
  )
}