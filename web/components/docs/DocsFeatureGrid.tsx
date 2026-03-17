// components/docs/DocsFeatureGrid.tsx
import {
  DownloadSimpleIcon,
  CodeIcon,
  ShieldWarningIcon,
  BellRingingIcon,
  FlaskIcon,
  ClockCounterClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr"

const FEATURES = [
  {
    icon: DownloadSimpleIcon,
    title: "Import any API",
    desc: "Paste an OpenAPI spec, a Postman collection, or describe your API in plain English. Your contract is ready in seconds.",
    href: "/docs/import/openapi",
  },
  {
    icon: CodeIcon,
    title: "Generate all code outputs",
    desc: "TypeScript types, React Query v5 hooks, Zod schemas, and React Native hooks — all generated instantly from your contract.",
    href: "/docs/codegen/types",
  },
  {
    icon: ShieldWarningIcon,
    title: "Block breaking changes",
    desc: "Before you publish, Invokix tells you exactly which teams will break and which files need updating.",
    href: "/docs/breaking-changes",
  },
  {
    icon: BellRingingIcon,
    title: "Alert your team instantly",
    desc: "Slack, Discord, and email alerts the moment a contract changes — with the exact file and line number that needs updating.",
    href: "/docs/slack-alerts",
  },
  {
    icon: FlaskIcon,
    title: "Live mock server",
    desc: "A mock server starts automatically when you publish. Build against real endpoints before your backend exists.",
    href: "/docs/mock-server",
  },
  {
    icon: ClockCounterClockwiseIcon,
    title: "Full version history",
    desc: "Every publish creates a snapshot. Visual diffs, one-click rollback, and an auto-generated changelog on every release.",
    href: "/docs/versions",
  },
]

export function DocsFeatureGrid() {
  return (
    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
      {FEATURES.map(({ icon: Icon, title, desc, href }) => (
        <a
          key={title}
          href={href}
          className="group rounded-xl border border-border/50 bg-card/30 p-4
            hover:border-primary/30 hover:bg-card/60 transition-all duration-150"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="mt-0.5 h-7 w-7 rounded-lg bg-primary/10 border border-primary/20
              flex items-center justify-center shrink-0
              group-hover:bg-primary/15 group-hover:border-primary/30 transition-all">
              <Icon size={14} weight="duotone" className="text-primary" />
            </div>

            {/* Text */}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}