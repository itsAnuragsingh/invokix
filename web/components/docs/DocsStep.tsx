// components/docs/DocsStep.tsx
type DocsStepProps = {
  step: number
  title: string
  children: React.ReactNode
  last?: boolean
}

export function DocsStep({ step, title, children, last = false }: DocsStepProps) {
  return (
    <div className="not-prose flex gap-6 my-2">
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0 pt-0.5">
        {/* Step number */}
        <div className="relative h-8 w-8 rounded-full bg-primary/10 border border-primary/30
          flex items-center justify-center shrink-0 z-10">
          <span className="text-xs font-bold text-primary font-mono">{step}</span>
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-sm" />
        </div>
        {/* Line */}
        {!last && (
          <div className="w-px flex-1 mt-2 min-h-[3rem] bg-gradient-to-b from-primary/20 to-border/20" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-10">
        <h3 className="text-base font-semibold text-foreground mb-4 mt-1 leading-tight">
          {title}
        </h3>
        <div className="space-y-3
          [&_p]:text-sm [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:my-0
          [&_ul]:space-y-2 [&_ul]:list-none [&_ul]:pl-0 [&_ul]:my-3
          [&_li]:text-sm [&_li]:text-muted-foreground [&_li]:leading-relaxed
          [&_li]:flex [&_li]:items-start [&_li]:gap-2
          [&_li]:before:content-['→'] [&_li]:before:text-primary/50 [&_li]:before:shrink-0 [&_li]:before:mt-0.5
          [&_strong]:font-semibold [&_strong]:text-foreground
          [&_a]:text-primary [&_a]:no-underline [&_a]:decoration-primary/30 hover:[&_a]:underline
          [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:border [&_code]:border-primary/20
          [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono
        ">
          {children}
        </div>
      </div>
    </div>
  )
}