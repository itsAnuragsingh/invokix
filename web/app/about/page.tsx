// app/about/page.tsx
import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { RobotIcon, ArrowRightIcon, GithubLogoIcon, EnvelopeIcon } from "@phosphor-icons/react/dist/ssr"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — Invokix",
  description: "Learn the story behind Invokix — why we built it, who we are, and what we believe about API development.",
}

const TEAM = [
  {
    name: "Anurag Singh",
    role: "Founder & CEO",
    bio: "Full-stack engineer frustrated by Postman docs drifting out of sync the day after they were written. Built Invokix to fix that.",
    avatar: "AS",
    color: "from-indigo-500 to-violet-500",
  },
]

const VALUES = [
  {
    icon: "⚡",
    title: "Speed without chaos",
    body: "APIs should move fast. That doesn't mean consumers should be blindsided. We give teams the tools to ship fast and communicate changes instantly.",
  },
  {
    icon: "🔗",
    title: "One source of truth",
    body: "No more Postman collections, Notion pages, Slack threads, and GitHub specs all saying different things. One contract, always current.",
  },
  {
    icon: "🤝",
    title: "Built for teams",
    body: "Great APIs aren't written in isolation. Invokix keeps your backend and frontend teams on the same page — automatically.",
  },
  {
    icon: "🛡️",
    title: "Safety by default",
    body: "Breaking changes happen. We catch them before they reach production and alert the right people before any consumer is impacted.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs text-indigo-300 font-medium">Our story</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            We got tired of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              stale API docs.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Invokix started with a simple frustration — every time an API changed, half the team was out of the loop.
            Postman didn&apos;t know. Notion was stale. Slack had a buried thread. We built the fix.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-white/5 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70">Our mission</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-snug">
                Give every API<br />a permanent home.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                We believe that a well-documented, always-in-sync API contract is one of the highest-leverage
                investments an engineering team can make. Fewer bugs, fewer broken integrations, faster onboarding —
                all from a single source of truth.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Invokix is the platform that makes that easy — not just for the API author, but for every
                developer and team that consumes it.
              </p>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl border border-white/8 bg-white/2 p-8 space-y-6">
              {[
                { label: "Breaking changes caught", value: "99%", color: "text-emerald-400" },
                { label: "Average sync time", value: "< 2s", color: "text-indigo-400" },
                { label: "Types generated", value: "2.1M+", color: "text-violet-400" },
                { label: "Developer hours saved / week", value: "~8h", color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-zinc-400">{stat.label}</span>
                  <span className={`font-display font-bold text-xl ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-white/5 py-20 sm:py-28 px-4 sm:px-6 bg-white/1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">What we believe</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Our values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-white/8 bg-white/2 p-7 space-y-3 hover:border-indigo-500/20 transition-colors group">
                <div className="text-2xl">{v.icon}</div>
                <h3 className="font-semibold text-white text-lg">{v.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-white/5 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">The people</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Who built this</h2>
          </div>

          <div className="flex justify-center">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center space-y-4 max-w-sm">
                <div className={`h-40 w-40 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto shadow-2xl`}>
                  <span className="font-display font-bold text-2xl text-white"><img src="https://ik.imagekit.io/itsanurag/invokix/founder.png" alt="" /></span>
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{member.name}</p>
                  <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mt-1">{member.role}</p>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mx-auto">
            <RobotIcon weight="fill" size={28} className="text-indigo-400" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Join us on the journey</h2>
          <p className="text-zinc-400 leading-relaxed">
            We&apos;re just getting started. If you believe APIs deserve a better home, come build with us.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xl shadow-indigo-500/30 transition-colors"
            >
              Get started free <ArrowRightIcon size={15} />
            </Link>
            <a
              href="mailto:hello@invokix.com"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <EnvelopeIcon size={15} /> Say hello
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
