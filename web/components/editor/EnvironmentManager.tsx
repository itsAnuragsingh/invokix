// components/editor/EnvironmentManager.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  GlobeIcon,
  StarIcon,
  FlaskIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

// ── Types ─────────────────────────────────────────────────────────────────────
type Environment = {
  id: string
  projectId: string
  name: string
  baseUrl: string
  isDefault: boolean
  createdAt: Date | string
}

type EnvironmentManagerProps = {
  projectId: string
  initialEnvironments: Environment[]
}

// ── Env icon by name ──────────────────────────────────────────────────────────
function EnvIcon({ name }: { name: string }) {
  const lower = name.toLowerCase()
  if (lower.includes("prod"))    return <ShieldCheckIcon size={14} weight="fill" className="text-red-400" />
  if (lower.includes("staging") || lower.includes("stage")) return <FlaskIcon size={14} weight="fill" className="text-amber-400" />
  if (lower.includes("mock") || lower.includes("local"))    return <GlobeIcon size={14} weight="fill" className="text-emerald-400" />
  return <GlobeIcon size={14} weight="fill" className="text-primary" />
}

// ── Env color by name ─────────────────────────────────────────────────────────
function envColor(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes("prod"))    return "border-red-500/20 bg-red-500/5"
  if (lower.includes("staging") || lower.includes("stage")) return "border-amber-500/20 bg-amber-500/5"
  if (lower.includes("mock") || lower.includes("local"))    return "border-emerald-500/20 bg-emerald-500/5"
  return "border-primary/20 bg-primary/5"
}

// ── Add / Edit form ───────────────────────────────────────────────────────────
type EnvFormProps = {
  initial?: { name: string; baseUrl: string; isDefault: boolean }
  onSave: (data: { name: string; baseUrl: string; isDefault: boolean }) => Promise<void>
  onCancel: () => void
  saving: boolean
}

