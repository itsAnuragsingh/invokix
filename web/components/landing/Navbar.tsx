// components/landing/Navbar.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "motion/react"
import { Button } from "@/components/ui/button"
import { LightningIcon, ArrowRightIcon } from "@phosphor-icons/react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 20))
  }, [scrollY])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[#080A0F]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20"
          : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-12 w-12 overflow-hidden  rounded-full  flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
            <img src="/logo.png" className=" h-full  object-cover" alt="invokix" />
          </div>
          <span className="font-display font-bold text-white tracking-tight text-xl">
            Invokix
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {["Features", "Pricing", "Docs"].map((item) => (
            <Link
              key={item}
              href={item === "Docs" ? "/docs" : `#${item.toLowerCase()}`}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5 text-sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/25 text-xs sm:text-sm px-3 sm:px-4"
            >
              Get started free
              <ArrowRightIcon size={14} className="ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}