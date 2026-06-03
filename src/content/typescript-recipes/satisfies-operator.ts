import type { TypeScriptRecipe } from "./types"

export const satisfiesOperator: TypeScriptRecipe = {
  id: "satisfies-operator",
  label: "El operador satisfies",
  description:
    "Valida un objeto contra un tipo sin perder su tipo más específico. satisfies te da el chequeo de una anotación ': Tipo' pero conservando claves y valores literales para autocompletado e inferencia.",
  category: "patterns",
  code: `type RGB = [number, number, number]
type Color = RGB | string

// ── El problema: anotar con ':' ensancha el tipo ───────
const palette: Record<string, Color> = {
  primary: [99, 102, 241],
  text: "#1a1a1a",
}
// palette.primary ahora es Color, TS olvidó que era una tupla:
palette.primary.map((c) => c) // ✗ Error: 'string' no tiene .map

// ── La solución: satisfies valida SIN ensanchar ────────
const theme = {
  primary: [99, 102, 241],
  text: "#1a1a1a",
} satisfies Record<string, Color>

theme.primary.map((c) => c * 2) // ✓ TS sabe que es number[]
theme.text.toUpperCase()        // ✓ TS sabe que es string
// theme.unknown                // ✗ la validación sigue activa

// ── Bonus: las claves literales se preservan ───────────
const routes = {
  home: "/",
  profile: "/profile",
} satisfies Record<string, string>

type RouteName = keyof typeof routes // "home" | "profile" (no string)`,
  do: `// ✓ satisfies: valida Y conserva el tipo más específico
const config = {
  retries: 3,
  mode: "dark",
} satisfies AppConfig

config.mode // "dark" (literal), no string
// Te validan contra AppConfig y aún tienes autocompletado exacto.`,
  dont: `// ✗ ': Tipo' valida pero ensancha al tipo declarado
const config: AppConfig = {
  retries: 3,
  mode: "dark",
}
config.mode // string — perdiste el literal "dark"
// Adiós a las claves concretas y a la inferencia fina.`,
  playground: {
    files: {
      "/App.js": `// En TypeScript este objeto llevaría \`satisfies Record<Status, Style>\`:
// validado contra el tipo, pero conservando las claves y estilos exactos.
const statusStyles = {
  success: { label: "Éxito", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  warning: { label: "Aviso", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  error: { label: "Error", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
}

function Badge({ status }) {
  const s = statusStyles[status]
  return (
    <span style={{ color: s.color, background: s.bg, padding: "4px 12px", borderRadius: 999, fontSize: 13, fontFamily: "monospace" }}>
      {s.label}
    </span>
  )
}

export default function App() {
  // Object.keys(statusStyles) → en TS sería keyof typeof statusStyles
  const statuses = Object.keys(statusStyles)
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 12, maxWidth: 340 }}>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
        Las claves y los estilos vienen de un objeto validado con <code>satisfies</code>, sin perder sus tipos literales.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        {statuses.map((st) => (
          <Badge key={st} status={st} />
        ))}
      </div>
    </div>
  )
}`,
    },
  },
}
