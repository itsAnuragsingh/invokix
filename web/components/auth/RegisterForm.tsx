// components/auth/RegisterForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authClient } from "@/lib/auth/client"
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  LockSimpleIcon,
  UserIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/dashboard",
      })
      if (result.error) {
        toast.error(result.error.message ?? "Registration failed")
        return
      }
      toast.success("Account created!")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }
  async function handleGoogleSignIn() {
      setGoogleLoading(true)
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/dashboard",
        })
      } catch {
        toast.error("Google sign-in failed. Try again.")
        setGoogleLoading(false)
      }
    }

  return (
    <div className="space-y-4">
      {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="
                w-full h-10 relative
                bg-transparent
                border border-border/60
                hover:border-border
                hover:bg-muted/20
                text-foreground/80 hover:text-foreground
                transition-all duration-200
                shadow-none
                font-normal
                group
              "
            >
              {googleLoading ? (
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                  <span className="text-sm">Redirecting...</span>
                </motion.div>
              ) : (
                <span className="flex items-center gap-2.5">
                  <GoogleLogo className="h-4 w-4 shrink-0" />
                  <span className="text-sm">Continue with Google</span>
                </span>
              )}
            </Button>
      
            {/* Divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[11px] font-medium text-muted-foreground/40 uppercase tracking-widest select-none">
                or
              </span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
      

    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Full name
        </Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="name"
            type="text"
            placeholder="Anurag Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="pl-9 bg-muted/30 border-border/50 focus-visible:ring-primary/30 focus-visible:border-primary/50 placeholder:text-muted-foreground/30 h-10"
          />
        </div>
      </div>

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
            placeholder="Min 8 characters"
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
        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  password.length >= level * 3
                    ? level <= 1 ? "bg-red-400"
                      : level <= 2 ? "bg-amber-400"
                      : level <= 3 ? "bg-yellow-400"
                      : "bg-emerald-400"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>

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
            Creating account...
          </motion.div>
        ) : (
          <span className="flex items-center gap-2">
            Create account
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        )}
      </Button>
    </form>
    </div>
  )
}