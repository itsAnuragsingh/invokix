// components/landing/SocialProof.tsx
"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"

const STATS = [
  { value: 847,    suffix: "",  label: "teams using Invokix" },
  { value: 12400,  suffix: "+", label: "contracts managed" },
  { value: 2100000, suffix: "+", label: "types generated" },
  { value: 99,     suffix: "%", label: "breaking changes caught" },
]

function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let startTime: number | null = null
    let frame: number

    function tick(timestamp: number) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, target, duration])

  return count
}

function StatItem({ value, suffix, label }: typeof STATS[number]) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  const count = useCountUp(value, inView)

  function format(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
    return n.toString()
  }

  return (
    <div ref={ref} className="text-center space-y-1">
      <p className="font-display text-3xl font-bold text-white tabular-nums">
        {format(count)}{suffix}
      </p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  )
}

export function SocialProof() {
  return (
    <div className="border-t border-b border-white/5 bg-white/1 py-10">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  )
}