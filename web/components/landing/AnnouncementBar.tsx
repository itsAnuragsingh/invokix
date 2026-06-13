// components/landing/AnnouncementBar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { XIcon, ArrowRightIcon, SparkleIcon } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "motion/react"

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-indigo-600/20 border-b border-indigo-500/20">
            {/* Animated shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_3s_linear_infinite]" />

            <div className="relative max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
              {/* Badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-0.5">
                <SparkleIcon size={10} weight="fill" />
                New
              </span>

              <p className="text-xs sm:text-sm text-white/80 text-center">
                Invokix v1.0 is live —{" "}
                <Link
                  href="#features"
                  className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200 font-semibold transition-colors underline underline-offset-2 decoration-indigo-500/50 hover:decoration-indigo-300"
                >
                  See what&apos;s new
                  <ArrowRightIcon size={11} />
                </Link>
              </p>

              {/* Dismiss */}
              <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss announcement"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-5 w-5 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-all duration-200"
              >
                <XIcon size={11} weight="bold" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
