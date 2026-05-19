import type { Metadata } from "next"
import { BASE_URL } from "@/lib/constants"

interface PageMetadataOptions {
  title: string
  description: string
  /** Locale-agnostic path, e.g. "/hooks/use-click-outside" or "/useState" */
  path: string
  locale: string
  type?: "article" | "website"
}

export function buildPageMetadata({
  title,
  description,
  path,
  locale,
  type = "article",
}: PageMetadataOptions): Metadata {
  const url = `${BASE_URL}/${locale}${path}`
  const ogTitle = `${title} — React Dojo`
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/en${path}`,
        es: `${BASE_URL}/es${path}`,
        "x-default": `${BASE_URL}/en${path}`,
      },
    },
    openGraph: {
      title: ogTitle,
      description,
      url,
      type,
      siteName: "React Dojo",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  }
}
