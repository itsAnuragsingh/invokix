"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { BellRingingIcon, CheckCircleIcon, CodeIcon, GitPullRequestIcon, ShieldCheckIcon, UsersThreeIcon } from "@phosphor-icons/react"

const steps = [
  { label: "Review change", icon: GitPullRequestIcon },
  { label: "Map impact", icon: UsersThreeIcon },
  { label: "Notify teams", icon: BellRingingIcon },
]

export function ProductWorkflow() {
  const [activeStep, setActiveStep] = useState(0)
  return (
    <section id="features" className="relative py-24 sm:py-32 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none workflow-grid opacity-40" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70">One workflow, not five tools</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-[1.08] mt-4">Know what changed.<br /><span className="text-zinc-500">Know who it affects.</span></h2>
          <p className="mt-5 text-base text-zinc-400 leading-relaxed max-w-xl">Invokix turns a contract edit into a clear release decision: review the diff, see every consumer at risk, and notify the right people before production does it for you.</p>
        </div>
        <div className="grid lg:grid-cols-[190px_minmax(0,1fr)] gap-5 lg:gap-8 items-start">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1">
            {steps.map((step, index) => { const Icon = step.icon; const active = activeStep === index; return <button key={step.label} onClick={() => setActiveStep(index)} className={`group shrink-0 flex lg:w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${active ? "bg-white/7 border border-white/10 text-white shadow-xl shadow-black/20" : "border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/3"}`}><span className={`grid place-items-center h-8 w-8 rounded-lg border ${active ? "bg-indigo-500/15 border-indigo-400/25 text-indigo-300" : "bg-white/3 border-white/7 text-zinc-500"}`}><Icon size={17} weight={active ? "duotone" : "regular"} /></span><span className="text-xs font-semibold whitespace-nowrap">{step.label}</span></button> })}
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0B0E14]/95 shadow-[0_24px_80px_rgba(0,0,0,.38)] overflow-hidden">
            <div className="h-12 px-4 sm:px-5 border-b border-white/7 flex items-center gap-3 bg-white/[0.025]"><span className="h-2 w-2 rounded-full bg-zinc-700" /><span className="h-2 w-2 rounded-full bg-zinc-700" /><span className="h-2 w-2 rounded-full bg-zinc-700" /><div className="mx-auto flex items-center gap-2 text-[11px] text-zinc-500 font-mono"><CodeIcon size={14} className="text-indigo-400" /> orders-api / v1.2 draft</div></div>
            <div className="grid xl:grid-cols-[1.1fr_.9fr] min-h-[430px]">
              <div className="p-5 sm:p-6 border-b xl:border-b-0 xl:border-r border-white/7"><div className="flex items-center justify-between mb-6"><div><p className="text-xs font-semibold text-white">Contract diff</p><p className="text-[11px] text-zinc-500 mt-1">orders.openapi.ts</p></div><span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-300 bg-amber-400/10 border border-amber-400/15 rounded-full px-2.5 py-1"><GitPullRequestIcon size={12} weight="bold" /> Breaking</span></div><div className="rounded-xl border border-white/7 overflow-hidden font-mono text-[11px] sm:text-xs leading-7 bg-[#080A0F]"><div className="grid grid-cols-[34px_1fr] px-3 py-2 bg-white/[0.025] text-zinc-600 border-b border-white/5"><span>24</span><span>export interface Order {'{'}</span></div><motion.div animate={{ opacity: activeStep === 0 ? 1 : 0.55 }} className="grid grid-cols-[34px_1fr] px-3 bg-red-400/[0.08] text-red-300"><span className="text-red-400/50">25</span><span>- &nbsp; totalAmount: number</span></motion.div><motion.div animate={{ opacity: activeStep === 0 ? 1 : 0.55 }} className="grid grid-cols-[34px_1fr] px-3 bg-emerald-400/[0.08] text-emerald-300"><span className="text-emerald-400/50">25</span><span>+ &nbsp; price: number</span></motion.div><div className="grid grid-cols-[34px_1fr] px-3 text-zinc-400"><span className="text-zinc-600">26</span><span>&nbsp;&nbsp;status: OrderStatus</span></div><motion.div animate={{ opacity: activeStep === 0 ? 1 : 0.55 }} className="grid grid-cols-[34px_1fr] px-3 bg-red-400/[0.08] text-red-300"><span className="text-red-400/50">27</span><span>- &nbsp; userDetails: User</span></motion.div><motion.div animate={{ opacity: activeStep === 0 ? 1 : 0.55 }} className="grid grid-cols-[34px_1fr] px-3 bg-emerald-400/[0.08] text-emerald-300"><span className="text-emerald-400/50">27</span><span>+ &nbsp; user: User</span></motion.div><div className="grid grid-cols-[34px_1fr] px-3 py-2 text-zinc-500 border-t border-white/5"><span>28</span><span>{'}'}</span></div></div><div className="mt-5 flex items-center gap-3 text-xs text-zinc-400"><span className="h-8 w-8 rounded-lg grid place-items-center bg-amber-400/10 border border-amber-400/15 text-amber-300"><ShieldCheckIcon size={16} weight="duotone" /></span><p><span className="text-white font-medium">Release gate paused.</span> This needs consumer review.</p></div></div>
              <div className="p-5 sm:p-6 bg-white/[0.015]"><div className="flex items-center justify-between mb-6"><div><p className="text-xs font-semibold text-white">Impact map</p><p className="text-[11px] text-zinc-500 mt-1">3 consumers detected</p></div><span className="text-[10px] text-indigo-300 font-medium">Live dependency graph</span></div><div className="relative space-y-3"><div className="absolute left-[19px] top-9 bottom-9 w-px bg-gradient-to-b from-indigo-400/50 via-amber-400/40 to-red-400/40" />{[["Frontend app", "2 references", "amber", "Shruti"], ["Mobile app", "1 reference", "amber", "Rahul"], ["Partner API", "1 reference", "red", "PayCo"]].map(([team, detail, tone, owner], index) => <motion.div key={team} animate={{ x: activeStep === 1 ? [0, 4, 0] : 0 }} transition={{ delay: index * .08 }} className="relative flex items-center gap-3 rounded-xl border border-white/7 bg-[#10141C] p-3"><span className={`z-10 h-10 w-10 shrink-0 rounded-lg grid place-items-center border ${tone === "red" ? "bg-red-400/10 border-red-400/20 text-red-300" : "bg-amber-400/10 border-amber-400/20 text-amber-300"}`}><UsersThreeIcon size={17} weight="duotone" /></span><div className="min-w-0"><p className="text-xs text-white font-medium">{team}</p><p className="text-[10px] text-zinc-500 mt-0.5">{detail} · owner: {owner}</p></div><span className={`ml-auto h-2 w-2 rounded-full ${tone === "red" ? "bg-red-400" : "bg-amber-400"}`} /></motion.div>)}</div><motion.div animate={{ opacity: activeStep === 2 ? 1 : .65, y: activeStep === 2 ? 0 : 4 }} className="mt-5 rounded-xl border border-indigo-400/15 bg-indigo-400/[0.06] p-3.5 flex gap-3"><span className="h-8 w-8 rounded-lg shrink-0 grid place-items-center bg-indigo-400/15 text-indigo-300"><BellRingingIcon size={16} weight="duotone" /></span><p className="text-[11px] leading-relaxed text-zinc-400"><span className="text-indigo-200 font-medium">Alert queued for 3 owners.</span><br />Includes the diff, affected files, and rollback option.</p><CheckCircleIcon size={16} weight="fill" className="ml-auto shrink-0 text-emerald-400" /></motion.div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
