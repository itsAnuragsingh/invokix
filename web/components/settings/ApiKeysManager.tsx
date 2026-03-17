// components/settings/ApiKeysManager.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import {
  KeyIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

type Token = {
  id: string
  name: string
  lastUsedAt: Date | null
  createdAt: Date
}

type NewToken = {
  id: string
  name: string
  token: string
}

export function ApiKeysManager({ initialTokens }: { initialTokens: Token[] }) {
  const [tokens, setTokens] = useState<Token[]>(initialTokens)
  const [newToken, setNewToken] = useState<NewToken | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Give your key a name first")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/cli/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await res.json()
      if (!data.success) {
        toast.error(data.error ?? "Failed to create key")
        return
      }

      setNewToken(data.data)
      setTokens((prev) => [
        ...prev,
        { id: data.data.id, name: data.data.name, lastUsedAt: null, createdAt: new Date() },
      ])
      setName("")
      setShowForm(false)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/cli/tokens/${id}`, { method: "DELETE" })
      const data = await res.json()

      if (!data.success) {
        toast.error(data.error ?? "Failed to delete key")
        return
      }

      setTokens((prev) => prev.filter((t) => t.id !== id))
      toast.success("API key deleted")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeletingId(null)
    }
  }

  function handleCopy(token: string) {
    navigator.clipboard.writeText(token)
    setCopied(true)
    toast.success("API key copied — store it somewhere safe")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">

      {/* New token reveal — shown once after creation */}
      <AnimatePresence>
        {newToken && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <WarningIcon size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Copy your API key now
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This key will not be shown again. Store it somewhere safe like a password manager or your <code className="text-primary">.env.local</code> file.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs text-emerald-300 bg-black/30 border border-emerald-500/20 rounded-lg px-3 py-2.5 truncate">
                {newToken.token}
              </code>
              <button
                onClick={() => handleCopy(newToken.token)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium
                  bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                  hover:bg-emerald-500/20 transition-colors shrink-0"
              >
                {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => setNewToken(null)}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              I have saved my key — dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing tokens */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">
            {tokens.length === 0 ? "No API keys" : `${tokens.length} API key${tokens.length === 1 ? "" : "s"}`}
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              bg-primary/10 border border-primary/20 text-primary
              hover:bg-primary/20 transition-colors"
          >
            <PlusIcon size={12} />
            New key
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-border/40"
            >
              <div className="p-4 flex items-center gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Key name — e.g. laptop, github-actions"
                  className="flex-1 h-9 rounded-lg border border-border/50 bg-muted/20 px-3
                    text-sm text-foreground placeholder:text-muted-foreground/40
                    focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30
                    transition-colors"
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !name.trim()}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold
                    hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setName("") }}
                  className="h-9 px-3 rounded-lg border border-border/50 text-xs text-muted-foreground
                    hover:text-foreground hover:bg-muted/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Token list */}
        {tokens.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center">
              <KeyIcon size={20} weight="duotone" className="text-muted-foreground/30" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">No API keys yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a key to authenticate the CLI
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {tokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <KeyIcon size={14} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{token.name}</p>
                    <p className="text-[11px] text-muted-foreground/50">
                      Created {formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}
                      {token.lastUsedAt && (
                        <> · Last used {formatDistanceToNow(new Date(token.lastUsedAt), { addSuffix: true })}</>
                      )}
                      {!token.lastUsedAt && " · Never used"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(token.id)}
                  disabled={deletingId === token.id}
                  className={cn(
                    "h-8 w-8 rounded-lg border flex items-center justify-center transition-colors",
                    "border-border/50 text-muted-foreground/40",
                    "hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400",
                    "disabled:opacity-40"
                  )}
                >
                  <TrashIcon size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage hint */}
      <div className="rounded-xl border border-border/40 bg-muted/10 p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">Using your API key</p>
        <p className="text-xs text-muted-foreground">
          When running <code className="text-primary">npx invokix pull</code>, choose API key authentication and paste your key. Or set it as an environment variable:
        </p>
        <code className="block font-mono text-xs text-primary bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
          INVOKIX_API_KEY=ik_live_your_key_here
        </code>
      </div>

    </div>
  )
}