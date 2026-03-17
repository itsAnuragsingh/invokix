// components/landing/CodegenShowcase.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useInView } from "react-intersection-observer"
import { codeToHtml } from "shiki"

type Stack = "nextjs" | "react-native" | "express"

const STACKS: { id: Stack; label: string; emoji: string }[] = [
  { id: "nextjs",       label: "Next.js / React", emoji: "⚛️" },
  { id: "react-native", label: "React Native",     emoji: "📱" },
  { id: "express",      label: "Express / Node",   emoji: "🟢" },
]

const CODE: Record<Stack, { filename: string; code: string }[]> = {
  nextjs: [
    {
      filename: "types.ts",
      code: `export type Order = {
  id: string
  price: number
  status: "pending" | "shipped" | "delivered"
  user: { name: string; email: string }
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}`,
    },
    {
      filename: "useOrders.ts",
      code: `export const useGetOrders = (
  params?: GetOrdersParams
) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Failed')
      return res.json() as Promise<{
        orders: Order[]
        total: number
      }>
    }
  })

export const useCreateOrder = () =>
  useMutation({
    mutationFn: async (body: CreateOrderBody) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      return res.json() as Promise<Order>
    }
  })`,
    },
    {
      filename: "schemas.ts",
      code: `export const OrderSchema = z.object({
  id: z.string().uuid(),
  price: z.number().positive(),
  status: z.enum([
    "pending",
    "shipped",
    "delivered"
  ]),
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  }))
})`,
    },
  ],
  "react-native": [
    {
      filename: "types.ts",
      code: `export type Order = {
  id: string
  price: number
  status: "pending" | "shipped" | "delivered"
  user: { name: string; email: string }
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}`,
    },
    {
      filename: "useOrdersNative.ts",
      code: `export const useGetOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    // React Native: no window focus events
    refetchOnWindowFocus: false,
    // offline-aware behaviour
    networkMode: 'always',
  })

export const useCreateOrder = () =>
  useMutation({
    mutationFn: async (body: CreateOrderBody) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      return res.json() as Promise<Order>
    }
  })`,
    },
    {
      filename: "schemas.ts",
      code: `export const OrderSchema = z.object({
  id: z.string().uuid(),
  price: z.number().positive(),
  status: z.enum([
    "pending",
    "shipped",
    "delivered"
  ]),
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
})`,
    },
  ],
  express: [
    {
      filename: "types.ts",
      code: `export type Order = {
  id: string
  price: number
  status: "pending" | "shipped" | "delivered"
  user: { name: string; email: string }
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}

export type CreateOrderBody = {
  items: Array<{
    productId: string
    quantity: number
  }>
  userId: string
}`,
    },
    {
      filename: "schemas.ts",
      code: `export const OrderSchema = z.object({
  id: z.string().uuid(),
  price: z.number().positive(),
  status: z.enum([
    "pending",
    "shipped",
    "delivered"
  ]),
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
})

export const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })),
  userId: z.string().uuid(),
})`,
    },
  ],
}

export function CodegenShowcase() {
  const [stack, setStack] = useState<Stack>("nextjs")
  const [activeFile, setActiveFile] = useState(0)
  const [highlighted, setHighlighted] = useState<string>("")
  const [highlighting, setHighlighting] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const files = CODE[stack]
  const current = files[Math.min(activeFile, files.length - 1)]

  useEffect(() => {
    let cancelled = false
    setHighlighting(true)
    codeToHtml(current.code, {
      lang: "typescript",
      theme: "github-dark-dimmed",
    }).then((html) => {
      if (!cancelled) {
        setHighlighted(html)
        setHighlighting(false)
      }
    }).catch(() => {
      if (!cancelled) setHighlighting(false)
    })
    return () => { cancelled = true }
  }, [stack, activeFile])

  function handleStack(s: Stack) {
    setStack(s)
    setActiveFile(0)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-6xl mx-auto px-4 sm:px-6"
    >
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400/70 mb-4">Code generation</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
          One contract.{" "}
          <span className="text-zinc-500">Your stack.</span>
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm">
          Pick your stack — see exactly what gets generated. Always typed. Always in sync.
        </p>
      </div>

      {/* Stack switcher */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1 bg-white/4 border border-white/8 rounded-xl p-1 max-w-full overflow-x-auto">
          {STACKS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleStack(s.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                stack === s.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Code window */}
      <div className="rounded-2xl border border-white/8 bg-[#22272e] overflow-hidden shadow-2xl shadow-black/30">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-1.5 mr-4">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-amber-500/60" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
          </div>
          {files.map((f, i) => (
            <button
              key={f.filename}
              onClick={() => setActiveFile(i)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                activeFile === i
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {f.filename}
            </button>
          ))}
        </div>

        {/* Code panel */}
        <div className="relative min-h-64 max-h-80 overflow-auto">
          <AnimatePresence mode="wait">
            {highlighting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 flex items-center gap-2 text-xs text-zinc-500 font-mono"
              >
                <div className="h-3 w-3 rounded-full border-2 border-indigo-500/50 border-t-indigo-400 animate-spin" />
                Highlighting...
              </motion.div>
            ) : (
              <motion.div
                key={`${stack}-${activeFile}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="p-5 text-xs leading-relaxed [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:overflow-visible"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-white/5 bg-black/10 flex items-center justify-between">
          <span className="text-[10px] text-zinc-600 font-mono">
            {current.code.split("\n").length} lines · TypeScript
          </span>
          <span className="text-[10px] text-indigo-400/50">Generated by Invokix</span>
        </div>
      </div>
    </motion.div>
  )
}