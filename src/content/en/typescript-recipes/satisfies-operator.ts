import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const satisfiesOperator: TypeScriptRecipe = {
  id: "satisfies-operator",
  label: "The satisfies operator",
  description:
    "Validate an object against a type without losing its most specific type. satisfies gives you the checking of a ': Type' annotation while keeping literal keys and values for autocomplete and inference.",
  category: "patterns",
  code: `type RGB = [number, number, number]
type Color = RGB | string

// ── The problem: annotating with ':' widens the type ───
const palette: Record<string, Color> = {
  primary: [99, 102, 241],
  text: "#1a1a1a",
}
// palette.primary is now Color, TS forgot it was a tuple:
palette.primary.map((c) => c) // ✗ Error: 'string' has no .map

// ── The fix: satisfies validates WITHOUT widening ──────
const theme = {
  primary: [99, 102, 241],
  text: "#1a1a1a",
} satisfies Record<string, Color>

theme.primary.map((c) => c * 2) // ✓ TS knows it's number[]
theme.text.toUpperCase()        // ✓ TS knows it's string
// theme.unknown                // ✗ validation is still active

// ── Bonus: literal keys are preserved ──────────────────
const routes = {
  home: "/",
  profile: "/profile",
} satisfies Record<string, string>

type RouteName = keyof typeof routes // "home" | "profile" (not string)`,
  do: `// ✓ satisfies: validates AND keeps the most specific type
const config = {
  retries: 3,
  mode: "dark",
} satisfies AppConfig

config.mode // "dark" (literal), not string
// Checked against AppConfig and you still get exact autocomplete.`,
  dont: `// ✗ ': Type' validates but widens to the declared type
const config: AppConfig = {
  retries: 3,
  mode: "dark",
}
config.mode // string — you lost the literal "dark"
// Goodbye to the concrete keys and fine-grained inference.`,
  playground: {
    files: {
      "/App.js": `// In TypeScript this object would carry \`satisfies Record<Status, Style>\`:
// validated against the type, yet keeping the exact keys and styles.
const statusStyles = {
  success: { label: "Success", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  warning: { label: "Warning", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
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
  // Object.keys(statusStyles) → in TS this would be keyof typeof statusStyles
  const statuses = Object.keys(statusStyles)
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 12, maxWidth: 340 }}>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
        The keys and styles come from an object validated with <code>satisfies</code>, without losing their literal types.
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
