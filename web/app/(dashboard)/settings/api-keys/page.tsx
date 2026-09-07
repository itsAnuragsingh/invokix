import { requireSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { getCliTokensByUserId } from "@/lib/db/queries/cli"
import { ApiKeysManager } from "@/components/settings/ApiKeysManager"
import { KeyIcon, TerminalIcon } from "@phosphor-icons/react/dist/ssr"

export default async function ApiKeysPage() {
  const session = await requireSession()
  if (!session) redirect("/login")
  const tokens = await getCliTokensByUserId(session.user.id)
  return <div className="mx-auto max-w-4xl animate-fade-up"><header className="border-b border-border/45 pb-7"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Settings / Developer access</p><h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground">API keys.</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Create scoped credentials for the Invokix CLI and keep your contract workflow connected to every machine and pipeline.</p></header><section className="mt-8 grid gap-6 lg:grid-cols-[.82fr_1.18fr]"><div className="bg-[#111827] p-6 text-white shadow-xl shadow-black/15"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center bg-[#B7FF3C] text-[#10100B]"><TerminalIcon size={18} weight="bold" /></div><div><p className="text-sm font-bold">CLI quick start</p><p className="text-[11px] text-white/55">One command to pull the latest contract.</p></div></div><div className="mt-8 border border-white/10 bg-black/20 p-4 font-mono text-xs leading-7"><p className="text-[#B7FF3C]">$ npx invokix pull</p><p className="text-white/50">✓ authenticated</p><p className="text-white/50">✓ contract synced</p></div><p className="mt-5 text-xs leading-relaxed text-white/55">Create a key on the right, authenticate once, then use the CLI from any local environment or CI pipeline.</p></div><div className="border border-border/45 bg-card/25"><div className="flex items-center gap-3 border-b border-border/40 px-6 py-4"><KeyIcon size={18} className="text-primary" weight="fill" /><div><p className="text-sm font-bold text-foreground">Your credentials</p><p className="text-[11px] text-muted-foreground">{tokens.length} active key{tokens.length === 1 ? "" : "s"}</p></div></div><div className="p-6"><ApiKeysManager initialTokens={tokens} /></div></div></section></div>
}
