// app/page.tsx
import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { HeroTerminal } from "@/components/landing/HeroTerminal"
import { PricingCard } from "@/components/landing/PricingCard"
import { Button } from "@/components/ui/button"
import { CodegenShowcase } from "@/components/landing/CodegenShowcase"
import { BreakingChangeDemo } from "@/components/landing/BreakingChangeDemo"
import { HealthScoreDemo } from "@/components/landing/HealthScoreDemo"
import { SlackAlertDemo } from "@/components/landing/SlackAlertDemo"

import { BeamCard } from "@/components/landing/BeamCard"
import { FloatingCode } from "@/components/landing/FloatingCode"
import {
  ArrowRightIcon,
  WarningIcon,
  HeartbeatIcon,
  UsersThreeIcon,
  LightningIcon,
  CodeIcon,
  GitBranchIcon,
  CheckIcon,
  XIcon,
  RobotIcon
} from "@phosphor-icons/react/dist/ssr"
import { ProblemStory } from "@/components/landing/ProblemStory"
import { AIGeneratorDemo } from "@/components/landing/AIGeneratorDemo"
import { WatchDemoButton } from "@/components/landing/WatchDemoButton"
import { Footer } from "@/components/landing/Footer"
import { ScrollProgress } from "@/components/landing/ScrollProgress"
import { FAQ } from "@/components/landing/FAQ"


// ── Feature visuals ──────────────────────────────────────────────────────────

function BreakingChangeVisual() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 font-mono text-xs space-y-2">
      <div className="flex items-center gap-2 text-amber-400 font-semibold mb-3">
        <WarningIcon size={14} weight="fill" />
        Breaking Change Detected
      </div>
      <div className="flex items-center gap-2 text-red-400">
        <XIcon size={12} weight="bold" />
        <span className="line-through text-zinc-500">totalAmount</span>
        <span className="text-zinc-500">→</span>
        <span>price</span>
      </div>
      <div className="flex items-center gap-2 text-red-400">
        <XIcon size={12} weight="bold" />
        <span className="line-through text-zinc-500">userDetails</span>
        <span className="text-zinc-500">→</span>
        <span>user</span>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 text-zinc-500 space-y-1">
        <div>→ Shruti's Frontend Team <span className="text-amber-400/70">affected</span></div>
        <div>→ Rahul's Mobile Team <span className="text-amber-400/70">affected</span></div>
      </div>
    </div>
  )
}

