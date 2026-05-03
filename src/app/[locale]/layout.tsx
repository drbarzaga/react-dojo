import type { ReactNode } from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { routing, type Locale } from "@/i18n/routing"
import { AppProviders } from "@/providers/app-provider"
import { AppShell } from "@/components/app-shell"
import { ContentProvider } from "@/providers/content-provider"
import { getContentForLocale } from "@/content/loader"

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
  return {
    title: { default: t("titleDefault"), template: t("titleTemplate") },
    description: t("description"),
    metadataBase: new URL("https://react-dojo.vercel.app"),
    openGraph: {
      title: "React Dojo",
      description: t("description"),
      url: "https://react-dojo.vercel.app",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "React Dojo",
      description: t("description"),
    },
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  const [messages, content] = await Promise.all([
    getMessages(),
    getContentForLocale(locale as Locale),
  ])

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ContentProvider {...content}>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </ContentProvider>
    </NextIntlClientProvider>
  )
}
