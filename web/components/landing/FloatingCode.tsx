// components/landing/FloatingCode.tsx
"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

const SNIPPETS = [
  {
    code: `export type Order = {\n  id: string\n  price: number\n  status: "pending"\n}`,
    x: "8%", y: "15%", rotate: -8, opacity: 0.07, scale: 0.85,
  },
  {
    code: `useQuery({\n  queryKey: ['orders'],\n  queryFn: fetchOrders,\n})`,
    x: "72%", y: "8%", rotate: 6, opacity: 0.06, scale: 0.9,
  },
  {
    code: `z.object({\n  price: z.number(),\n  status: z.enum([...])\n})`,
    x: "82%", y: "55%", rotate: -5, opacity: 0.07, scale: 0.8,
  },
  {
    code: `✔ Breaking change\n  detected\n✔ 3 teams notified`,
    x: "5%", y: "65%", rotate: 4, opacity: 0.06, scale: 0.85,
  },
  {
    code: `npx invokix pull\n✔ types.ts synced\n✔ hooks.ts synced`,
    x: "55%", y: "78%", rotate: -3, opacity: 0.05, scale: 0.9,
  },
]

type FloatingCardProps = {
  code: string
  x: string
  y: string
  rotate: number
  opacity: number
  scale: number
  mouseX: ReturnType<typeof useMotionValue<number>>
  mouseY: ReturnType<typeof useMotionValue<number>>
  depth: number
}

function FloatingCard({ code, x, y, rotate, opacity, scale, mouseX, mouseY, depth }: FloatingCardProps) {
  const springX = useSpring(mouseX, { stiffness: 40 * depth, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 40 * depth, damping: 30 })

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x,
        top: y,
        x: springX,
        y: springY,
        rotate,
        scale,
        opacity,
      }}
      animate={{
        y: [0, -12, 0],
      }}
      transition={{
        y: {
          duration: 4 + depth * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: depth * 0.8,
        },
      }}
    >
      <div className="rounded-xl border border-white/10 bg-white/4 backdrop-blur-sm px-4 py-3 font-mono text-[10px] text-zinc-300 whitespace-pre leading-relaxed shadow-2xl shadow-black/30 min-w-40">
        {code}
      </div>
    </motion.div>
  )
}

export function FloatingCode() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      mouseX.set((e.clientX - cx) * 0.015)
      mouseY.set((e.clientY - cy) * 0.015)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {SNIPPETS.map((s, i) => (
        <FloatingCard
          key={i}
          {...s}
          mouseX={mouseX}
          mouseY={mouseY}
          depth={(i % 3) + 1}
        />
      ))}
    </div>
  )
}