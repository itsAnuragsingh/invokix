"use client"

import { useState } from "react"
import { VideoModal } from "@/components/landing/VideoModal"
import { PlayCircleIcon } from "@phosphor-icons/react"

export function WatchDemoButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── Watch Demo Button ── */}
      <button
        id="watch-demo-btn"
        onClick={() => setOpen(true)}
        className="group relative inline-flex items-center gap-2.5 px-6 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200 overflow-hidden"
        aria-label="Watch product demo video"
      >
        {/* Shimmer sweep */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        {/* Play icon with ring animation */}
        <span className="relative flex items-center justify-center h-5 w-5">
          <span className="absolute inset-0 rounded-full bg-indigo-500/30 group-hover:scale-125 group-hover:opacity-0 transition-all duration-500" />
          <PlayCircleIcon
            size={18}
            weight="fill"
            className="relative text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-all duration-200"
          />
        </span>

        <span>Watch demo</span>
      </button>

      {/* ── Video Modal ── */}
      <VideoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        videoSrc="/invokix.mp4"
      />
    </>
  )
}
