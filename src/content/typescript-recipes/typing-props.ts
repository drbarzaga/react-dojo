import type { TypeScriptRecipe } from "./types"

export const typingProps: TypeScriptRecipe = {
  id: "typing-props",
  label: "Tipar Props",
  description:
    "Cómo definir la interfaz de props de un componente: props requeridas, opcionales, children y valores por defecto.",
  category: "props",
  code: `import { PropsWithChildren } from "react"

interface ButtonProps {
  label: string                  // requerida
  variant?: "primary" | "ghost"  // opcional con union type
  disabled?: boolean
  onClick?: () => void
}

// PropsWithChildren<T> agrega children?: ReactNode a cualquier interfaz
export function Button({
  label,
  variant = "primary",   // valor por defecto
  disabled = false,
  onClick,
  children,
}: PropsWithChildren<ButtonProps>) {
  return (
    <button disabled={disabled} onClick={onClick}>
      {children ?? label}
    </button>
  )
}

// Si el componente siempre requiere children, usa un wrapper explícito:
// interface CardProps extends PropsWithChildren<{ title: string }> {}

// ✓ Correcto
<Button label="Guardar" />
<Button label="Borrar" variant="ghost" onClick={() => {}} />
<Button label="ignorado">Con children</Button>

// ✗ Error: falta prop requerida
<Button />

// ✗ Error: variante inválida
<Button label="X" variant="danger" />`,
  do: `// PropsWithChildren agrega children?: ReactNode automáticamente
interface ButtonProps {
  label: string
  variant?: "primary" | "ghost"
}

function Button({ label, children }: PropsWithChildren<ButtonProps>) {
  return <button>{children ?? label}</button>
}`,
  dont: `// ✗ Agregar ReactNode manualmente es redundante
import { ReactNode } from "react"

interface ButtonProps {
  label: string
  variant?: "primary" | "ghost"
  children?: ReactNode  // PropsWithChildren ya lo hace por ti
}`,
  playground: {
    files: {
      "/App.js": `export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ marginBottom: 4 }}>Tipar Props</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 8 }}>
        Prueba cambiar las props del botón. En TypeScript, las props requeridas
        darían error si se omiten y las opcionales tienen valores por defecto.
      </p>
      <Button label="Acción primaria" variant="primary" onClick={() => alert("click")} />
      <Button label="Acción ghost" variant="ghost" onClick={() => alert("ghost")} />
      <Button label="Deshabilitado" disabled />
      <Button label="ignorado" variant="primary">Con children</Button>
    </div>
  )
}

function Button({ label, variant = "primary", disabled = false, onClick, children }) {
  const styles = {
    primary: { background: "#6366f1", color: "#fff", border: "none" },
    ghost: { background: "transparent", color: "var(--fg-muted)", border: "1px solid var(--line)" },
  }
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        ...styles[variant],
        padding: "8px 16px",
        borderRadius: 6,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        fontFamily: "monospace",
      }}
    >
      {children ?? label}
    </button>
  )
}`,
    },
  },
}
