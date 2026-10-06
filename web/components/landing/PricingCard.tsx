// components/landing/PricingCard.tsx
"use client"

import { motion } from "motion/react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckIcon, LockSimpleIcon } from "@phosphor-icons/react"

type PricingCardProps = {
  index: number
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  comingSoon?: boolean
}

export function PricingCard({
  index, name, price, period, description, features, cta, highlighted, comingSoon
}: PricingCardProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={`relative rounded-2xl border overflow-hidden flex flex-col ${
        comingSoon
          ? "border-amber-500/20 bg-amber-500/[0.03]"
          : highlighted
          ? "border-indigo-500/50 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10"
          : "border-white/8 bg-white/2"
      }`}
    >
      {/* Top accent line */}
      {highlighted && !comingSoon && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      )}
      {comingSoon && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      )}

      {/* Badges */}
      {highlighted && !comingSoon && (
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-2.5 py-1">
            Most popular
          </span>
        </div>
      )}
      {comingSoon && (
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/15 border border-amber-500/25 rounded-full px-2.5 py-1">
            <LockSimpleIcon weight="bold" className="h-2.5 w-2.5" />
            Coming soon
          </span>
        </div>
      )}

      <div className={`p-7 flex-1 ${comingSoon ? "opacity-75" : ""}`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${
          comingSoon ? "text-amber-500/60" : "text-zinc-500"
        }`}>{name}</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-display text-4xl font-bold text-white">{price}</span>
          {period && <span className="text-sm text-zinc-500">{period}</span>}
        </div>
        <p className="text-sm text-zinc-400 mb-7">{description}</p>
        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
              <CheckIcon
                size={15}
                weight="bold"
                className={`shrink-0 mt-0.5 ${comingSoon ? "text-amber-500/50" : "text-indigo-400"}`}
              />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-7 pb-7">
        {comingSoon ? (
          <Button
            disabled
            className="w-full bg-amber-500/10 text-amber-300/50 border border-amber-500/20 cursor-not-allowed"
          >
            <LockSimpleIcon weight="bold" className="h-3.5 w-3.5 mr-2" />
            Coming Soon
          </Button>
        ) : (
          <Link href="/register">
            <Button
              className={`w-full ${
                highlighted
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
              }`}
            >
              {cta}
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// ─── Plans data — drop this into your pricing section ────────────────────────
export const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/ month",
    description: "Perfect for solo devs and small side projects.",
    features: [
      "1 API contract",
      "TS type generation",
      "Public version history (last 5)",
      "Community support",
    ],
    cta: "Get started free",
    highlighted: false,
    comingSoon: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    description: "For growing teams that need automation and safety.",
    features: [
      "Unlimited API contracts",
      "Breaking change gate",
      "Slack & webhook alerts",
      "Full version history + rollback",
      "Consumer tracking",
      "npx invokix pull",
      "Priority support",
    ],
    cta: "Coming Soon",
    highlighted: true,
    comingSoon: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/ month",
    description: "Advanced controls for large teams and organisations.",
    features: [
      "Everything in Pro",
      "SSO / SAML login",
      "Custom retention policies",
      "Audit logs",
      "SLA uptime guarantee",
      "Dedicated onboarding",
    ],
    cta: "Notify me",
    highlighted: false,
    comingSoon: true,
  },
]