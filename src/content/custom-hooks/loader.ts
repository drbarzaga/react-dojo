import type { Locale } from "@/i18n/routing"
import type { CustomHook } from "./types"

interface HooksBundle {
  allCustomHooks: CustomHook[]
  customHookIndex: Record<string, CustomHook>
}

export async function getCustomHooksForLocale(locale: Locale): Promise<HooksBundle> {
  if (locale === "es") {
    return import("@/content/custom-hooks")
  }
  return import("@/content/en/custom-hooks")
}
