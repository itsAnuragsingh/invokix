// components/landing/PricingCard.tsx
"use client"

import { motion } from "motion/react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckIcon } from "@phosphor-icons/react"

type PricingCardProps = {
  index: number
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}

export function PricingCard({
  index, name, price, period, description, features, cta, highlighted
}: PricingCardProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={`relative rounded-2xl border overflow-hidden flex flex-col ${
        highlighted
          ? "border-indigo-500/50 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10"
          : "border-white/8 bg-white/2"
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      )}
      {highlighted && (
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-2.5 py-1">
            Most popular
          </span>
        </div>
      )}

      <div className="p-7 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{name}</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="font-display text-4xl font-bold text-white">{price}</span>
          {period && <span className="text-sm text-zinc-500">{period}</span>}
        </div>
        <p className="text-sm text-zinc-400 mb-7">{description}</p>
        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
              <CheckIcon size={15} weight="bold" className="text-indigo-400 shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-7 pb-7">
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
      </div>
    </motion.div>
  )
}