function HealthScoreVisual() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Contract Health</span>
        <span className="font-display font-bold text-2xl text-emerald-400">76</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full w-[76%] bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" />
      </div>
      <div className="space-y-1.5 text-xs">
        {[
          { text: "GET /orders — missing 401 schema", color: "text-amber-400" },
          { text: "3 fields have no description", color: "text-amber-400" },
          { text: "Deprecated field without sunset date", color: "text-red-400" },
        ].map((issue) => (
          <div key={issue.text} className={`flex items-center gap-1.5 ${issue.color}`}>
            <span>⚠</span>
            <span className="text-zinc-400">{issue.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConsumerVisual() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-2 font-mono text-xs">
      {[
        { name: "Shruti — Frontend", version: "v1.2", days: "2d ago", color: "text-emerald-400" },
        { name: "Rahul — Mobile", version: "v1.1", days: "1d ago", color: "text-amber-400" },
        { name: "PayCo — Partner", version: "v1.0", days: "5d ago", color: "text-red-400" },
      ].map((c) => (
        <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-white/4 last:border-0">
          <span className="text-zinc-300">{c.name}</span>
          <div className="flex items-center gap-2">
            <span className={`${c.color} text-[10px]`}>{c.version}</span>
            <span className="text-zinc-600">{c.days}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Comparison table ─────────────────────────────────────────────────────────

const COMPARE_ROWS = [
  { feature: "TypeScript types", free: true, invokix: true },
  { feature: "React Query v5 hooks", free: false, invokix: true },
  { feature: "Zod schemas", free: false, invokix: true },
  { feature: "Breaking change gate", free: false, invokix: true },
  { feature: "Team change alerts", free: false, invokix: true },
  { feature: "Consumer tracking", free: false, invokix: true },
  { feature: "Contract health score", free: false, invokix: true },
  { feature: "Auto changelog", free: false, invokix: true },
  { feature: "Always in sync", free: false, invokix: true },
]

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Explore Invokix at your own pace. No card required.",
    features: [
      "1 API contract",
      "2 team members",
      "10 AI generations / month",
      "Last 3 versions",
      "Shareable contract page",
    ],
    cta: "Get started free",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "Everything your team needs to ship APIs with confidence.",
    features: [
      "Unlimited API contracts",
      "Up to 10 team members",
      "250 AI generations / month",
      "Full version history & one-click rollback",
      "Breaking change gate",
      "Mock server & API validator",
      "Basic Environment manager — dev, staging, prod",
      "Slack & Discord alerts",
      "Consumer tracking",
      "CLI — npx invokix pull",
      "Email support",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/mo",
    description: "Built for growing teams that need scale and control.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Unlimited AI generations",
      "Multiple workspaces",
      "Role-based access control",
      "Contract analytics",
      "Custom Slack & Discord templates",
      "Fast-track email support",
    ],
    cta: "Join the waitlist",
    comingSoon: true,
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white overflow-x-hidden">
      <ScrollProgress />
    
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-[80px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
          <FloatingCode />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs text-indigo-300 font-medium">Your API's home — v1.0 now live</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Your API has{" "}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                    no home.
                  </span>
                </span>
                <br />
                <span className="text-zinc-300">We fixed that.</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-lg">
                Describe your API in plain English — AI generates TypeScript types, React Query hooks,
                and Zod schemas in seconds. One contract. Your whole team in sync. Forever.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 px-6 sm:px-7 h-11 text-sm font-semibold">
                  Get started free
                  <ArrowRightIcon size={16} className="ml-2" />
                </Button>
              </Link>
              <WatchDemoButton />
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2">
              {[
                "No credit card required",
                "Free forever plan",
                "Setup in 2 minutes",
              ].map((text) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <CheckIcon size={12} weight="bold" className="text-emerald-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — terminal */}
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-500/5 rounded-3xl blur-2xl" />
            <div className="relative">
              <HeroTerminal />
            </div>
          </div>
        </div>
      </section>


      {/* ── Problem ── */}

      <section className="relative py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">The problem</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Your API lives in 7 places.
              <br />
              <span className="text-zinc-500">Zero single truth.</span>
            </h2>
          </div>

          {/* Ticker */}
          <div className="relative overflow-hidden mb-16 py-3">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#080A0F] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#080A0F] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-4 animate-[ticker_18s_linear_infinite]">
              {[
                "📄 Notion — stale docs",
                "📬 Postman — siloed per dev",
                "💬 Slack — forgotten instantly",
                "📁 GitHub — buried spec",
                "📧 Email — drifts immediately",
                "🤷 Memory — did I tell Shruti?",
                "📄 Notion — stale docs",
                "📬 Postman — siloed per dev",
                "💬 Slack — forgotten instantly",
                "📁 GitHub — buried spec",
                "📧 Email — drifts immediately",
                "🤷 Memory — did I tell Shruti?",
              ].map((item, i) => (
                <div
                  key={i}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-white/6 bg-white/3 text-xs text-zinc-400 whitespace-nowrap"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Animated story */}
          <ProblemStory />
        </div>
      </section>

      {/* ── Features ── */}
      {/* ── Interactive demos ── */}
      
    <section id="features" className="py-20 sm:py-28 border-t border-white/5 space-y-20 sm:space-y-28">
        <AIGeneratorDemo/>
        <CodegenShowcase />
       
        <BreakingChangeDemo />
        <HealthScoreDemo />
        <SlackAlertDemo />
      </section>

      <section className="py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">vs free tools</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Free tools generate once.
              <br />
              <span className="text-zinc-400">Then go silent.</span>
            </h2>
          </div>

          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <div className="grid grid-cols-3 px-4 sm:px-6 py-3 border-b border-white/5 bg-white/2">
              <span className="text-xs font-semibold text-zinc-400">Capability</span>
              <span className="text-xs font-semibold text-zinc-500 text-center">Free CLI</span>
              <span className="text-xs font-semibold text-indigo-400 text-center">Invokix</span>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 px-4 sm:px-6 py-3 sm:py-3.5 border-b border-white/4 last:border-0 ${i % 2 === 0 ? "bg-white/1" : ""
                  }`}
              >
                <span className="text-xs sm:text-sm text-zinc-300 pr-2">{row.feature}</span>
                <span className="text-center">
                  {row.free
                    ? <CheckIcon size={16} weight="bold" className="text-zinc-500 mx-auto" />
                    : <XIcon size={16} weight="bold" className="text-zinc-700 mx-auto" />
                  }
                </span>
                <span className="text-center">
                  <CheckIcon size={16} weight="bold" className="text-indigo-400 mx-auto" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 sm:py-28 border-t border-white/5 bg-white/1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple. Flat. No per-seat nonsense.
            </h2>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING_PLANS.map((plan, i) => (
              <PricingCard key={plan.name} index={i} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── Final CTA ── */}
      <section className="relative py-28 sm:py-36 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center mx-auto">
            <RobotIcon weight="fill" size={28} className="text-indigo-400" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
            Give your API
            <br />
            a home.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            One contract. One source of truth. One alert system.
            For your whole team. Forever.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30 px-7 sm:px-9 h-12 text-sm font-semibold">
                Start for free
                <ArrowRightIcon size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-zinc-600">No credit card required · Free forever plan · Setup in 2 minutes</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}