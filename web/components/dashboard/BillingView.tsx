"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  CreditCard,
  ExternalLink,
  Sparkle,
  CheckCircle,
  Zap,
  Layers,
  Key,
  Users,
  ShieldCheck,
  FileText,
  AlertCircle,
  ArrowRight,
  Download,
  Lock,
} from "lucide-react"
import type { PlanName, PlanLimits } from "@/lib/plans/limits"
import { isBillingEnabledForUser } from "@/lib/plans/access"

type Invoice = {
  id: string
  amount: string
  currency: string
  status: string
  created_at: string
}

type Props = {
  currentPlan: PlanName
  limits: PlanLimits
  usage: {
    contracts: number
    aiGenerations: number
  }
  userEmail: string
  userName: string
  expiresAt: string | null
  isBillingEnabled?: boolean
}

export function BillingView({
  currentPlan,
  limits,
  usage,
  userEmail,
  userName,
  expiresAt,
  isBillingEnabled,
}: Props) {
  const [portalLoading, setPortalLoading] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const isPro = currentPlan === "pro" || currentPlan === "team"

  useEffect(() => {
    fetch("/api/billing/invoices")
      .then((res) => (res.ok ? res.json() : { invoices: [] }))
      .then((data) => {
        setInvoices(data.invoices || [])
      })
      .catch(() => {
        setInvoices([])
      })
      .finally(() => {
        setInvoicesLoading(false)
      })
  }, [])

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
    } catch {
      alert("Failed to connect to billing portal.")
    } finally {
      setPortalLoading(false)
    }
  }

  // Calculate percentage for progress bars
  const contractPct = limits.maxContracts === Infinity
    ? 15
    : Math.min(100, Math.round((usage.contracts / limits.maxContracts) * 100))

  const aiPct = limits.maxAiGenerationsPerMonth === Infinity
    ? 10
    : Math.min(100, Math.round((usage.aiGenerations / limits.maxAiGenerationsPerMonth) * 100))

  return (
    <div className="mx-auto max-w-5xl pb-16 animate-fade-up">
      {/* Header */}
      <div className="pt-4 pb-8 border-b border-border/40">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Billing & Subscription
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage your Invokix subscription, monitor workspace usage, and download official invoices.
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        {/* Current Plan Overview Card (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                  Current Plan
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {isPro ? "Invokix Pro" : "Free Plan"}
                  </h2>
                  <span
                    className={
                      isPro
                        ? "rounded-full bg-[#B7FF3C]/15 border border-[#B7FF3C]/30 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#B7FF3C]"
                        : "rounded-full bg-muted border border-border/60 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-muted-foreground"
                    }
                  >
                    {isPro ? "Active" : "Standard"}
                  </span>
                </div>
              </div>

              {isPro && (
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Billing Cycle</span>
                  <span className="text-xs font-mono text-foreground font-semibold">Monthly Auto-Pay</span>
                </div>
              )}
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              {isPro
                ? "Full access unlocked: unlimited API contracts, 500 monthly AI generations, breaking change CI gate, live mock server, and priority webhooks."
                : "You are currently on the Free plan. Upgrade to Pro to unlock unlimited contracts, CI/CD gates, live mock proxy, and 500 AI generations."}
            </p>

            {expiresAt && isPro && (
              <div className="mt-4 flex items-center gap-2 text-xs font-mono text-muted-foreground/80 bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <ShieldCheck className="h-4 w-4 text-[#B7FF3C]" />
                <span>Next renewal date: {new Date(expiresAt).toLocaleDateString()}</span>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border/40 flex flex-wrap items-center gap-4">
              {isPro ? (
                <button
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="rounded-xl bg-[#B7FF3C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#10100B] shadow-[0_4px_16px_rgba(183,255,60,0.3)] transition-all hover:bg-[#c6ff62] hover:shadow-[0_6px_22px_rgba(183,255,60,0.4)] flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{portalLoading ? "Opening Portal..." : "Manage Subscription & Invoices"}</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                </button>
              ) : (isBillingEnabled !== undefined ? isBillingEnabled : isBillingEnabledForUser(userEmail)) ? (
                <Link
                  href="/upgrade"
                  className="rounded-xl bg-[#B7FF3C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#10100B] shadow-[0_4px_16px_rgba(183,255,60,0.3)] transition-all hover:bg-[#c6ff62] hover:shadow-[0_6px_22px_rgba(183,255,60,0.4)] flex items-center gap-2"
                >
                  <Sparkle className="h-4 w-4" />
                  <span>Upgrade to Pro ($9 / ₹499)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <button
                  disabled
                  className="rounded-xl border border-border/80 bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground/60 cursor-not-allowed select-none flex items-center gap-2"
                >
                  <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <span>Pro Launching Soon (Private Beta)</span>
                </button>
              )}

              <Link
                href="/upgrade"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View all plan comparisons →
              </Link>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              Monthly Usage & Limits
            </h3>

            <div className="space-y-5">
              {/* Contracts Meter */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    API Contracts
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {usage.contracts} / {limits.maxContracts === Infinity ? "Unlimited" : limits.maxContracts}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${contractPct}%` }}
                  />
                </div>
              </div>

              {/* AI Generations Meter */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    AI Generations (Current Month)
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {usage.aiGenerations} / {limits.maxAiGenerationsPerMonth}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B7FF3C] transition-all duration-500 rounded-full"
                    style={{ width: `${aiPct}%` }}
                  />
                </div>
              </div>

              {/* Quick Spec Limits */}
              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-border/40 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>Team seats: <strong>{limits.maxTeamMembers} members</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Key className="h-3.5 w-3.5" />
                  <span>CLI Tokens: <strong>{limits.maxCliTokens === Infinity ? "Unlimited" : limits.maxCliTokens} tokens</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices & Payment History Table */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Invoices & Payment History
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {invoices.filter((inv) => inv.status === "succeeded").length}{" "}
                {invoices.filter((inv) => inv.status === "succeeded").length === 1 ? "paid invoice" : "paid invoices"}
              </span>
            </div>

            {invoicesLoading ? (
              <p className="text-xs text-muted-foreground py-4">Loading your payment history...</p>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border/60 rounded-xl">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">No payment history found yet.</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">When you upgrade or renew, official invoices will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-mono">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Plan</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 text-muted-foreground">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "Recent"}
                        </td>
                        <td className="py-3 text-foreground font-sans font-medium">
                          Invokix Pro
                        </td>
                        <td className="py-3 text-foreground font-bold">
                          {inv.currency === "INR" ? `₹${inv.amount}` : `$${inv.amount}`}
                        </td>
                        <td className="py-3">
                          {inv.status === "succeeded" ? (
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              Paid
                            </span>
                          ) : inv.status === "failed" ? (
                            <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                              Failed
                            </span>
                          ) : inv.status === "cancelled" ? (
                            <span className="rounded-full bg-muted border border-border/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                              Cancelled
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {inv.status === "succeeded" ? (
                            <a
                              href={`/api/billing/invoices/${inv.id}`}
                              download
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-[11px] font-sans font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
                            >
                              <Download className="h-3 w-3 text-primary" />
                              <span>Download PDF</span>
                            </a>
                          ) : (
                            <span className="text-[11px] font-mono text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Portal & Cancellation */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Manage Subscription & Auto-Pay
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Need to cancel auto-pay, update your credit/debit card, or change billing details? You have full control in 1 click.
            </p>

            <div className="mt-5 space-y-2.5">
              <button
                onClick={handleOpenPortal}
                disabled={portalLoading}
                className="w-full rounded-xl bg-muted/60 border border-border/80 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{portalLoading ? "Opening Portal..." : "Cancel Auto-Pay / Update Card"}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Cancellation Info Card */}
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 text-xs">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              1-Click Self-Service Cancellation
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              You can cancel auto-pay anytime without contacting support. If cancelled, your Pro features remain fully active until your current billing period ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
