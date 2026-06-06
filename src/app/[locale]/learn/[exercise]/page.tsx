import { notFound } from "next/navigation"
import { ExercisePage } from "@/components/exercise-page"
import { getContentForLocale } from "@/content/loader"
import { routing } from "@/i18n/routing"
import { toLocale } from "@/lib/to-locale"
import { buildPageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ locale: string; exercise: string }>
}

export async function generateStaticParams() {
  const results = await Promise.all(
    routing.locales.map(async (locale) => {
      const { allExercises } = await getContentForLocale(locale)
      return allExercises.map((e) => ({ locale, exercise: e.id }))
    })
  )
  return results.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, exercise: id } = await params
  const { exerciseIndex } = await getContentForLocale(toLocale(locale))
  const exercise = exerciseIndex[id]
  if (!exercise) return {}
  return buildPageMetadata({
    title: exercise.label,
    description: exercise.lede,
    path: `/learn/${id}`,
    locale,
  })
}

export default async function ExerciseRoute({ params }: Props) {
  const { locale, exercise: id } = await params
  const { exerciseIndex, allExercises } = await getContentForLocale(toLocale(locale))
  const exercise = exerciseIndex[id]
  if (!exercise) notFound()

  const idx = allExercises.findIndex((e) => e.id === id)
  const prev = idx > 0 ? allExercises[idx - 1] : undefined
  const next = idx < allExercises.length - 1 ? allExercises[idx + 1] : undefined

  return <ExercisePage exercise={exercise} prev={prev} next={next} />
}
