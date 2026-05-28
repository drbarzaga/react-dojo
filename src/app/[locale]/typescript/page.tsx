import { TypeScriptListingPage } from "@/components/typescript-listing-page"
import { getRecipesForLocale } from "@/content/typescript-recipes/loader"
import { routing, type Locale } from "@/i18n/routing"
import { buildPageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "TypeScript" })
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/typescript",
    locale,
    type: "website",
  })
}

export default async function TypeScriptPage({ params }: Props) {
  const { locale } = await params
  const { allRecipes } = await getRecipesForLocale(locale as Locale)
  return <TypeScriptListingPage recipes={allRecipes} />
}
