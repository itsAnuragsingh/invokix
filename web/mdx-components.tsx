// mdx-components.tsx
import type { MDXComponents } from "mdx/types"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4 mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-xl font-semibold text-foreground mt-10 mb-4 pt-6 border-t border-border/40">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-base font-semibold text-foreground mt-6 mb-3">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="text-sm text-muted-foreground leading-relaxed my-3">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="my-3 space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-3 space-y-1.5 list-decimal list-inside text-sm text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </li>
    ),

    code: ({ children, className }) => {
      if (className) return <code className={className}>{children}</code>
      return (
        <code className="text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 text-xs font-mono">
          {children}
        </code>
      )
    },

    pre: ({ children }) => <>{children}</>,

    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),

    hr: () => <hr className="border-border/40 my-8" />,

    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary/40 pl-4 my-4 text-sm text-muted-foreground/70 italic">
        {children}
      </blockquote>
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        className="text-primary no-underline hover:underline underline-offset-2"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),

    ...components,
  }
}