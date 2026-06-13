// components/landing/FAQ.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { PlusIcon, MinusIcon } from "@phosphor-icons/react"

const FAQS = [
  {
    q: "How is Invokix different from Swagger / OpenAPI editors?",
    a: "Swagger and OpenAPI are file formats — they don't sync your types to code, alert your team when something breaks, or track which teams are consuming what version. Invokix is the living platform around your contract: it generates TypeScript types, React Query hooks, and Zod schemas automatically, then keeps every consumer in sync when you publish a change.",
  },
  {
    q: "How is it different from Postman?",
    a: "Postman is great for testing requests. Invokix is about the contract itself — the typed, versioned, shared source of truth. Think of Postman as your HTTP client, and Invokix as the always-current spec that lives behind it. They complement each other.",
  },
  {
    q: "What gets generated from my contract?",
    a: "Invokix generates TypeScript interfaces & types, React Query v5 hooks (useQuery, useMutation), Zod validation schemas, and an OpenAPI 3.0 spec — all from a single plain-English description or a YAML/JSON spec you upload.",
  },
  {
    q: "Will it break my existing codebase?",
    a: "No. The CLI (`npx invokix pull`) writes to a directory you choose, and you decide when to pull updates. Breaking change detection runs before publishing — so your consumers always get advance warning, not a surprise at runtime.",
  },
  {
    q: "Is my API data private?",
    a: "Yes. Your contract data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never share or sell your schema data. Enterprise customers can request a self-hosted deployment.",
  },
  {
    q: "Can I use Invokix if my API already exists?",
    a: "Absolutely. You can import an existing OpenAPI YAML/JSON spec in seconds. Invokix will parse it, generate outputs, and start tracking changes from that point forward.",
  },
  {
    q: "What frameworks / languages are supported?",
    a: "Currently we generate TypeScript (types, React Query hooks, Zod). Go, Python, and Rust client generators are on our roadmap. Let us know which language to prioritise at hello@invokix.com.",
  },
  {
    q: "Do you have a free plan?",
    a: "Yes — the Free plan includes 1 API contract, 2 team members, 10 AI generations per month, and a shareable contract page. No credit card required.",
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        open
          ? "border-indigo-500/30 bg-indigo-500/5 shadow-lg shadow-indigo-500/5"
          : "border-white/6 bg-white/2 hover:border-white/10 hover:bg-white/3"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className={`text-sm sm:text-base font-medium leading-snug transition-colors duration-200 ${open ? "text-white" : "text-zinc-300"}`}>
          {q}
        </span>
        <span className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full border transition-all duration-300 ${
          open
            ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400 rotate-0"
            : "bg-white/5 border-white/10 text-zinc-500"
        }`}>
          {open
            ? <MinusIcon size={12} weight="bold" />
            : <PlusIcon size={12} weight="bold" />
          }
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQ() {
  return (
    <section className="py-20 sm:py-28 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">FAQ</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Common questions
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Can&apos;t find your answer?{" "}
            <a
              href="mailto:hello@invokix.com"
              className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2 decoration-indigo-500/40"
            >
              Email us
            </a>{" "}
            and we&apos;ll reply within 24 hours.
          </p>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} index={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
