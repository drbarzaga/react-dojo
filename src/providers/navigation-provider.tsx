"use client"

import { createContext, useContext, useTransition, type ReactNode } from "react"
import { useRouter, useParams } from "next/navigation"

interface NavigationContextValue {
  isPending: boolean
  push: (path: string) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || "en"
  const [isPending, startTransition] = useTransition()

  const push = (path: string) => {
    const normalized = path.startsWith("/") ? path : `/${path}`
    startTransition(() => {
      router.push(`/${locale}${normalized}`)
    })
  }

  return (
    <NavigationContext.Provider value={{ isPending, push }}>{children}</NavigationContext.Provider>
  )
}

export function useNavigationContext() {
  return useContext(NavigationContext)
}
