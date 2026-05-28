import type { Locale } from "@/i18n/routing"
import type { TypeScriptRecipe } from "./types"

interface RecipesBundle {
  allRecipes: TypeScriptRecipe[]
  recipeIndex: Record<string, TypeScriptRecipe>
}

export async function getRecipesForLocale(locale: Locale): Promise<RecipesBundle> {
  if (locale === "es") {
    return import("@/content/typescript-recipes")
  }
  return import("@/content/en/typescript-recipes")
}
