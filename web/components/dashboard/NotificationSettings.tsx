// components/dashboard/NotificationSettings.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  SlackLogoIcon,
  DiscordLogoIcon,
  BellIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  WarningIcon,
  PaperPlaneTiltIcon,
  TrashIcon,
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
  const searchParams = useSearchParams()
  const [slackUrl, setSlackUrl] = useState(initial?.slackWebhookUrl ?? "")
  const [discordUrl, setDiscordUrl] = useState(initial?.discordWebhookUrl ?? "")
  const [alertOnBreaking, setAlertOnBreaking] = useState(initial?.alertOnBreaking ?? true)
  const [alertOnAny, setAlertOnAny] = useState(initial?.alertOnAny ?? false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testingSlack, setTestingSlack] = useState(false)
  const [testingDiscord, setTestingDiscord] = useState(false)
  const [showManualDiscord, setShowManualDiscord] = useState(false)
  const [showManualSlack, setShowManualSlack] = useState(false)

  // Handle OAuth redirect query status
  useEffect(() => {
    const connected = searchParams.get("connected")
    const error = searchParams.get("error")

    if (connected === "discord") {
      toast.success("Discord server connected successfully! Check your channel for the test alert.")
    } else if (connected === "slack") {
      toast.success("Slack workspace connected successfully! Check your channel for the test alert.")
    } else if (error === "discord_not_configured") {
      toast.error("DISCORD_CLIENT_ID not found in .env. You can still paste your webhook manually below.")
      setShowManualDiscord(true)
    } else if (error === "slack_not_configured") {
      toast.error("SLACK_CLIENT_ID not found in .env. You can still paste your webhook manually below.")
      setShowManualSlack(true)
    } else if (error === "discord_cancelled" || error === "slack_cancelled") {
      toast.info("Integration authorization was cancelled.")
    } else if (error) {
      toast.error("Connection failed: " + error)
    }
  }, [searchParams])

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          slackWebhookUrl: slackUrl,
          discordWebhookUrl: discordUrl,
          alertOnBreaking,
          alertOnAny,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error ?? "Save failed")
        return
      }
      toast.success("Settings saved!")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  async function handleTest(type: "slack" | "discord") {
    const isSlack = type === "slack"
    if (isSlack) setTestingSlack(true)
    else setTestingDiscord(true)

    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, type }),
      })
      const json = await res.json()
      if (!json.success) {
        toast.error(json.error ?? `Failed to send ${type} test alert`)
      } else {
        toast.success(`Test alert sent to ${isSlack ? "Slack" : "Discord"}! Check your channel.`)
      }
    } catch {
      toast.error(`Failed to send test alert to ${type}`)
    } finally {
      if (isSlack) setTestingSlack(false)
      else setTestingDiscord(false)
    }
  }

  async function handleDisconnect(type: "slack" | "discord") {
    const nextSlack = type === "slack" ? "" : slackUrl
    const nextDiscord = type === "discord" ? "" : discordUrl

    if (type === "slack") setSlackUrl("")
    else setDiscordUrl("")

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          slackWebhookUrl: nextSlack,
          discordWebhookUrl: nextDiscord,
          alertOnBreaking,
          alertOnAny,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Disconnected ${type === "slack" ? "Slack" : "Discord"}`)
      }
    } catch {
      toast.error("Failed to disconnect")
    }
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <BellIcon weight="fill" className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Notifications & Alerts</h2>
        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 ml-auto">
          Signals
        </Badge>
      </div>

      {/* Discord Integration Card */}
      <div className="border border-border/60 bg-card/50 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center">
              <DiscordLogoIcon weight="fill" className="h-3.5 w-3.5 text-[#5865F2]" />
            </div>
            <span className="text-xs font-semibold text-foreground">Discord</span>
          </div>

          {discordUrl ? (
            <Badge variant="outline" className="text-[10px] font-mono border-[#B7FF3C]/30 text-[#B7FF3C] bg-[#B7FF3C]/10">
              🟢 Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground bg-muted/20">
              Not Connected
            </Badge>
          )}
        </div>

        <div className="px-4 py-4 space-y-3">
          {discordUrl ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Your Discord server is connected to receive instant alerts when breaking changes occur.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest("discord")}
                  disabled={testingDiscord}
                  className="h-8 text-xs font-semibold border-[#5865F2]/40 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-foreground"
                >
                  <PaperPlaneTiltIcon className="h-3.5 w-3.5 mr-1.5 text-[#5865F2]" />
                  {testingDiscord ? "Sending..." : "Send Test Alert"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDisconnect("discord")}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                >
                  <TrashIcon className="h-3.5 w-3.5 mr-1" />
                  Disconnect
                </Button>

                <button
                  type="button"
                  onClick={() => setShowManualDiscord(!showManualDiscord)}
                  className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground ml-auto underline"
                >
                  {showManualDiscord ? "Hide URL" : "View URL"}
                </button>
              </div>

              {showManualDiscord && (
                <div className="pt-2">
                  <Input
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    className="bg-muted/30 border-border/50 font-mono text-xs h-8 text-muted-foreground"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Connect your Discord server to get real-time signals before breaking API changes break client apps.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/api/integrations/discord?projectId=${projectId}`}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-none bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold shadow-[2px_2px_0_rgba(0,0,0,0.8)] transition-all cursor-pointer select-none"
                >
                  <DiscordLogoIcon weight="fill" className="h-4 w-4" />
                  <span>Connect Discord (1-Click)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowManualDiscord(!showManualDiscord)}
                  className="text-xs text-muted-foreground/60 hover:text-foreground underline"
                >
                  {showManualDiscord ? "Hide manual input" : "or enter webhook manually"}
                </button>
              </div>

              {showManualDiscord && (
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Discord Webhook URL
                  </Label>
                  <Input
                    placeholder="https://discord.com/api/webhooks/..."
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    className="bg-muted/30 border-border/50 focus-visible:ring-primary/30 font-mono text-xs h-9"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slack Integration Card */}
      <div className="border border-border/60 bg-card/50 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#4A154B]/20 border border-[#4A154B]/30 flex items-center justify-center">
              <SlackLogoIcon weight="fill" className="h-3.5 w-3.5 text-[#E01E5A]" />
            </div>
            <span className="text-xs font-semibold text-foreground">Slack</span>
          </div>

          {slackUrl ? (
            <Badge variant="outline" className="text-[10px] font-mono border-[#B7FF3C]/30 text-[#B7FF3C] bg-[#B7FF3C]/10">
              🟢 Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground bg-muted/20">
              Not Connected
            </Badge>
          )}
        </div>

        <div className="px-4 py-4 space-y-3">
          {slackUrl ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Your Slack workspace is connected to receive instant alerts when breaking changes occur.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest("slack")}
                  disabled={testingSlack}
                  className="h-8 text-xs font-semibold border-[#4A154B]/40 bg-[#4A154B]/10 hover:bg-[#4A154B]/20 text-foreground"
                >
                  <PaperPlaneTiltIcon className="h-3.5 w-3.5 mr-1.5 text-[#E01E5A]" />
                  {testingSlack ? "Sending..." : "Send Test Alert"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDisconnect("slack")}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive"
                >
                  <TrashIcon className="h-3.5 w-3.5 mr-1" />
                  Disconnect
                </Button>

                <button
                  type="button"
                  onClick={() => setShowManualSlack(!showManualSlack)}
                  className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground ml-auto underline"
                >
                  {showManualSlack ? "Hide URL" : "View URL"}
                </button>
              </div>

              {showManualSlack && (
                <div className="pt-2">
                  <Input
                    value={slackUrl}
                    onChange={(e) => setSlackUrl(e.target.value)}
                    className="bg-muted/30 border-border/50 font-mono text-xs h-8 text-muted-foreground"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Connect your Slack workspace to get real-time signals before breaking API changes hit client apps.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/api/integrations/slack?projectId=${projectId}`}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-none bg-[#4A154B] hover:bg-[#611f69] text-white text-xs font-bold shadow-[2px_2px_0_rgba(0,0,0,0.8)] transition-all cursor-pointer select-none"
                >
                  <SlackLogoIcon weight="fill" className="h-4 w-4 text-[#E01E5A]" />
                  <span>Connect Slack (1-Click)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowManualSlack(!showManualSlack)}
                  className="text-xs text-muted-foreground/60 hover:text-foreground underline"
                >
                  {showManualSlack ? "Hide manual input" : "or enter webhook manually"}
                </button>
              </div>

              {showManualSlack && (
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Slack Webhook URL
                  </Label>
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackUrl}
                    onChange={(e) => setSlackUrl(e.target.value)}
                    className="bg-muted/30 border-border/50 focus-visible:ring-primary/30 font-mono text-xs h-9"
                  />
                </div>
              )}
            </div>
          )}
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
              desc: "Alert when a breaking change is published (recommended)",
              value: alertOnBreaking,
              set: setAlertOnBreaking,
              icon: WarningIcon,
              color: "text-[#F15A3C]",
            },
            {
              key: "any",
              label: "All publishes",
              desc: "Alert on every single contract update",
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
              <div
                className={cn(
                  "h-8 w-8 border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                  value ? "bg-[#B7FF3C]/10 border-[#B7FF3C]/30" : "bg-muted/40 border-border/40"
                )}
              >
                <Icon weight="fill" className={cn("h-4 w-4", value ? color : "text-muted-foreground/40")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <div
                className={cn(
                  "h-5 w-9 rounded-full border-2 transition-colors relative shrink-0 mt-1",
                  value ? "bg-[#B7FF3C] border-[#B7FF3C]" : "bg-muted border-border/50"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full bg-[#10100B] transition-transform shadow-sm",
                    value ? "translate-x-4" : "translate-x-0.5 bg-white"
                  )}
                />
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

      {/* Save Settings Button */}
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
          <motion.div
            className="flex items-center gap-2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
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
            Save Notification Settings
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  )
}