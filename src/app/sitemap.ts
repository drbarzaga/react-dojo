import type { MetadataRoute } from "next"
import { getContentForLocale } from "@/content/loader"
import { getCustomHooksForLocale } from "@/content/custom-hooks/loader"
import { BASE_URL } from "@/lib/constants"
const LOCALES = ["en", "es"] as const

type SitemapEntry = MetadataRoute.Sitemap[number]

function makeEntries(
  path: string,
  priority: number,
  changeFrequency: SitemapEntry["changeFrequency"]
): SitemapEntry[] {
  const langs: Record<string, string> = {}
  for (const locale of LOCALES) langs[locale] = `${BASE_URL}/${locale}${path}`
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    changeFrequency,
    priority,
    alternates: { languages: langs },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [enContent, enHooks] = await Promise.all([
    getContentForLocale("en"),
    getCustomHooksForLocale("en"),
  ])

  return [
    ...makeEntries("", 1.0, "weekly"),
    ...makeEntries("/hooks", 0.8, "weekly"),
    ...enContent.allConcepts.flatMap((c) => makeEntries(`/${c.id}`, 0.9, "monthly")),
    ...enContent.allExercises.flatMap((e) => makeEntries(`/learn/${e.id}`, 0.8, "monthly")),
    ...enContent.allQuizzes.flatMap((q) => makeEntries(`/quiz/${q.id}`, 0.7, "monthly")),
    ...enHooks.allCustomHooks.flatMap((h) => makeEntries(`/hooks/${h.id}`, 0.7, "monthly")),
  ]
}
