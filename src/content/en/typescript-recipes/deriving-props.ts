import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const derivingProps: TypeScriptRecipe = {
  id: "deriving-props",
  label: "Deriving Props",
  description:
    "Reuse types instead of redeclaring them. With React.ComponentProps, Pick, Omit and PropsWithChildren your props stay in sync with their source of truth.",
  category: "props",
  code: `// ── 1. Reuse the props of an existing component ────────
function Button(props: {
  variant: "primary" | "ghost"
  onClick: () => void
  children: React.ReactNode
}) {
  return <button>{props.children}</button>
}

// Instead of redefining the props, derive them from the component:
type ButtonProps = React.ComponentProps<typeof Button>
// { variant: "primary" | "ghost"; onClick: () => void; children: React.ReactNode }

// ── 2. Props of a native HTML element ──────────────────
type InputProps = React.ComponentProps<"input">
// every valid <input> prop: value, onChange, placeholder, disabled…

// ── 3. Adapt with Omit / Pick ──────────────────────────
// IconButton IS a Button, but without 'variant' (always ghost) and with 'icon'
type IconButtonProps = Omit<ButtonProps, "variant"> & { icon: string }

function IconButton({ icon, ...rest }: IconButtonProps) {
  return <Button variant="ghost" {...rest}>{icon}</Button>
}

// ── 4. PropsWithChildren for container components ──────
type CardProps = React.PropsWithChildren<{ title: string }>
// { title: string; children?: React.ReactNode }`,
  do: `// ✓ Derive props from the source of truth
type Props = React.ComponentProps<typeof Input>

// If Input adds or changes props, Props updates automatically.
// Zero duplication, zero drift.`,
  dont: `// ✗ Re-declaring props by hand
interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  // what about placeholder? disabled? type?
  // it's always incomplete and drifts out of sync
}`,
  playground: {
    files: {
      "/App.js": `function Button({ variant, onClick, children }) {
  const styles = {
    primary: { background: "#6366f1", color: "#fff", border: "none" },
    ghost: { background: "var(--line)", color: "inherit", border: "1px solid var(--line)" },
  }
  return (
    <button
      onClick={onClick}
      style={{ ...styles[variant], padding: "8px 14px", borderRadius: 6, fontSize: 13, fontFamily: "monospace", cursor: "pointer" }}
    >
      {children}
    </button>
  )
}

// IconButton derives from Button (Omit<"variant"> + icon): it reuses its behavior.
function IconButton({ icon, ...rest }) {
  return <Button variant="ghost" {...rest}>{icon}</Button>
}

// Card uses PropsWithChildren: title + children.
function Card({ title, children }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <strong style={{ fontSize: 13 }}>{title}</strong>
      {children}
    </div>
  )
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 360 }}>
      <Card title="Derived props">
        <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
          IconButton reuses Button's type and behavior without redeclaring anything.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" onClick={() => alert("primary")}>Primary</Button>
          <IconButton onClick={() => alert("icon")} icon="★" />
        </div>
      </Card>
    </div>
  )
}`,
    },
  },
}
