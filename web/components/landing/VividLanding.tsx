"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  ArrowRightIcon,
  BellRingingIcon,
  CheckCircleIcon,
  CodeIcon,
  DiscordLogoIcon,
  FileTextIcon,
  GitBranchIcon,
  LinkIcon,
  SlackLogoIcon,
  SparkleIcon,
  UsersThreeIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import { CodeRibbonSection, GenerationSection, SignalSystemSection } from "@/components/landing/EditorialSections"
import { HeroTerminal } from "@/components/landing/HeroTerminal"

const plans = [
  { name: "Free", price: "$0", tone: "bg-[#F2EFE8] text-[#171717]", items: ["1 API contract", "2 teammates", "10 AI generations"] },
  { name: "Pro", price: "$19", tone: "bg-[#AE8CFF] text-[#170D2A]", items: ["Unlimited contracts", "Breaking-change gate", "Team alerts & consumer map"] },
  { name: "Team", price: "$49", tone: "bg-[#B7FF3C] text-[#10100B]", items: ["Unlimited teammates", "Role-based access", "Contract analytics"] },
]

function PostmanLogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path fill="#f37036" d="M113.117 26.066C92.168-1.062 53.191-6.07 26.062 14.883c-27.125 20.953-32.128 59.93-11.175 87.055 20.957 27.124 59.937 32.124 87.058 11.167 27.114-20.953 32.118-59.918 11.172-87.039Zm0 0" />
      <path fill="#fff" d="M91.078 24.164a10.038 10.038 0 0 0-5.781 2.426 10.028 10.028 0 0 0-1.54 13.465 10.028 10.028 0 0 0 13.276 2.715h.002v.001l.156.155a10.63 10.63 0 0 0 1.965-1.45A10.341 10.341 0 0 0 99 27.107v-.002l-8.844 8.789-.156-.155 8.844-8.793a10.038 10.038 0 0 0-7.766-2.78zM79.434 38.551c-4.24-.007-11.163 4.799-28.067 21.703l.084.086c-.092-.032-.185-.035-.185-.035l-6.364 6.308a1.035 1.035 0 0 0 .93 1.762l10.914-2.328a.307.307 0 0 0 .092-.17l.242.25-3.72 3.69h-.18l-22.086 22.26 7.086 6.824a1.254 1.254 0 0 0 1.476.149 1.327 1.327 0 0 0 .645-1.356l-1.035-4.5a.534.534 0 0 1 0-.62 117.285 117.285 0 0 0 26.738-17.583l-4.535-4.537.086-.014-2.69-2.689.172-.174.182.186-.094.091 7.137 7.293v-.003c13.68-12.954 23.39-23.367 20.865-30.375a3.83 3.83 0 0 0-1.107-2.208v.004a3.778 3.778 0 0 0-.483-.306c-.083-.088-.156-.178-.244-.264l-.066.066a3.778 3.778 0 0 0-.582-.29l.289-.292c-1.796-1.6-3.28-2.924-5.5-2.93zM30.94 92.21l-5.171 5.172v.004a1.03 1.03 0 0 0-.457 1.125 1.035 1.035 0 0 0 .921.789l12.672.875-7.965-7.965z" />
      <path fill="#f37036" d="M91.95 23.31a11.047 11.047 0 0 0-7.759 3.17 10.988 10.988 0 0 0-2.39 11.641c-4.741-2.03-11.155 1.51-31.106 21.457a.932.932 0 0 0-.037.094 1.242 1.242 0 0 0-.119.062l-6.309 6.364a1.97 1.97 0 0 0-.363 2.324 2.012 2.012 0 0 0 1.707.984l.313-.203 8.424-1.797-4.03 4.067a.873.873 0 0 0-.054.166l-19.75 19.799a.798.798 0 0 0-.192.238l-5.086 5.09a1.967 1.967 0 0 0-.414 2.043 1.995 1.995 0 0 0 1.656 1.265l12.618.88a1.01 1.01 0 0 0 .52-.415.886.886 0 0 0 0-1.035l-.026-.025a2.243 2.243 0 0 0 .705-.58 2.237 2.237 0 0 0 .406-1.876l-.984-4.187a126.725 126.725 0 0 0 26.334-16.861 1.091 1.091 0 0 0 .248.103c.254-.019.492-.128.672-.308 13.55-12.83 21.515-21.622 21.515-28.602a8.03 8.03 0 0 0-.431-2.85 10.957 10.957 0 0 0 3.845.83l-.015.004a11.219 11.219 0 0 0 5.183-1.45.775.775 0 0 0 .004.001.835.835 0 0 0 .617-.055 9.398 9.398 0 0 0 2.07-1.652 10.873 10.873 0 0 0 3.258-7.758 10.873 10.873 0 0 0-3.257-7.758.93.93 0 0 0-.118-.091 11.045 11.045 0 0 0-7.656-3.078zm-.087 1.772a9.27 9.27 0 0 1 5.586 1.914l-8.068 8.117a.84.84 0 0 0-.076.098.83.83 0 0 0-.239.55.832.832 0 0 0 .313.65h.002l6.1 6.1a9.044 9.044 0 0 1-10.028-1.913c-2.586-2.6-3.336-6.504-1.953-9.891 1.383-3.39 4.68-5.605 8.363-5.625zm7.12 3.432a8.87 8.87 0 0 1 2.033 5.674 9.15 9.15 0 0 1-2.688 6.464 9.989 9.989 0 0 1-1.098.895L92.307 36.7l-.963-.963.265-.265 7.373-6.96zm-.366 4.193a.777.777 0 0 0-.55.031.731.731 0 0 0-.36.426.73.73 0 0 0 .05.559 2.226 2.226 0 0 1-.257 2.328.64.64 0 0 0-.195.488c.004.184.07.36.195.492a.58.58 0 0 0 .414 0 .68.68 0 0 0 .672-.207 3.573 3.573 0 0 0 .465-3.777v.004a.777.777 0 0 0-.434-.344zM79.34 39.43a5.584 5.584 0 0 1 3.31 1.226 4.756 4.756 0 0 0-2.681 1.34L57.162 64.701l-4.476-4.476c11.828-11.772 19.06-17.921 23.556-19.936a5.584 5.584 0 0 1 3.098-.86zm3.965 2.96a2.895 2.895 0 0 1 2.043.844 2.786 2.786 0 0 1 .879 2.121 2.869 2.869 0 0 1-.985 2.07l-24.25 21.106-2.617-2.617 22.887-22.68a2.895 2.895 0 0 1 2.043-.843zm2.994 6.698c-1.69 6.702-10.647 15.783-19.987 24.607l-3.777-3.773L86.3 49.088zM51.367 61.547l.274.27 3.513 3.513-9.63 2.06 5.843-5.843zm5.793 5.84.004.004 1.168 1.195a1.086 1.086 0 0 0 .018.084l.078.012.248.254.82.84-5.385.66 3.05-3.05zm3.867 4.076 3.578 3.576A126.992 126.992 0 0 1 38.75 91.695a1.44 1.44 0 0 0-.777 1.653l1.035 4.5a.31.31 0 0 1 0 .363.31.31 0 0 1-.414 0l-6.102-6.152L51.3 72.975l9.728-1.512zm-29.933 21.94.869.814 4.492 4.492-10.016-.648 4.655-4.659z" />
    </svg>
  )
}

