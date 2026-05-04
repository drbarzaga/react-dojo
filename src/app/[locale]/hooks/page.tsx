import { HooksListingPage } from "@/components/hooks-listing-page"
import { getCustomHooksForLocale } from "@/content/custom-hooks/loader"
import { routing, type Locale } from "@/i18n/routing"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: "Custom Hooks",
}

export default async function HooksPage({ params }: Props) {
  const { locale } = await params
  const { allCustomHooks } = await getCustomHooksForLocale(locale as Locale)
  return <HooksListingPage hooks={allCustomHooks} />
}
