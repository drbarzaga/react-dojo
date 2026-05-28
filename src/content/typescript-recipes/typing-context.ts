import type { TypeScriptRecipe } from "./types"

export const typingContext: TypeScriptRecipe = {
  id: "typing-context",
  label: "Tipar Context",
  description:
    "Patrón para tipar createContext correctamente sin necesidad de valores por defecto null, usando un hook personalizado que garantiza que el contexto existe.",
  category: "hooks",
  code: `import { createContext, useContext, useState, ReactNode } from "react"

interface ThemeContextValue {
  theme: "light" | "dark"
  toggle: () => void
}

// Contexto sin valor por defecto — undefined indica "fuera del provider"
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Hook que lanza si se usa fuera del Provider
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider")
  return ctx
}

// Provider con tipo explícito en children
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Consumidor — TypeScript sabe que theme y toggle existen
function Header() {
  const { theme, toggle } = useTheme()
  return (
    <header>
      <span>Tema: {theme}</span>
      <button onClick={toggle}>Cambiar</button>
    </header>
  )
}`,
  do: `// ✓ undefined como valor inicial + guard en el hook
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider")
  return ctx  // tipo: ThemeContextValue (sin undefined)
}`,
  dont: `// ✗ Non-null assertion silencia el error pero no lo resuelve
const ThemeContext = createContext<ThemeContextValue>(null!)

// Si se usa fuera del Provider, falla silenciosamente en runtime
const { theme } = useContext(ThemeContext) // puede ser null`,
  playground: {
    files: {
      "/App.js": `import { createContext, useContext, useState } from "react"

const ThemeContext = createContext(undefined)

function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider")
  return ctx
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark")
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

function ThemeCard() {
  const { theme, toggle } = useTheme()
  const isDark = theme === "dark"
  return (
    <div style={{
      padding: "20px 24px",
      borderRadius: 10,
      border: "1px solid var(--line)",
      background: isDark ? "#0a0a0a" : "#f9f9f9",
      color: isDark ? "#e5e5e5" : "#1a1a1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontFamily: "monospace" }}>
          theme: <strong>"{theme}"</strong>
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 11, opacity: 0.5 }}>
          desde useTheme()
        </p>
      </div>
      <button
        onClick={toggle}
        style={{
          padding: "6px 14px",
          borderRadius: 6,
          border: "1px solid",
          borderColor: isDark ? "#444" : "#ccc",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "monospace",
        }}
      >
        {isDark ? "→ light" : "→ dark"}
      </button>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>Tipar Context</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 16 }}>
        useTheme() lanza un error si se usa fuera de ThemeProvider.
      </p>
      <ThemeProvider>
        <ThemeCard />
      </ThemeProvider>
    </div>
  )
}`,
    },
  },
}
