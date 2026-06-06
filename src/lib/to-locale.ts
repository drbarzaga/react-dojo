import { hasLocale } from "next-intl"
import { routing, type Locale } from "@/i18n/routing"

export function toLocale(value: string): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale
}
