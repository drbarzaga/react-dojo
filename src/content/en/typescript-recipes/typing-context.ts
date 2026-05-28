import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const typingContext: TypeScriptRecipe = {
  id: "typing-context",
  label: "Typing Context",
  description:
    "Pattern for correctly typing createContext without null default values, using a custom hook that guarantees the context exists.",
  category: "hooks",
  code: `import { createContext, useContext, useState, ReactNode } from "react"

interface ThemeContextValue {
  theme: "light" | "dark"
  toggle: () => void
}

// Context with no default value — undefined means "outside the provider"
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Hook that throws if used outside the Provider
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}

// Provider with explicit type for children
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Consumer — TypeScript knows theme and toggle exist
function Header() {
  const { theme, toggle } = useTheme()
  return (
    <header>
      <span>Theme: {theme}</span>
      <button onClick={toggle}>Toggle</button>
    </header>
  )
}`,
  do: `// ✓ undefined as initial value + guard in the hook
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx  // type: ThemeContextValue (no undefined)
}`,
  dont: `// ✗ Non-null assertion silences the error but doesn't fix it
const ThemeContext = createContext<ThemeContextValue>(null!)

// If used outside the Provider, fails silently at runtime
const { theme } = useContext(ThemeContext) // may be null`,
  playground: { files: {} },
}
