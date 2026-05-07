// components/templates/TemplateGrid.tsx
"use client"

import { useState } from "react"
import { TemplateCard } from "./TemplateCard"
import { ForkModal } from "./ForkModal"

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
  { value: "all", label: "All" },
  { value: "payments", label: "Payments" },
  { value: "auth", label: "Auth" },
  { value: "storage", label: "Storage" },
  { value: "messaging", label: "Messaging" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "analytics", label: "Analytics" },
]

export function TemplateGrid({ templates, projects }: TemplateGridProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [forkingTemplate, setForkingTemplate] = useState<Template | null>(null)

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category === activeCategory)

  return (
    <div className="space-y-5">

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              activeCategory === cat.value
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground/60 border border-border/50 hover:text-foreground hover:bg-muted/20"
            }`}
          >
            {cat.label}
          </button>
        ))}
        <span className="text-xs text-muted-foreground/40 ml-auto">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm font-medium text-foreground">No templates in this category yet</p>
          <p className="text-xs text-muted-foreground">More templates are being added regularly</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onFork={() => setForkingTemplate(template)}
            />
          ))}
        </div>
      )}

      {/* Fork modal */}
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