export type RecipeCategory = "props" | "events" | "hooks" | "patterns"

export interface TypeScriptRecipe {
  id: string
  label: string
  description: string
  category: RecipeCategory
  code: string
  do: string
  dont: string
  playground: {
    files: Record<string, string>
    dependencies?: Record<string, string>
  }
}
