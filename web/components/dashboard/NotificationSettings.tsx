// components/dashboard/NotificationSettings.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  SlackLogoIcon,
  BellIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import type { InferSelectModel } from "drizzle-orm"
import type { notifications } from "@/lib/db/schema"

type Notification = InferSelectModel<typeof notifications>

type NotificationSettingsProps = {
  projectId: string
  initial: Notification | null
}

export function NotificationSettings({ projectId, initial }: NotificationSettingsProps) {
  const [slackUrl, setSlackUrl] = useState(initial?.slackWebhookUrl ?? "")
  const [discordUrl, setDiscordUrl] = useState(initial?.discordWebhookUrl ?? "")
  const [alertOnBreaking, setAlertOnBreaking] = useState(initial?.alertOnBreaking ?? true)
  const [alertOnAny, setAlertOnAny] = useState(initial?.alertOnAny ?? false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, slackWebhookUrl: slackUrl, discordWebhookUrl: discordUrl, alertOnBreaking, alertOnAny }),
      })
      const json = await res.json()
      if (!json.success) { toast.error(json.error ?? "Save failed"); return }
      toast.success("Settings saved!")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Section header */}
      <div className="flex items-center gap-2">
        <BellIcon weight="fill" className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 ml-auto">
          Webhooks
        </Badge>
      </div>

      {/* Slack */}
      <div className="border border-border/60 bg-card/50 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[#4A154B]/20 border border-[#4A154B]/30 flex items-center justify-center">
            <SlackLogoIcon weight="fill" className="h-3.5 w-3.5 text-[#E01E5A]" />
          </div>
          <span className="text-xs font-semibold text-foreground">Slack</span>
          {slackUrl && (
            <Badge variant="outline" className="ml-auto text-[10px] font-mono border-[#B7FF3C]/30 text-[#B7FF3C] bg-[#B7FF3C]/10">
              Connected
            </Badge>
          )}
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Webhook URL
            </Label>
            <Input
              placeholder="https://hooks.slack.com/services/..."
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
              className="bg-muted/30 border-border/50 focus-visible:ring-primary/30 font-mono text-xs h-9"
            />
          </div>
          <p className="text-[11px] text-muted-foreground/50">
            Go to Slack → Apps → Incoming Webhooks → Add New. Paste URL here.
          </p>
        </div>
      </div>

      {/* Discord */}
      <div className="border border-border/60 bg-card/50 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#5865F2]">D</span>
          </div>
          <span className="text-xs font-semibold text-foreground">Discord</span>
          {discordUrl && (
            <Badge variant="outline" className="ml-auto text-[10px] font-mono border-[#B7FF3C]/30 text-[#B7FF3C] bg-[#B7FF3C]/10">
              Connected
            </Badge>
          )}
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Webhook URL
            </Label>
            <Input
              placeholder="https://discord.com/api/webhooks/..."
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              className="bg-muted/30 border-border/50 focus-visible:ring-primary/30 font-mono text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* Alert triggers */}
      <div className="border border-border/60 bg-card/50 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Alert triggers</span>
        </div>
        <div className="px-4 py-4 space-y-3">
          {[
            {
              key: "breaking",
              label: "Breaking changes only",
              desc: "Alert when a breaking change is force published",
              value: alertOnBreaking,
              set: setAlertOnBreaking,
              icon: WarningIcon,
              color: "text-[#F15A3C]",
            },
            {
              key: "any",
              label: "All publishes",
              desc: "Alert on every contract update",
              value: alertOnAny,
              set: setAlertOnAny,
              icon: BellIcon,
              color: "text-[#B7FF3C]",
            },
          ].map(({ key, label, desc, value, set, icon: Icon, color }) => (
            <label
              key={key}
              className={cn(
                "flex items-start gap-3 p-3 border cursor-pointer transition-colors",
                value ? "border-[#B7FF3C]/30 bg-[#B7FF3C]/5" : "border-border/40 bg-muted/20 hover:border-border/60"
              )}
            >
              <div className={cn(
                "h-8 w-8 border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                value ? "bg-[#B7FF3C]/10 border-[#B7FF3C]/30" : "bg-muted/40 border-border/40"
              )}>
                <Icon weight="fill" className={cn("h-4 w-4", value ? color : "text-muted-foreground/40")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div className={cn(
                "h-5 w-9 rounded-full border-2 transition-colors relative shrink-0 mt-1",
                value ? "bg-[#B7FF3C] border-[#B7FF3C]" : "bg-muted border-border/50"
              )}>
                <div className={cn(
                  "absolute top-0.5 h-3 w-3 rounded-full bg-[#10100B] transition-transform shadow-sm",
                  value ? "translate-x-4" : "translate-x-0.5 bg-white"
                )} />
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={value}
                onChange={(e) => set(e.target.checked)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={loading}
        className={cn(
          "w-full h-10 font-bold text-xs uppercase tracking-wide shadow-lg transition-all",
          saved
            ? "bg-emerald-500 hover:bg-emerald-500 text-white shadow-emerald-500/20"
            : "bg-foreground text-background hover:bg-foreground/90 shadow-[2px_2px_0_rgba(183,255,60,0.8)]"
        )}
      >
        {loading ? (
          <motion.div className="flex items-center gap-2" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Saving...
          </motion.div>
        ) : saved ? (
          <span className="flex items-center gap-2">
            <CheckCircleIcon weight="fill" className="h-4 w-4" />
            Saved
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Save Settings
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  )
}