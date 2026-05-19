import type { ReactNode } from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { routing, type Locale } from "@/i18n/routing"
import { AppProviders } from "@/providers/app-provider"
import { AppShell } from "@/components/app-shell"
import { ContentProvider } from "@/providers/content-provider"
import { getContentForLocale } from "@/content/loader"
import { BASE_URL, SIDEBAR_OPEN_STATE_KEY } from "@/lib/constants"
import { parseSidebarOpenState } from "@/lib/sidebar-state"

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Metadata" })
  const description = t("description")
  return {
    title: { default: t("titleDefault"), template: t("titleTemplate") },
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      languages: {
        en: `${BASE_URL}/en`,
        es: `${BASE_URL}/es`,
        "x-default": `${BASE_URL}/en`,
      },
    },
    openGraph: {
      title: "React Dojo",
      description,
      url: `${BASE_URL}/${locale}`,
      type: "website",
      siteName: "React Dojo",
    },
    twitter: {
      card: "summary_large_image",
      title: "React Dojo",
      description,
    },
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params
  const locale: Locale = (routing.locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : routing.defaultLocale
  const [messages, content, cookieStore] = await Promise.all([
    getMessages({ locale }),
    getContentForLocale(locale),
    cookies(),
  ])
  const initialSidebarState = parseSidebarOpenState(cookieStore.get(SIDEBAR_OPEN_STATE_KEY)?.value)
  const initialTheme = cookieStore.get("theme")?.value === "light" ? "light" : "dark"

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ContentProvider {...content}>
        <AppProviders initialTheme={initialTheme}>
          <AppShell initialSidebarState={initialSidebarState}>{children}</AppShell>
        </AppProviders>
      </ContentProvider>
    </NextIntlClientProvider>
  )
}
