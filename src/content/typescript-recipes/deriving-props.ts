import type { TypeScriptRecipe } from "./types"

export const derivingProps: TypeScriptRecipe = {
  id: "deriving-props",
  label: "Derivar Props",
  description:
    "Reutiliza tipos en vez de redeclararlos. Con React.ComponentProps, Pick, Omit y PropsWithChildren tus props quedan siempre sincronizadas con su fuente de verdad.",
  category: "props",
  code: `// ── 1. Reusar las props de un componente existente ─────
function Button(props: {
  variant: "primary" | "ghost"
  onClick: () => void
  children: React.ReactNode
}) {
  return <button>{props.children}</button>
}

// En vez de redefinir las props, las derivas del componente:
type ButtonProps = React.ComponentProps<typeof Button>
// { variant: "primary" | "ghost"; onClick: () => void; children: React.ReactNode }

// ── 2. Props de un elemento HTML nativo ────────────────
type InputProps = React.ComponentProps<"input">
// todas las props válidas de <input>: value, onChange, placeholder, disabled…

// ── 3. Adaptar con Omit / Pick ─────────────────────────
// IconButton ES un Button, pero sin 'variant' (siempre ghost) y con 'icon'
type IconButtonProps = Omit<ButtonProps, "variant"> & { icon: string }

function IconButton({ icon, ...rest }: IconButtonProps) {
  return <Button variant="ghost" {...rest}>{icon}</Button>
}

// ── 4. PropsWithChildren para componentes contenedores ─
type CardProps = React.PropsWithChildren<{ title: string }>
// { title: string; children?: React.ReactNode }`,
  do: `// ✓ Deriva las props desde la fuente de verdad
type Props = React.ComponentProps<typeof Input>

// Si Input añade o cambia props, Props se actualiza solo.
// Cero duplicación, cero desincronización.`,
  dont: `// ✗ Re-declarar las props a mano
interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  // ¿y placeholder? ¿disabled? ¿type?
  // siempre queda incompleto y se desincroniza
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

// IconButton deriva de Button (Omit<"variant"> + icon): reusa su comportamiento.
function IconButton({ icon, ...rest }) {
  return <Button variant="ghost" {...rest}>{icon}</Button>
}

// Card usa PropsWithChildren: title + children.
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
      <Card title="Props derivadas">
        <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
          IconButton reutiliza el tipo y el comportamiento de Button sin redeclarar nada.
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
