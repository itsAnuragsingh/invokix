// components/templates/TemplateGrid.tsx
"use client"

import { useState } from "react"
import { TemplateCard } from "./TemplateCard"
import { ForkModal } from "./ForkModal"
import { MagnifyingGlassIcon, FadersIcon } from "@phosphor-icons/react"

type Template = {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  forkCount: number
  healthScore: number
  endpointCount: number
}

type Project = {
  id: string
  name: string
}

type TemplateGridProps = {
  templates: Template[]
  projects: Project[]
}

const CATEGORIES = [
  { value: "all", label: "All Templates" },
  { value: "payments", label: "Payments" },
  { value: "auth", label: "Auth & Identity" },
  { value: "storage", label: "Storage & Files" },
  { value: "messaging", label: "Messaging & Chat" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "analytics", label: "Analytics" },
]

export function TemplateGrid({ templates, projects }: TemplateGridProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [forkingTemplate, setForkingTemplate] = useState<Template | null>(null)

  const filtered = templates.filter((t) => {
    const categoryMatch = activeCategory === "all" || t.category === activeCategory
    const searchMatch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return categoryMatch && searchMatch
  })

  return (
    <div className="space-y-6">
      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/[0.02] border border-white/10 p-3 rounded-xl shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#FFD15C]/15 text-[#FFD15C] border border-[#FFD15C]/40 font-bold shadow-[2px_2px_0_rgba(0,0,0,0.5)]"
                    : "text-muted-foreground/70 border border-border/40 hover:text-foreground hover:bg-white/[0.05] hover:border-white/20"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 w-full md:w-64">
          <MagnifyingGlassIcon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates or tags..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-white/10 bg-white/[0.04] text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-[#FFD15C]/50 focus:outline-none focus:ring-1 focus:ring-[#FFD15C]/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Counter Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <FadersIcon size={14} className="text-[#FFD15C]" />
          <span>Showing <strong className="text-foreground font-mono">{filtered.length}</strong> contract presets</span>
        </div>
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-white/15 rounded-2xl bg-white/[0.01]">
          <p className="text-sm font-semibold text-foreground">No matching templates found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your category filter or search query</p>
          <button
            onClick={() => {
              setActiveCategory("all")
              setSearchQuery("")
            }}
            className="mt-2 text-xs font-mono font-bold text-[#FFD15C] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onFork={() => setForkingTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Fork Modal */}
      {forkingTemplate && (
        <ForkModal
          template={forkingTemplate}
          projects={projects}
          onClose={() => setForkingTemplate(null)}
        />
      )}
    </div>
  )
}