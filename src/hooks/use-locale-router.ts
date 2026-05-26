"use client"

import { useRouter } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { useNavigationContext } from "@/providers/navigation-provider"

export function useLocaleRouter() {
  const router = useRouter()
  const locale = useLocale()
  const navCtx = useNavigationContext()

  return {
    locale,
    isPending: navCtx?.isPending ?? false,
    push(path: string) {
      if (navCtx) {
        navCtx.push(path)
      } else {
        router.push(path)
      }
    },
    href(path: string) {
      const normalized = path.startsWith("/") ? path : `/${path}`
      return `/${locale}${normalized}`
    },
  }
}
