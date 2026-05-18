"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type Theme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

const Ctx = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  initialTheme = "dark",
}: {
  children: ReactNode
  initialTheme?: Theme
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle("dark", theme === "dark")
    try {
      localStorage.setItem("theme", theme)
      document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), [])

  return <Ctx.Provider value={{ theme, set: setTheme, toggle }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useTheme requiere <ThemeProvider>")
  return ctx
}