function ProblemScene() {
  const tools = [
    { name: "Postman", copy: "Stale collection", Icon: PostmanLogoIcon, tone: "bg-[#FF6C37] text-white", pos: "top-4 right-3 sm:top-8 sm:right-8" },
    { name: "Slack", copy: "#engineering-alerts", Icon: SlackLogoIcon, tone: "bg-[#4A154B] text-white", pos: "bottom-4 right-3 sm:bottom-10 sm:right-10" },
    { name: "Discord", copy: "#api-releases", Icon: DiscordLogoIcon, tone: "bg-[#5865F2] text-white", pos: "top-4 left-3 sm:top-8 sm:left-8" },
    { name: "Code", copy: "Out of sync types", Icon: CodeIcon, tone: "bg-[#170D2A] text-[#B7FF3C]", pos: "bottom-4 left-3 sm:bottom-10 sm:left-10" },
    { name: "Docs", copy: "Outdated Wiki page", Icon: FileTextIcon, tone: "bg-[#F15A3C] text-white", pos: "top-1/2 -translate-y-1/2 left-2 sm:left-4" },
  ]

  return (
    <section className="relative bg-[#FFD15C] py-20 sm:py-32 overflow-hidden">
      <div className="absolute right-[8%] top-0 bottom-0 w-px bg-black/15" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[.9fr_1.1fr] gap-10 lg:gap-12 items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-black/50">The old way</p>
          <h2 className="font-display text-4xl sm:text-7xl leading-[.85] tracking-[-.06em] font-bold mt-4 sm:mt-6">
            Your API<br />lives in<br />
            <span className="text-[#F15A3C]">too many places.</span>
          </h2>
          <p className="max-w-sm mt-5 sm:mt-7 text-sm sm:text-base leading-relaxed text-black/65">
            A stale doc, a private collection, an old message. Useful individually. Dangerous together.
          </p>
        </div>

        {/* Right side sharp visual canvas matching landing page style */}
        <div className="relative min-h-[380px] sm:min-h-[450px] bg-[#FCE5A6] border-2 border-black/20 p-4 sm:p-10 shadow-[10px_11px_0_rgba(23,23,23,.18)] sm:shadow-[13px_14px_0_rgba(23,23,23,.18)] overflow-hidden">
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#170D2A_1px,transparent_1px)] [background-size:18px_18px] opacity-15" />

          {/* Solid static connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-black/20 stroke-[1.5]">
            <line x1="25%" y1="20%" x2="50%" y2="50%" />
            <line x1="75%" y1="20%" x2="50%" y2="50%" />
            <line x1="25%" y1="80%" x2="50%" y2="50%" />
            <line x1="75%" y1="80%" x2="50%" y2="50%" />
            <line x1="15%" y1="50%" x2="50%" y2="50%" />
          </svg>

          {/* Center Hub - Responsive & Bold */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="h-20 w-20 sm:h-28 sm:w-28 bg-[#170D2A] text-white border-2 border-black/30 p-2 sm:p-3 flex flex-col items-center justify-center text-center shadow-[5px_6px_0_rgba(0,0,0,0.3)] sm:shadow-[8px_9px_0_rgba(0,0,0,0.3)]">
              <WarningIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFD15C] mb-0.5 sm:mb-1" weight="fill" />
              <span className="font-display text-[10px] sm:text-xs font-bold leading-tight uppercase tracking-wider">
                No Single<br />Truth
              </span>
            </div>
          </div>

          {/* Sharp Brand Cards with Responsive Sizing & Pure Floating Motion */}
          {tools.map(({ name, copy, Icon, tone, pos }, index) => (
            <motion.div
              key={name}
              animate={{ y: [-4, 4, -4] }}
              transition={{
                delay: index * 0.2,
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute ${pos} z-20 ${tone} border border-black/20 shadow-[5px_6px_0_rgba(16,16,11,0.22)] sm:shadow-[7px_8px_0_rgba(16,16,11,0.22)] px-2.5 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 cursor-default`}
            >
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-black/20 flex items-center justify-center shrink-0 border border-white/10">
                <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" weight="fill" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold font-display leading-none">{name}</p>
                <p className="hidden sm:block text-[10px] opacity-80 font-mono mt-1 leading-none">{copy}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImpactScene() {
  return <section id="features" className="relative bg-[#170D2A] py-24 sm:py-32 overflow-hidden"><div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-[#AE8CFF]/30 blur-[90px]" /><div className="relative max-w-7xl mx-auto px-5 sm:px-8"><div className="grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-center"><div className="text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#C7B2FF]">03 — The impact layer</p><h2 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[.86] tracking-[-.06em] font-bold mt-6">The change<br />is tiny.<br /><span className="text-[#B7FF3C]">The context is not.</span></h2><p className="max-w-sm mt-7 text-base leading-relaxed text-white/60">Trace the people, services, and files connected to a contract before the change becomes somebody else’s emergency.</p></div><motion.div initial={{ opacity: 0, scale: .94, y: 25 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} className="relative border border-white/15 bg-[#25153E] p-5 sm:p-7 shadow-[18px_20px_0_rgba(174,140,255,.32)]"><div className="flex justify-between text-xs text-white/55 font-mono"><span>orders-api / v1.2</span><span className="text-[#FFD15C]">3 owners affected</span></div><div className="mt-8 grid sm:grid-cols-[1fr_.9fr] gap-5"><div className="bg-[#120A20] p-5 border border-white/8"><p className="text-[10px] uppercase tracking-widest text-white/45">Contract diff</p><div className="mt-5 font-mono text-xs leading-8"><p className="text-red-300 bg-red-400/10 px-2">− totalAmount: number</p><p className="text-[#B7FF3C] bg-[#B7FF3C]/10 px-2">+ price: number</p><p className="text-red-300 bg-red-400/10 px-2">− userDetails: User</p><p className="text-[#B7FF3C] bg-[#B7FF3C]/10 px-2">+ user: User</p></div></div><div className="space-y-3">{[["Frontend", "Shruti", "#FFD15C"], ["Mobile", "Rahul", "#B7FF3C"], ["Partner", "PayCo", "#FF8FA9"]].map(([team, owner, color], i) => <motion.div key={team} animate={{ x: [0, i % 2 ? 5 : -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: i * .3 }} className="flex items-center gap-3 border border-white/10 bg-white/[.06] p-3"><span className="h-9 w-9 grid place-items-center" style={{ backgroundColor: `${color}22`, color }}><UsersThreeIcon size={18} weight="duotone" /></span><div><p className="text-xs font-bold text-white">{team}</p><p className="text-[10px] text-white/45">owner: {owner}</p></div><span className="ml-auto h-2 w-2 rounded-full" style={{ backgroundColor: color }} /></motion.div>)}</div></div><div className="absolute -bottom-7 right-5 sm:right-8 flex items-center gap-3 bg-[#FFD15C] text-[#281B00] px-5 py-4 font-bold shadow-xl"><BellRingingIcon size={21} weight="fill" /> Alert ready to send <ArrowRightIcon size={16} weight="bold" /></div></motion.div></div></div></section>
}

function NotificationsScene() {
  const channels = [{ name: "Slack", copy: "#engineering-alerts", Icon: SlackLogoIcon, tone: "bg-[#4A154B] text-white", tag: "Change detected" }, { name: "Discord", copy: "#api-releases", Icon: DiscordLogoIcon, tone: "bg-[#5865F2] text-white", tag: "3 teams notified" }]
  return <section className="relative bg-[#B7FF3C] text-[#10100B] py-24 sm:py-32 overflow-hidden"><div className="absolute -left-32 top-0 h-[540px] w-[540px] rounded-full border-[70px] border-[#E5FFC2]" /><div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[.85fr_1.15fr] gap-14 items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] opacity-55">04 — Everyone gets the memo</p><h2 className="font-display text-5xl sm:text-7xl leading-[.84] tracking-[-.065em] font-bold mt-6">The right<br />people know<br /><span className="text-[#4431D9]">first.</span></h2><p className="max-w-sm mt-7 text-base leading-relaxed font-medium opacity-70">Send a release-ready explanation where your team already works. Each alert includes the contract diff, owners, and exact files affected.</p></div><div className="relative py-8 sm:py-12">{channels.map(({ name, copy, Icon, tone, tag }, index) => <motion.article key={name} initial={{ opacity: 0, x: 45, rotate: index ? 3 : -3 }} whileInView={{ opacity: 1, x: 0, rotate: index ? 2 : -2 }} viewport={{ once: true }} transition={{ delay: index * .18, duration: .55 }} className={`relative ${tone} ${index ? "ml-7 sm:ml-20 mt-6" : "mr-7 sm:mr-20"} shadow-[12px_13px_0_rgba(16,16,11,.22)] p-5 sm:p-6`}><div className="flex items-center gap-3 border-b border-white/20 pb-4"><Icon size={27} weight="fill" /><div><p className="text-sm font-bold">{name}</p><p className="text-[10px] opacity-65">{copy}</p></div><span className="ml-auto text-[10px] bg-white/15 px-2 py-1 font-mono">just now</span></div><div className="py-5"><p className="text-[10px] uppercase tracking-widest opacity-55">Invokix release update</p><p className="mt-2 text-sm font-semibold">Orders API v1.2 has a breaking change.</p><p className="mt-2 text-xs leading-relaxed opacity-75">3 consumers are affected by <span className="font-mono text-[#FFD15C]">totalAmount → price</span>.</p></div><div className="flex justify-between items-center border-t border-white/20 pt-4"><span className="text-[10px] font-bold">{tag}</span><span className="text-xs font-bold">Review change →</span></div></motion.article>)}<motion.div animate={{ rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -right-2 sm:right-3 -top-1 h-16 w-16 bg-[#F15A3C] text-white grid place-items-center shadow-lg"><BellRingingIcon size={28} weight="fill" /></motion.div></div></div></section>
}

interface ClickRipple {
  id: number
  x: number
  y: number
}

function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [ripples, setRipples] = useState<ClickRipple[]>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)

      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.tagName === "SUMMARY" ||
          target.closest("a") ||
          target.closest("button") ||
          target.closest("summary") ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("cursor-pointer"))
      ) {
        setIsHovered(true)
      } else {
        setIsHovered(false)
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true)
      const newRipple = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY }
      setRipples((prev) => [...prev.slice(-3), newRipple])
    }

    const handleMouseUp = () => {
      setIsClicked(false)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [isVisible])

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }

  if (!isVisible) return null

  return (
    <>
      <style jsx global>{`
        ::selection {
          background-color: #00F0FF !important;
          color: #000000 !important;
        }
        ::-moz-selection {
          background-color: #00F0FF !important;
          color: #000000 !important;
        }
        @media (min-width: 768px) {
          .landing-custom-cursor,
          .landing-custom-cursor * {
            cursor: none !important;
          }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
        {/* Click Bouncy Wave Ripples */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ opacity: 0.9, scale: 0.2 }}
              animate={{ opacity: 0, scale: 3.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.15, 0.85, 0.35, 1.2] }}
              onAnimationComplete={() => removeRipple(ripple.id)}
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
              className="fixed -ml-7 -mt-7 h-14 w-14 rounded-full border-2 border-[#B7FF3C] bg-[#B7FF3C]/35 shadow-[0_0_24px_#B7FF3C] pointer-events-none"
            />
          ))}
        </AnimatePresence>

        {/* Custom Pointer Icon (Morphs between sharp arrow and neon hand pointer with Bouncy spring on click) */}
        <motion.div
          className="fixed top-0 left-0"
          animate={{
            x: mousePos.x,
            y: mousePos.y,
            scale: isClicked ? 0.75 : isHovered ? 1.25 : 1,
            rotate: isClicked ? -12 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: isClicked ? 1600 : 1200,
            damping: isClicked ? 15 : 45,
            mass: 0.1,
          }}
        >
          {isHovered ? (
            /* Custom Neon Hand Pointer Icon when hovering links/buttons */
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[2px_4px_0_rgba(0,0,0,0.5)] -ml-1 -mt-1"
            >
              <path
                d="M10 2v10.5L8.2 11.2c-.4-.4-1-.4-1.4 0l-.8.8 4.7 4.7c.6.6 1.4 1 2.3 1h5c1.7 0 3-1.3 3-3V9c0-.6-.4-1-1-1s-1 .4-1 1v1h-1V7.5c0-.6-.4-1-1-1s-1 .4-1 1V9h-1V6c0-.6-.4-1-1-1s-1 .4-1 1v3h-1V2c0-.6-.4-1-1-1s-1 .4-1 1z"
                fill="#B7FF3C"
                stroke="#170D2A"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            /* Sleek Sharp Arrow Pointer for general movement */
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[2px_4px_0_rgba(0,0,0,0.4)]"
            >
              <path
                d="M3 3L10.07 19.97L13.58 13.58L19.97 10.07L3 3Z"
                fill="#170D2A"
                stroke="#B7FF3C"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </motion.div>

        {/* Smooth Trailing Glow Ring with Bouncy Expansion on Click */}
        <motion.div
          className="fixed top-0 left-0 h-7 w-7 -ml-3.5 -mt-3.5 rounded-full border-2 border-[#B7FF3C] bg-[#B7FF3C]/20 pointer-events-none"
          animate={{
            x: mousePos.x,
            y: mousePos.y,
            scale: isClicked ? 2.4 : isHovered ? 1.7 : 1,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
        />
      </div>
    </>
  )
}

export function VividLanding() {
  return (
    <main className="landing-custom-cursor overflow-x-hidden bg-[#F2EFE8] text-[#171717] md:cursor-none">
      <CustomCursor />
      <nav className="absolute z-20 left-0 right-0 top-0"><div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between text-white"><Link href="/" className="font-display font-bold text-2xl tracking-tight">Invokix<span className="text-[#B7FF3C]">.</span></Link><div className="hidden md:flex gap-7 text-xs font-bold uppercase tracking-wider text-white/65"><a href="#features">Product</a><a href="#pricing">Pricing</a><Link href="/docs">Docs</Link></div><Link href="/register" className="bg-[#B7FF3C] text-[#10100B] px-4 py-2.5 text-xs font-bold">Start free <ArrowRightIcon size={13} className="inline ml-1" /></Link></div></nav><section className="relative min-h-screen bg-[#4431D9] text-white overflow-hidden flex items-center"><div className="absolute -right-40 top-16 h-[720px] w-[720px] rounded-full border-[100px] border-[#9E91FF]/50" /><div className="absolute left-[8%] top-0 bottom-0 w-px bg-white/15" /><div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-14 w-full"><div className="grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-center"><div><p className="text-xs uppercase font-bold tracking-[.18em] text-[#C7B2FF]">The contract intelligence platform</p><h1 className="font-display text-[clamp(4.2rem,10vw,9rem)] leading-[.78] tracking-[-.075em] font-bold mt-7">Your API<br />just got<br /><span className="text-[#B7FF3C]">a memory.</span></h1><p className="max-w-md mt-9 text-base sm:text-lg text-white/65 leading-relaxed">The living home for your API contracts, generated clients, release context, and everyone affected by a change.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/register" className="bg-[#B7FF3C] text-[#10100B] px-6 py-4 text-sm font-bold">Build your first contract <ArrowRightIcon size={16} className="inline ml-2" /></Link><a href="#features" className="border border-white/30 px-6 py-4 text-sm font-bold">See the system</a></div></div><motion.div initial={{ opacity: 0, rotate: 3, y: 30 }} animate={{ opacity: 1, rotate: 0, y: 0 }} transition={{ duration: .7 }} className="relative py-9 pr-2 sm:py-12 sm:pr-6"><div className="absolute inset-x-7 top-0 bottom-0 bg-[#F15A3C] shadow-[22px_25px_0_rgba(20,12,70,.32)]" /><div className="relative translate-x-0 sm:translate-x-5 -rotate-2 border-2 border-[#170D2A] shadow-[12px_14px_0_rgba(183,255,60,.65)]"><HeroTerminal /></div><motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -left-4 sm:-left-9 -bottom-1 bg-[#FFD15C] text-[#251600] px-4 py-3 text-xs font-bold -rotate-3 shadow-lg"><SparkleIcon size={16} weight="fill" className="inline mr-2" />LIVE CONTRACT MEMORY</motion.div><div className="absolute -right-2 sm:-right-5 top-7 bg-[#B7FF3C] text-[#10100B] px-3 py-2 text-[10px] font-mono font-bold rotate-3">v1.2 · synced</div></motion.div></div><div className="mt-14 border-t border-white/15 pt-5 flex flex-wrap gap-x-12 gap-y-3 text-xs font-bold uppercase tracking-wider text-white/50"><span>OpenAPI</span><span>TypeScript</span><span>React Query</span><span>Zod</span><span>Slack</span></div></div></section><ProblemScene /><GenerationSection /><CodeRibbonSection /><ImpactScene /><NotificationsScene /><SignalSystemSection /><section id="pricing" className="bg-[#170D2A] text-white py-24 sm:py-32"><div className="max-w-7xl mx-auto px-5 sm:px-8"><div className="flex flex-col md:flex-row justify-between gap-8 mb-14"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#C7B2FF]">Pricing</p><h2 className="font-display text-5xl sm:text-7xl leading-[.86] tracking-[-.06em] font-bold mt-5">Pick your<br /><span className="text-[#B7FF3C]">release speed.</span></h2></div></div><div className="grid md:grid-cols-3 gap-5">{plans.map((plan, index) => <motion.article key={plan.name} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .1 }} className={`${plan.tone} p-7 sm:p-8 min-h-[370px] flex flex-col ${index === 1 ? "md:-translate-y-6 shadow-[12px_14px_0_rgba(183,255,60,.4)]" : ""}`}><p className="font-mono text-xs font-bold opacity-55">0{index + 1} / {plan.name.toUpperCase()}</p><p className="font-display text-6xl font-bold tracking-[-.06em] mt-8">{plan.price}<span className="text-base tracking-normal">/mo</span></p><ul className="mt-7 space-y-3 text-xs font-semibold">{plan.items.map(item => <li key={item} className="flex gap-2"><CheckCircleIcon size={15} weight="fill" /> {item}</li>)}</ul><Link href="/register" className="mt-auto pt-8 text-sm font-bold">Choose {plan.name} <ArrowRightIcon size={15} className="inline ml-1" /></Link></motion.article>)}</div></div></section><section className="bg-[#F2EFE8] py-24 sm:py-32"><div className="max-w-4xl mx-auto px-5 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#625C55]">Questions, answered</p><h2 className="font-display text-5xl sm:text-6xl leading-[.88] tracking-[-.06em] font-bold mt-5">Clear on the<br /><span className="text-[#77716A]">important things.</span></h2><div className="mt-14 border-t border-black/15">{[["Do I need an OpenAPI file?", "No. Start with a plain-English brief, import an existing spec, or use both."], ["Does Invokix replace our source code?", "No. It keeps generated artifacts and contract context aligned with the workflow you already own."], ["Can we start for free?", "Yes. The Free plan is made for trying your first contract without a card."]].map(([q, a]) => <details key={q} className="group border-b border-black/15 py-6"><summary className="flex cursor-pointer list-none justify-between gap-6 font-display text-xl sm:text-2xl font-bold">{q}<span className="text-[#F15A3C] group-open:rotate-45 transition-transform">+</span></summary><p className="max-w-xl mt-4 text-sm leading-relaxed text-[#625C55]">{a}</p></details>)}</div></div></section><section className="relative bg-[#F15A3C] text-[#180C10] py-28 sm:py-40 overflow-hidden"><div className="absolute -right-20 -bottom-36 h-[500px] w-[500px] rounded-full border-[70px] border-[#FFB48E]" /><div className="relative max-w-5xl mx-auto px-5 sm:px-8 text-center"><p className="text-xs font-bold uppercase tracking-[.18em] opacity-60">Give your API a home</p><h2 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[.78] tracking-[-.075em] font-bold mt-8">Stop shipping<br />surprises.</h2><Link href="/register" className="inline-block mt-11 bg-[#170D2A] text-white px-7 py-4 text-sm font-bold shadow-[8px_9px_0_rgba(24,12,16,.2)]">Start building for free <ArrowRightIcon size={16} className="inline ml-2" /></Link></div></section><footer className="bg-[#170D2A] text-white/50 px-5 sm:px-8 py-7 flex flex-col sm:flex-row gap-3 justify-between text-xs"><span className="font-display text-white text-lg font-bold">Invokix<span className="text-[#B7FF3C]">.</span></span><span>One contract. Every team. In sync.</span><span>© 2026 Invokix</span></footer></main>
  )
}
