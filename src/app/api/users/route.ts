import { getContentForLocale } from "@/content/loader"
import { routing } from "@/i18n/routing"
import { getDevelopers } from "@/lib/get-developers"

export async function GET() {
  // Achievement/score inputs (exercise difficulty, category ids, totals) are
  // locale-agnostic, so the default locale's catalog is sufficient here.
  const { allConcepts, allExercises, allQuizzes, categories } = await getContentForLocale(
    routing.defaultLocale
  )
  const developers = await getDevelopers({
    totals: {
      concepts: allConcepts.length,
      exercises: allExercises.length,
      quizzes: allQuizzes.length,
    },
    exercises: allExercises,
    categories,
  })
  return Response.json(developers)
}
