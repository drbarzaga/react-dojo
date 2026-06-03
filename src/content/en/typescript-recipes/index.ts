export type { TypeScriptRecipe, RecipeCategory } from "@/content/typescript-recipes/types"

import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

import { typingProps } from "./typing-props"
import { typingEvents } from "./typing-events"
import { typingRefs } from "./typing-refs"
import { typingGenerics } from "./typing-generics"
import { typingContext } from "./typing-context"
import { typingCustomHooks } from "./typing-custom-hooks"
import { extendHtmlProps } from "./extend-html-props"
import { discriminatedUnions } from "./discriminated-unions"
import { forwardRef } from "./forward-ref"
import { derivingProps } from "./deriving-props"
import { satisfiesOperator } from "./satisfies-operator"

export const allRecipes: TypeScriptRecipe[] = [
  typingProps,
  typingEvents,
  typingRefs,
  typingGenerics,
  typingContext,
  typingCustomHooks,
  extendHtmlProps,
  derivingProps,
  satisfiesOperator,
  discriminatedUnions,
  forwardRef,
]

export const recipeIndex: Record<string, TypeScriptRecipe> = Object.fromEntries(
  allRecipes.map((r) => [r.id, r])
)
