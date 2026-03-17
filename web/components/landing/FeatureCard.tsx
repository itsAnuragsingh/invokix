// components/landing/FeatureCard.tsx
"use client"

import { useInView } from "react-intersection-observer"
import { motion } from "motion/react"
import { BeamCard } from "./BeamCard"

type FeatureCardProps = {
  index: number
  icon: React.ReactNode
  badge: string
  title: string
  description: string
  visual: React.ReactNode
}

export function FeatureCard({ index, icon, badge, title, description, visual }: FeatureCardProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      <BeamCard className="h-full hover:border-indigo-500/30 transition-all duration-500">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400/70 bg-indigo-500/10 border border-indigo-500/15 rounded-full px-2.5 py-1">
              {badge}
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          {visual}
        </div>
      </BeamCard>
    </motion.div>
  )
}