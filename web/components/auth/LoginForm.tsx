// components/auth/LoginForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authClient } from "@/lib/auth/client"
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, EnvelopeIcon, LockSimpleIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      })
      if (result.error) {
        toast.error(result.error.message ?? "Invalid credentials")
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Email
        </Label>
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-9 bg-muted/30 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary/50 placeholder:text-muted-foreground/30 h-10"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Password
        </Label>
        <div className="relative">
          <LockSimpleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-9 pr-10 bg-muted/30 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary/50 placeholder:text-muted-foreground/30 h-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {showPassword
              ? <EyeSlashIcon className="h-4 w-4" />
              : <EyeIcon className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-medium"
      >
        {loading ? (
          <motion.div
            className="flex items-center gap-2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            Signing in...
          </motion.div>
        ) : (
          <span className="flex items-center gap-2">
            Sign in
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        )}
      </Button>
    </form>
  )
}