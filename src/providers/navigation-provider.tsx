"use client"

import { createContext, useContext, useTransition, type ReactNode } from "react"
import { useRouter } from "@/i18n/navigation"

interface NavigationContextValue {
  isPending: boolean
  push: (path: string) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const push = (path: string) => {
    startTransition(() => {
      router.push(path)
    })
  }

  return (
    <NavigationContext.Provider value={{ isPending, push }}>{children}</NavigationContext.Provider>
  )
}

export function useNavigationContext() {
  return useContext(NavigationContext)
}
