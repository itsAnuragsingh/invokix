"use client"

import { useState } from "react"
import {
  Users,
  Shield,
  Layers,
  Sparkle,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Globe,
  Radio,
  Check,
  AlertCircle,
  UserCheck,
} from "lucide-react"

type UserItem = {
  id: string
  name: string
  email: string
  plan: string
  createdAt: string
  dodoCustomerId: string | null
}

type PlatformSettingsData = {
  billingMode: "beta" | "all"
  betaEmails: string[]
  adminEmails: string[]
}

type Props = {
  stats: {
    totalUsers: number
    totalProjects: number
    proSubscribers: number
    totalContracts: number
  }
  users: UserItem[]
  initialSettings: PlatformSettingsData
}

export function AdminView({ stats, users: initialUsers, initialSettings }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState("")
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  // Real-time Platform Settings state
  const [settings, setSettings] = useState<PlatformSettingsData>(initialSettings)
  const [savingSettings, setSavingSettings] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Input states
  const [newBetaEmail, setNewBetaEmail] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  async function persistSettings(updated: Partial<PlatformSettingsData>) {
    setSavingSettings(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      const data = await res.json()
      if (data.success && data.settings) {
        setSettings(data.settings)
        showToast("Platform settings saved to database!")
      } else {
        alert(data.error || "Failed to update settings")
      }
    } catch {
      alert("Failed to connect to admin settings API")
    } finally {
      setSavingSettings(false)
    }
  }

  // Toggle Billing Mode
  async function handleToggleBillingMode(mode: "beta" | "all") {
    if (mode === settings.billingMode) return
    const nextSettings = { ...settings, billingMode: mode }
    setSettings(nextSettings)
    await persistSettings({ billingMode: mode })
  }

  // Add Beta Tester Email
  async function handleAddBetaEmail(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const email = newBetaEmail.trim().toLowerCase()
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.")
      return
    }
    if (settings.betaEmails.map((e) => e.toLowerCase()).includes(email)) {
      alert("This email is already in the beta whitelist.")
      return
    }

    const updated = [...settings.betaEmails, email]
    setSettings((prev) => ({ ...prev, betaEmails: updated }))
    setNewBetaEmail("")
    await persistSettings({ betaEmails: updated })
  }

  // Remove Beta Tester Email
  async function handleRemoveBetaEmail(emailToRemove: string) {
    const updated = settings.betaEmails.filter(
      (e) => e.toLowerCase() !== emailToRemove.toLowerCase()
    )
    setSettings((prev) => ({ ...prev, betaEmails: updated }))
    await persistSettings({ betaEmails: updated })
  }

  // Add Admin Email
  async function handleAddAdminEmail(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const email = newAdminEmail.trim().toLowerCase()
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.")
      return
    }
    if (settings.adminEmails.map((e) => e.toLowerCase()).includes(email)) {
      alert("This email is already an admin.")
      return
    }

    const updated = [...settings.adminEmails, email]
    setSettings((prev) => ({ ...prev, adminEmails: updated }))
    setNewAdminEmail("")
    await persistSettings({ adminEmails: updated })
  }

  // Remove Admin Email
  async function handleRemoveAdminEmail(emailToRemove: string) {
    if (emailToRemove.toLowerCase() === "itsanurag707@gmail.com") {
      alert("Cannot remove primary owner admin account.")
      return
    }
    const updated = settings.adminEmails.filter(
      (e) => e.toLowerCase() !== emailToRemove.toLowerCase()
    )
    setSettings((prev) => ({ ...prev, adminEmails: updated }))
    await persistSettings({ adminEmails: updated })
  }

  // User Plan Overrides
  async function handleTogglePlan(userId: string, currentPlan: string) {
    const nextPlan = currentPlan === "pro" ? "free" : "pro"
    setLoadingUserId(userId)
    try {
      const res = await fetch("/api/admin/toggle-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, plan: nextPlan }),
      })
      const data = await res.json()
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, plan: nextPlan } : u))
        )
        showToast(`User plan updated to ${nextPlan.toUpperCase()}`)
      } else {
        alert(data.error || "Failed to update plan")
      }
    } catch {
      alert("Failed to toggle plan")
    } finally {
      setLoadingUserId(null)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-6xl pb-16 animate-fade-up">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/90 backdrop-blur-md px-4 py-3 text-xs font-semibold text-emerald-200 shadow-2xl shadow-emerald-950/60 animate-in fade-in slide-in-from-top-3">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pt-4 pb-8 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-mono font-semibold text-primary mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Staff Administration</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Invokix Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live launch mode toggle, tester whitelist, admin permissions, and user plan overrides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savingSettings ? (
            <span className="text-xs font-mono text-muted-foreground animate-pulse">
              Saving to DB...
            </span>
          ) : (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live DB Config Active
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm">
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" /> Total Users
          </span>
          <p className="mt-2 text-3xl font-display font-bold text-foreground">{stats.totalUsers}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm">
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Sparkle className="h-3.5 w-3.5 text-[#B7FF3C]" /> Pro Subscribers
          </span>
          <p className="mt-2 text-3xl font-display font-bold text-[#B7FF3C]">{stats.proSubscribers}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm">
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-400" /> Active Projects
          </span>
          <p className="mt-2 text-3xl font-display font-bold text-foreground">{stats.totalProjects}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm">
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" /> API Contracts
          </span>
          <p className="mt-2 text-3xl font-display font-bold text-foreground">{stats.totalContracts}</p>
        </div>
      </div>

      {/* SECTION 1: LAUNCH GATE SWITCH (NO ENV REQUIRED) */}
      <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-foreground">
                Production Billing Gate
              </h2>
              <span
                className={
                  settings.billingMode === "all"
                    ? "rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-400"
                    : "rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-400"
                }
              >
                {settings.billingMode === "all" ? "PUBLIC TO ALL" : "PRIVATE BETA"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Switch anytime without touching <code className="text-foreground">.env</code> or redeploying. Changes persist immediately in PostgreSQL.
            </p>
          </div>
        </div>

        {/* 1-Click Toggle Options */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Private Beta */}
          <div
            onClick={() => handleToggleBillingMode("beta")}
            className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
              settings.billingMode === "beta"
                ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                : "border-border/60 bg-card/20 hover:border-border hover:bg-card/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    settings.billingMode === "beta"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Private Beta Mode</h4>
                  <span className="text-[11px] font-mono text-amber-400">Whitelist Only</span>
                </div>
              </div>
              {settings.billingMode === "beta" && (
                <div className="h-5 w-5 rounded-full bg-amber-500 grid place-items-center text-black">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Only emails listed in the <strong>Tester Whitelist</strong> below can initiate checkout. Unlisted users see a disabled <em>"Pro Launching Soon (Private Beta)"</em> button.
            </p>
          </div>

          {/* Option B: Public Launch */}
          <div
            onClick={() => handleToggleBillingMode("all")}
            className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
              settings.billingMode === "all"
                ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                : "border-border/60 bg-card/20 hover:border-border hover:bg-card/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    settings.billingMode === "all"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Public Launch Mode</h4>
                  <span className="text-[11px] font-mono text-emerald-400">Open to Worldwide Users</span>
                </div>
              </div>
              {settings.billingMode === "all" && (
                <div className="h-5 w-5 rounded-full bg-emerald-500 grid place-items-center text-black">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Every single user on Invokix can see and click <strong>"Upgrade to Pro"</strong> to complete Dodo Payments checkout.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACCESS LISTS (TESTERS & ADMINS) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: Beta Testers Whitelist */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Beta Tester Whitelist
                </h3>
              </div>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-mono font-semibold text-primary">
                {settings.betaEmails.length} active
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Users with these emails can test live Dodo checkout even while Invokix is in Private Beta.
            </p>

            {/* Email Chips */}
            <div className="mt-4 flex flex-wrap gap-2 min-h-[64px]">
              {settings.betaEmails.length > 0 ? (
                settings.betaEmails.map((email) => (
                  <div
                    key={email}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-mono text-foreground"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemoveBetaEmail(email)}
                      className="text-muted-foreground hover:text-red-400 transition-colors p-0.5"
                      title="Remove tester"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground italic py-2">
                  No beta testers added yet.
                </div>
              )}
            </div>
          </div>

          {/* Add Tester Form */}
          <form onSubmit={handleAddBetaEmail} className="mt-6 flex items-center gap-2">
            <input
              type="email"
              placeholder="e.g. teammate@domain.com"
              value={newBetaEmail}
              onChange={(e) => setNewBetaEmail(e.target.value)}
              className="flex-1 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={savingSettings || !newBetaEmail.trim()}
              className="rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Tester</span>
            </button>
          </form>
        </div>

        {/* Card B: Admin Staff Emails */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <h3 className="font-display text-base font-bold text-foreground">
                  Admin Staff Members
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-mono font-semibold text-emerald-400">
                {settings.adminEmails.length} staff
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Team members granted full access to this Admin Dashboard & user overrides.
            </p>

            {/* Admin Chips */}
            <div className="mt-4 flex flex-wrap gap-2 min-h-[64px]">
              {settings.adminEmails.length > 0 ? (
                settings.adminEmails.map((email) => {
                  const isOwner = email.toLowerCase() === "itsanurag707@gmail.com"
                  return (
                    <div
                      key={email}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-mono text-foreground"
                    >
                      <span>{email}</span>
                      {isOwner ? (
                        <span className="text-[10px] text-amber-400 font-bold ml-1">(Owner)</span>
                      ) : (
                        <button
                          onClick={() => handleRemoveAdminEmail(email)}
                          className="text-muted-foreground hover:text-red-400 transition-colors p-0.5"
                          title="Remove admin"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-xs text-muted-foreground italic py-2">
                  No additional admins.
                </div>
              )}
            </div>
          </div>

          {/* Add Admin Form */}
          <form onSubmit={handleAddAdminEmail} className="mt-6 flex items-center gap-2">
            <input
              type="email"
              placeholder="e.g. cofounder@domain.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={savingSettings || !newAdminEmail.trim()}
              className="rounded-xl border border-border/80 bg-muted/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Admin</span>
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 3: USER MANAGEMENT & PLAN OVERRIDES */}
      <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              User Directory & Manual Plan Overrides
            </h3>
            <p className="text-xs text-muted-foreground">
              Instantly grant Pro or revert to Free for testing or customer support without touching Dodo.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-muted/40 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-mono">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Current Plan</th>
                <th className="pb-3 font-semibold">Joined</th>
                <th className="pb-3 font-semibold text-right">Plan Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 text-foreground font-sans font-medium">{user.name}</td>
                  <td className="py-3 text-muted-foreground">{user.email}</td>
                  <td className="py-3">
                    <span
                      className={
                        user.plan === "pro"
                          ? "rounded-full bg-[#B7FF3C]/15 border border-[#B7FF3C]/30 px-2 py-0.5 text-[10px] font-bold text-[#B7FF3C]"
                          : "rounded-full bg-muted border border-border/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                      }
                    >
                      {user.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground/80">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleTogglePlan(user.id, user.plan)}
                      disabled={loadingUserId === user.id}
                      className="rounded-lg border border-border/80 bg-muted/40 px-3 py-1 text-[11px] font-sans font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {loadingUserId === user.id
                        ? "Updating..."
                        : user.plan === "pro"
                        ? "Revoke to Free"
                        : "Grant Pro"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