function EnvForm({ initial, onSave, onCancel, saving }: EnvFormProps) {
  const [name, setName]         = useState(initial?.name ?? "")
  const [baseUrl, setBaseUrl]   = useState(initial?.baseUrl ?? "")
  const [isDefault, setDefault] = useState(initial?.isDefault ?? false)

  async function handleSubmit() {
    if (!name.trim()) { toast.error("Name is required"); return }
    if (!baseUrl.trim()) { toast.error("Base URL is required"); return }
    try { new URL(baseUrl) } catch { toast.error("Must be a valid URL"); return }
    await onSave({ name: name.trim(), baseUrl: baseUrl.trim(), isDefault })
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Production"
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm
              text-foreground placeholder:text-muted-foreground/40 focus:outline-none
              focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Base URL
          </label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.yourcompany.com"
            className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm
              text-foreground placeholder:text-muted-foreground/40 focus:outline-none
              focus:border-primary/50 transition-colors font-mono"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <div
          onClick={() => setDefault(!isDefault)}
          className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
            isDefault
              ? "bg-primary border-primary"
              : "border-border/50 bg-background"
          }`}
        >
          {isDefault && <CheckIcon size={10} weight="bold" className="text-white" />}
        </div>
        <span className="text-xs text-muted-foreground">Set as default environment</span>
      </label>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-primary text-white hover:bg-primary/90 disabled:opacity-50
            transition-all duration-150"
        >
          <CheckIcon size={12} weight="bold" />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-white/5 border border-white/8 text-zinc-400 hover:text-white
            transition-all duration-150"
        >
          <XIcon size={12} weight="bold" />
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function EnvironmentManager({
  projectId,
  initialEnvironments,
}: EnvironmentManagerProps) {
  const [envs, setEnvs]             = useState<Environment[]>(initialEnvironments)
  const [showAdd, setShowAdd]       = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving]         = useState(false)

  // ── Create ──────────────────────────────────────────────────────────────────
  async function handleCreate(data: { name: string; baseUrl: string; isDefault: boolean }) {
    setSaving(true)
    try {
      const res = await fetch(`/api/environments/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json() as { success: boolean; data?: { environment: Environment }; error?: string }
      if (!json.success) { toast.error(json.error ?? "Failed to create"); return }

      // If new env is default — unset others locally
      let updated = envs
      if (data.isDefault) {
        updated = envs.map((e) => ({ ...e, isDefault: false }))
      }
      setEnvs([...updated, json.data!.environment])
      setShowAdd(false)
      toast.success("Environment added")
    } catch {
      toast.error("Failed to create environment")
    } finally {
      setSaving(false)
    }
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  async function handleUpdate(
    envId: string,
    data: { name: string; baseUrl: string; isDefault: boolean }
  ) {
    setSaving(true)
    try {
      const res = await fetch(`/api/environments/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envId, ...data }),
      })
      const json = await res.json() as { success: boolean; data?: { environment: Environment }; error?: string }
      if (!json.success) { toast.error(json.error ?? "Failed to update"); return }

      let updated = envs
      if (data.isDefault) {
        updated = envs.map((e) => ({ ...e, isDefault: false }))
      }
      setEnvs(updated.map((e) => e.id === envId ? json.data!.environment : e))
      setEditingId(null)
      toast.success("Environment updated")
    } catch {
      toast.error("Failed to update environment")
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(envId: string) {
    setDeletingId(envId)
    try {
      const res = await fetch(`/api/environments/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envId }),
      })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) { toast.error(json.error ?? "Failed to delete"); return }

      setEnvs(envs.filter((e) => e.id !== envId))
      toast.success("Environment removed")
    } catch {
      toast.error("Failed to delete environment")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Environments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your API base URLs for Mock, Staging, and Production.
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-primary text-white hover:bg-primary/90 transition-all duration-150 shrink-0"
          >
            <PlusIcon size={12} weight="bold" />
            Add Environment
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <EnvForm
              onSave={handleCreate}
              onCancel={() => setShowAdd(false)}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {envs.length === 0 && !showAdd && (
        <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-12 flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center">
            <GlobeIcon size={20} className="text-muted-foreground/30" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground/70">No environments yet</p>
            <p className="text-xs text-muted-foreground/50 max-w-56 text-center">
              Add Mock, Staging, and Production URLs to switch between them in one click.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-primary text-white hover:bg-primary/90 transition-all duration-150"
          >
            <PlusIcon size={12} weight="bold" />
            Add your first environment
          </button>
        </div>
      )}

      {/* Environment list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {envs.map((env) => (
            <motion.div
              key={env.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {editingId === env.id ? (
                <EnvForm
                  initial={{ name: env.name, baseUrl: env.baseUrl, isDefault: env.isDefault }}
                  onSave={(data) => handleUpdate(env.id, data)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <div className={`rounded-xl border p-4 flex items-center gap-4 group transition-all duration-150 ${envColor(env.name)}`}>
                  {/* Icon */}
                  <div className="h-8 w-8 rounded-lg bg-background/50 border border-border/30 flex items-center justify-center shrink-0">
                    <EnvIcon name={env.name} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{env.name}</span>
                      {env.isDefault && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                          <StarIcon size={8} weight="fill" />
                          Default
                        </span>
                      )}
                    </div>
                    <code className="font-mono text-xs text-muted-foreground truncate block">
                      {env.baseUrl}
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => setEditingId(env.id)}
                      className="h-7 w-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center
                        text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-150"
                    >
                      <PencilSimpleIcon size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(env.id)}
                      disabled={deletingId === env.id}
                      className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center
                        text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-all duration-150"
                    >
                      {deletingId === env.id
                        ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}>
                            <XIcon size={10} />
                          </motion.div>
                        : <TrashIcon size={12} />
                      }
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tip */}
      {envs.length > 0 && (
        <p className="text-[11px] text-muted-foreground/40 text-center">
          Switch environments across your entire contract with one click — coming soon.
        </p>
      )}
    </div>
  )
}