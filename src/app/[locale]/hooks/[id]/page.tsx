import { notFound } from "next/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { allCustomHooks as allHooksEs } from "@/content/custom-hooks"
import { getCustomHooksForLocale } from "@/content/custom-hooks/loader"
import { HookDetailPage } from "@/components/hook-detail-page"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) => allHooksEs.map((h) => ({ locale, id: h.id })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: id }
}

export default async function HookDetailRoute({ params }: Props) {
  const { locale, id } = await params
  const { allCustomHooks, customHookIndex } = await getCustomHooksForLocale(locale as Locale)
  const hook = customHookIndex[id]
  if (!hook) notFound()

  const idx = allCustomHooks.findIndex((h) => h.id === id)
  const prev = idx > 0 ? allCustomHooks[idx - 1] : undefined
  const next = idx < allCustomHooks.length - 1 ? allCustomHooks[idx + 1] : undefined

  return <HookDetailPage hook={hook} prev={prev} next={next} />
}
