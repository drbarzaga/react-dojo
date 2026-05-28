"use client"

import type { TypeScriptRecipe, RecipeCategory } from "@/content/typescript-recipes/types"
import { useLocaleRouter } from "@/hooks/use-locale-router"
import { useTranslations } from "next-intl"
import { useState } from "react"

const categoryColors: Record<RecipeCategory, string> = {
  props: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  events: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  hooks: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  patterns: "bg-amber-400/10 text-amber-400 border-amber-400/20",
}

const CATEGORIES: Array<{ id: RecipeCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "props", label: "Props" },
  { id: "events", label: "Events" },
  { id: "hooks", label: "Hooks" },
  { id: "patterns", label: "Patterns" },
]

interface Props {
  recipes: TypeScriptRecipe[]
}

export function TypeScriptListingPage({ recipes }: Props) {
  const t = useTranslations("TypeScript")
  const { push } = useLocaleRouter()
  const [activeCategory, setActiveCategory] = useState<RecipeCategory | "all">("all")

  const filtered =
    activeCategory === "all" ? recipes : recipes.filter((r) => r.category === activeCategory)

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-10 md:px-12 md:py-20">
      {/* Header */}
      <div className="mb-10">
        <div className="text-fg-dim mb-3 flex items-center gap-3 text-[11px] tracking-[0.14em] uppercase">
          <span>{t("sectionLabel")}</span>
          <span className="bg-fg-faint h-px w-4" />
          <span>{t("recipeCount", { count: recipes.length })}</span>
        </div>
        <h1 className="text-fg font-mono text-[32px] leading-none font-medium">{t("title")}</h1>
        <p className="text-fg-muted mt-4 max-w-lg text-[16px] leading-[1.65]">{t("description")}</p>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={[
              "border-line rounded-md border px-3 py-1.5 font-mono text-[12px] transition-colors",
              activeCategory === cat.id
                ? "border-fg-strong bg-bg-raise text-fg"
                : "border-line text-fg-dim hover:border-fg-strong hover:text-fg-muted",
            ].join(" ")}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recipe cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => push(`/typescript/${recipe.id}`)}
            className="border-line hover:border-fg-strong bg-bg flex cursor-pointer flex-col gap-3 rounded-lg border p-5 text-left transition-all hover:shadow-sm"
          >
            <span
              className={`border-line self-start rounded border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${categoryColors[recipe.category]}`}
            >
              {recipe.category}
            </span>
            <div>
              <h2 className="text-fg font-mono text-[15px] font-medium">{recipe.label}</h2>
              <p className="text-fg-muted mt-1.5 text-[13px] leading-[1.6]">{recipe.description}</p>
            </div>
            <span className="text-fg-dim mt-auto text-[11px]">{t("viewRecipe")} →</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="border-line rounded-lg border px-6 py-16 text-center">
          <p className="text-fg-dim text-[13px]">{t("noRecipes")}</p>
        </div>
      )}
    </div>
  )
}
