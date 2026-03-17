// components/landing/BeamCard.tsx
"use client"

import { useRef, useState } from "react"
import { motion, useAnimationFrame } from "motion/react"

type BeamCardProps = {
  children: React.ReactNode
  className?: string
}

export function BeamCard({ children, className = "" }: BeamCardProps) {
  const [hovered, setHovered] = useState(false)
  const progressRef = useRef(0)
  const [beamPos, setBeamPos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  useAnimationFrame((_, delta) => {
    if (!hovered) return
    progressRef.current = (progressRef.current + delta * 0.0004) % 1
    const p = progressRef.current

    if (!cardRef.current) return
    const { width, height } = cardRef.current.getBoundingClientRect()
    const perimeter = 2 * (width + height)
    const dist = p * perimeter

    let x = 0
    let y = 0

    if (dist < width) {
      x = dist
      y = 0
    } else if (dist < width + height) {
      x = width
      y = dist - width
    } else if (dist < 2 * width + height) {
      x = width - (dist - width - height)
      y = height
    } else {
      x = 0
      y = height - (dist - 2 * width - height)
    }

    setBeamPos({ x, y })
  })

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => { setHovered(true); progressRef.current = 0 }}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-2xl border border-white/8 bg-white/2 overflow-hidden group ${className}`}
    >
      {/* Beam */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: beamPos.x,
            top: beamPos.y,
            transform: "translate(-50%, -50%)",
            width: 120,
            height: 120,
            background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      )}

      {/* Hover glow overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-indigo-500/3 to-transparent rounded-2xl" />

      {children}
    </div>
  )
}