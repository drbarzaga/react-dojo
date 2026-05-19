import { notFound } from "next/navigation"
import { ConceptPage } from "@/components/concept-page"
import { getContentForLocale } from "@/content/loader"
import { routing, type Locale } from "@/i18n/routing"
import { buildPageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ locale: string; concept: string }>
}

export async function generateStaticParams() {
  const results = await Promise.all(
    routing.locales.map(async (locale) => {
      const { allConcepts } = await getContentForLocale(locale)
      return allConcepts.map((c) => ({ locale, concept: c.id }))
    })
  )
  return results.flat()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, concept: id } = await params
  const { conceptIndex } = await getContentForLocale(locale as Locale)
  const concept = conceptIndex[id]
  if (!concept) return {}
  return buildPageMetadata({
    title: concept.label,
    description: concept.lede,
    path: `/${id}`,
    locale,
  })
}

export default async function ConceptRoute({ params }: Props) {
  const { locale, concept: id } = await params
  const { conceptIndex, allConcepts } = await getContentForLocale(locale as Locale)
  const concept = conceptIndex[id]
  if (!concept) notFound()

  const idx = allConcepts.findIndex((c) => c.id === id)
  const prev = idx > 0 ? allConcepts[idx - 1] : undefined
  const next = idx < allConcepts.length - 1 ? allConcepts[idx + 1] : undefined

  return <ConceptPage concept={concept} prev={prev} next={next} />
}
