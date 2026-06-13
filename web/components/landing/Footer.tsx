// components/landing/Footer.tsx
import Link from "next/link"
import { RobotIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr"

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Docs", href: "/docs" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Twitter / X", href: "#", external: true },
    { label: "GitHub", href: "#", external: true },
    { label: "Email us", href: "mailto:hello@invokix.com", external: true },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#060810]">
      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

        {/* Brand col — spans 2 on lg */}
        <div className="lg:col-span-2 space-y-5">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
              <RobotIcon weight="fill" size={18} className="text-indigo-400" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">Invokix</span>
          </Link>

          <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
            One contract. One source of truth. Your whole team in sync — forever.
          </p>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/15 rounded-full px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400/80 font-medium">All systems operational</span>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([group, links]) => (
          <div key={group} className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{group}</p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={"external" in link && link.external ? "_blank" : undefined}
                    rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors group"
                  >
                    {link.label}
                    {"external" in link && link.external && (
                      <ArrowUpRightIcon
                        size={11}
                        className="opacity-0 group-hover:opacity-60 transition-opacity"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Invokix. Built with ❤️ for API teams.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Terms
            </Link>
            <Link href="/about" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
