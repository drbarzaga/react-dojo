export type { TypeScriptRecipe, RecipeCategory } from "@/content/typescript-recipes/types"

import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

import { typingProps } from "./typing-props"
import { typingEvents } from "./typing-events"
import { typingRefs } from "./typing-refs"
import { typingGenerics } from "./typing-generics"
import { typingContext } from "./typing-context"
import { extendHtmlProps } from "./extend-html-props"
import { discriminatedUnions } from "./discriminated-unions"
import { forwardRef } from "./forward-ref"

export const allRecipes: TypeScriptRecipe[] = [
  typingProps,
  typingEvents,
  typingRefs,
  typingGenerics,
  typingContext,
  extendHtmlProps,
  discriminatedUnions,
  forwardRef,
]

export const recipeIndex: Record<string, TypeScriptRecipe> = Object.fromEntries(
  allRecipes.map((r) => [r.id, r])
)
