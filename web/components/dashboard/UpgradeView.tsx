"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  CheckCircle,
  X,
  Sparkle,
  Zap,
  ShieldCheck,
  RotateCcw,
  Cpu,
  Layers,
  BellRing,
  Key,
  Users,
  Code2,
  FileCheck,
  ArrowRight,
  HelpCircle,
  CreditCard,
  ExternalLink,
  Lock,
} from "lucide-react"
import type { PlanName } from "@/lib/plans/limits"
import { authClient } from "@/lib/auth/client"
import { isBillingEnabledForUser } from "@/lib/plans/access"

type Props = {
  currentPlan: PlanName
  userEmail: string
  userName: string
  isBillingEnabled?: boolean
}

export function UpgradeView({ currentPlan, userEmail, userName, isBillingEnabled }: Props) {
  const [currency, setCurrency] = useState<"usd" | "inr">("usd")
  const [loading, setLoading] = useState(false)

  const [isSuccess, setIsSuccess] = useState(false)

  // Auto-detect India user via real IP (or ?geo=us / ?geo=in for testing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("success") === "true") {
      setIsSuccess(true)
    }

    const testGeo = params.get("geo") || params.get("country")
    const url = testGeo ? `/api/geo?geo=${testGeo}` : "/api/geo"

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCurrency(data?.isIndia ? "inr" : "usd")
      })
      .catch(() => {
        setCurrency("usd")
      })
  }, [])

  const priceDisplay = currency === "inr" ? "₹499" : "$9"
  const isPro = currentPlan === "pro" || currentPlan === "team"

  async function handleUpgrade() {
    setLoading(true)
    try {
      const client = authClient as any

      if (client?.dodopayments?.checkoutSession) {
        const { data, error } = await client.dodopayments.checkoutSession({
          slug: "pro",
        })

        if (error) {
          throw new Error(error.message || "Checkout session failed")
        }

        if (data?.url) {
          window.location.href = data.url
        }
      } else {
        alert("Payment gateway initializing. Please try again in a moment.")
      }
    } catch (err: any) {
      console.error("[dodo-checkout-error]", err)
      alert(err?.message || "Failed to initiate checkout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const [portalLoading, setPortalLoading] = useState(false)

  async function handleOpenPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Could not open billing portal")
      }
    } catch (err: any) {
      alert("Failed to connect to billing portal.")
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-16 animate-fade-up">
      {/* Success Alert */}
      {isSuccess && (
        <div className="mx-auto max-w-2xl mt-4 mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <div className="text-sm">
            <strong className="font-semibold text-white">Payment successful!</strong> Your workspace is now upgraded to Pro. Enjoy unlimited contracts and full safety tools.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center pt-4 pb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
          <Sparkle className="h-3.5 w-3.5" />
          <span>Simple, predictable pricing</span>
        </div>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Upgrade your workspace.
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
          Choose the release velocity that matches your engineering team. Unlock automated safety, live mocking, and unlimited contracts.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* FREE CARD */}
        <div className="relative flex flex-col rounded-2xl border border-border/60 bg-card/40 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">Free</h3>
              <p className="mt-1 text-xs text-muted-foreground">For solo builders and exploring Invokix</p>
            </div>
            {!isPro && (
              <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                Current Plan
              </span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-display text-5xl font-bold text-foreground">
              {currency === "inr" ? "₹0" : "$0"}
            </span>
            <span className="text-sm text-muted-foreground font-medium">/ month</span>
          </div>

          <p className="mt-2 text-xs font-mono text-muted-foreground">Free forever · No credit card required</p>

          <ul className="mt-8 space-y-3.5 text-sm flex-1">
            <li className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span><strong>3 API contracts</strong></span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span><strong>3 team members</strong> per project</span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span><strong>25 AI contract generations</strong> / month</span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Full CLI access (<code className="text-xs">npx invokix pull</code>)</span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Types, Zod schemas & React hooks codegen</span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Up to <strong>5 CLI API tokens</strong></span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Last 5 versions history & public share page</span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground/45">
              <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              <span>No breaking change CI/CD gate</span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground/45">
              <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              <span>No 1-click version rollbacks</span>
            </li>
            <li className="flex items-center gap-3 text-muted-foreground/45">
              <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              <span>No live mock server & validator</span>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-border/40">
            <button
              disabled
              className="w-full rounded-xl border border-border/80 bg-muted/40 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-default select-none"
            >
              {!isPro ? "Current Plan" : "Included"}
            </button>
          </div>
        </div>

        {/* PRO CARD */}
        <div className="relative flex flex-col rounded-2xl border-2 border-[#B7FF3C] bg-gradient-to-b from-[#18122B] to-[#0E0A1B] p-8 shadow-[0_0_35px_rgba(183,255,60,0.15)]">
          {/* Top Pill */}
          <div className="absolute -top-3.5 right-6 rounded-full bg-[#B7FF3C] px-3.5 py-1 text-[11px] font-bold text-[#10100B] shadow-md uppercase tracking-wider flex items-center gap-1">
            <Sparkle className="h-3 w-3 fill-current" />
            Recommended
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                Pro
                <span className="rounded-md bg-[#B7FF3C]/15 border border-[#B7FF3C]/30 px-2 py-0.5 text-[10px] font-mono font-bold text-[#B7FF3C]">
                  Full Access
                </span>
              </h3>
              <p className="mt-1 text-xs text-white/70">For growing teams and production APIs</p>
            </div>
            {isPro && (
              <span className="rounded-full border border-[#B7FF3C]/40 bg-[#B7FF3C]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#B7FF3C]">
                Active Plan
              </span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-display text-5xl font-bold text-white">
              {priceDisplay}
            </span>
            <span className="text-sm text-white/60 font-medium">/ month</span>
          </div>

          <p className="mt-2 text-xs font-mono text-[#B7FF3C]">
            All features unlocked · Cancel anytime in 1 click
          </p>

          <ul className="mt-8 space-y-3.5 text-sm flex-1">
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>Unlimited API contracts</strong></span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>10 team members</strong></span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>500 AI contract generations</strong> / month</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>Breaking change CI/CD gate</strong> (diff detection)</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>1-Click version rollback</strong> & unlimited history</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>Live mock server proxy</strong> & API response validator</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>Multi-environments</strong> (Dev, Staging, Prod)</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>Slack & Discord webhook alerts</strong></span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span><strong>Unlimited CLI API tokens</strong> (CI/CD automated sync)</span>
            </li>
            <li className="flex items-center gap-3 text-white font-medium">
              <CheckCircle className="h-4 w-4 shrink-0 text-[#B7FF3C]" />
              <span>Consumer tracking map & contract health analytics</span>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-white/10">
            {isPro ? (
              <div className="space-y-2.5">
                <button
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="w-full rounded-xl bg-[#B7FF3C] py-3.5 text-xs font-bold uppercase tracking-wider text-[#10100B] shadow-[0_4px_16px_rgba(183,255,60,0.35)] transition-all hover:bg-[#c6ff62] hover:shadow-[0_6px_22px_rgba(183,255,60,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{portalLoading ? "Opening Billing Portal..." : "Manage Subscription & Invoices"}</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </button>
                <p className="text-center text-[11px] font-mono text-white/60">
                  1-click cancel auto-pay · Download GST invoices · Update card
                </p>
              </div>
            ) : (isBillingEnabled !== undefined ? isBillingEnabled : isBillingEnabledForUser(userEmail)) ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full rounded-xl bg-[#B7FF3C] py-3.5 text-xs font-bold uppercase tracking-wider text-[#10100B] shadow-[0_4px_16px_rgba(183,255,60,0.35)] transition-all hover:bg-[#c6ff62] hover:shadow-[0_6px_22px_rgba(183,255,60,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>{loading ? "Preparing checkout..." : `Upgrade to Pro (${priceDisplay}/mo)`}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full rounded-xl border border-white/20 bg-white/5 py-3.5 text-xs font-bold uppercase tracking-wider text-white/50 cursor-not-allowed select-none flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4 text-white/40" />
                  <span>Pro Launching Soon (Private Beta)</span>
                </button>
                <p className="text-center text-[11px] text-white/50">
                  Paid plans are currently in private preview for our testing team.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">
          Detailed feature breakdown
        </h2>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="py-4 px-6 font-semibold text-foreground">Feature</th>
                <th className="py-4 px-6 font-semibold text-muted-foreground w-36 text-center">Free</th>
                <th className="py-4 px-6 font-semibold text-primary w-40 text-center">Pro ({priceDisplay})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono text-xs">
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  API Contracts
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground">3</td>
                <td className="py-3.5 px-6 text-center text-primary font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Team Members per project
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground">3</td>
                <td className="py-3.5 px-6 text-center text-primary font-bold">10</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  Monthly AI Generations
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground">25</td>
                <td className="py-3.5 px-6 text-center text-primary font-bold">500</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  CLI API Tokens
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground">5</td>
                <td className="py-3.5 px-6 text-center text-primary font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  Types, Zod & Hooks Codegen
                </td>
                <td className="py-3.5 px-6 text-center text-emerald-400">Yes</td>
                <td className="py-3.5 px-6 text-center text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Breaking-Change CI Gate
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground/40">—</td>
                <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">Yes</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  1-Click Version Rollback
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground/40">—</td>
                <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">Yes</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  Live Mock Server & Validator
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground/40">—</td>
                <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">Yes</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  Environments (Dev / Staging / Prod)
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground/40">1 (Dev)</td>
                <td className="py-3.5 px-6 text-center text-primary font-bold">3 (All)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-sans text-foreground font-medium flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-muted-foreground" />
                  Slack & Discord Alerts
                </td>
                <td className="py-3.5 px-6 text-center text-muted-foreground/40">—</td>
                <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
