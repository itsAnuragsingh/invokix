// components/docs/DocsPageWrapper.tsx
import { cn } from "@/lib/utils"

export function DocsPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "[&_table]:w-full [&_table]:my-6 [&_table]:border-collapse",
"[&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-foreground [&_th]:px-4 [&_th]:py-2.5 [&_th]:border-b [&_th]:border-border/50 [&_th]:bg-muted/20",
"[&_td]:text-xs [&_td]:text-muted-foreground [&_td]:px-4 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-border/20",
"[&_tr:last-child_td]:border-0",
"[&_tr:hover_td]:bg-muted/10 [&_tr]:transition-colors",
        // Base text
        "text-sm text-muted-foreground leading-relaxed",
        // Headings
        "[&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:mb-4 [&_h1]:mt-0",
        "[&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pt-6 [&_h2]:border-t [&_h2]:border-border/40",
        "[&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3",
        // Paragraphs
        "[&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:my-3",
        // Lists
        "[&_ul]:my-3 [&_ul]:space-y-1.5 [&_ul]:list-disc [&_ul]:list-inside",
        "[&_ol]:my-3 [&_ol]:space-y-1.5 [&_ol]:list-decimal [&_ol]:list-inside",
        "[&_li]:text-sm [&_li]:text-muted-foreground [&_li]:leading-relaxed",
        // Inline code
        "[&_:not(pre)>code]:text-primary [&_:not(pre)>code]:bg-primary/10 [&_:not(pre)>code]:border [&_:not(pre)>code]:border-primary/20 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-xs [&_:not(pre)>code]:font-mono",
        // Strong
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        // Links
        "[&_a]:text-primary [&_a]:no-underline [&_a]:decoration-primary/30 hover:[&_a]:underline",
        // HR
        "[&_hr]:border-border/40 [&_hr]:my-8",
        // Blockquote
        "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground/70",
      )}
    >
      {children}
    </div>
  )
}