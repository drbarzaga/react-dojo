import { HooksListingPage } from "@/components/hooks-listing-page"
import { getCustomHooksForLocale } from "@/content/custom-hooks/loader"
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
  const t = await getTranslations({ locale, namespace: "CustomHooks" })
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/hooks",
    locale,
    type: "website",
  })
}

export default async function HooksPage({ params }: Props) {
  const { locale } = await params
  const { allCustomHooks } = await getCustomHooksForLocale(locale as Locale)
  return <HooksListingPage hooks={allCustomHooks} />
}
