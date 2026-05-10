"use client"

import { useParams, useRouter } from "next/navigation"
import { useNavigationContext } from "@/providers/navigation-provider"

export function useLocaleRouter() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || "en"
  const navCtx = useNavigationContext()

  return {
    locale,
    isPending: navCtx?.isPending ?? false,
    push(path: string) {
      if (navCtx) {
        navCtx.push(path)
      } else {
        const normalized = path.startsWith("/") ? path : `/${path}`
        router.push(`/${locale}${normalized}`)
      }
    },
    href(path: string) {
      const normalized = path.startsWith("/") ? path : `/${path}`
      return `/${locale}${normalized}`
    },
  }
}
