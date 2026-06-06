import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { toLocale } from "@/lib/to-locale"
import { allRecipes as allRecipesEs } from "@/content/typescript-recipes"
import { getRecipesForLocale } from "@/content/typescript-recipes/loader"
import { TypeScriptDetailPage } from "@/components/typescript-detail-page"
import { buildPageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) => allRecipesEs.map((r) => ({ locale, id: r.id })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const { recipeIndex } = await getRecipesForLocale(toLocale(locale))
  const recipe = recipeIndex[id]
  if (!recipe) return {}
  return buildPageMetadata({
    title: recipe.label,
    description: recipe.description,
    path: `/typescript/${id}`,
    locale,
  })
}

export default async function TypeScriptDetailRoute({ params }: Props) {
  const { locale, id } = await params
  const { allRecipes, recipeIndex } = await getRecipesForLocale(toLocale(locale))
  const recipe = recipeIndex[id]
  if (!recipe) notFound()

  const idx = allRecipes.findIndex((r) => r.id === id)
  const prev = idx > 0 ? allRecipes[idx - 1] : undefined
  const next = idx < allRecipes.length - 1 ? allRecipes[idx + 1] : undefined

  return <TypeScriptDetailPage recipe={recipe} prev={prev} next={next} />
}
