import type { TypeScriptRecipe } from "./types"

export const extendHtmlProps: TypeScriptRecipe = {
  id: "extend-html-props",
  label: "Extender Props HTML",
  description:
    "Cómo crear componentes que aceptan todas las props del elemento HTML subyacente además de las tuyas, usando ComponentProps y el spread operator.",
  category: "props",
  code: `import { ComponentProps, forwardRef } from "react"

// ── Extender props de un elemento ───────────────────────
// ComponentProps<"button"> incluye onClick, disabled, type, etc.
interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "ghost" | "danger"
  loading?: boolean
}

// Las props propias se desestructuran; el resto va al elemento
export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className,
  ...rest               // todas las props nativas del <button>
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={\`btn btn-\${variant} \${className ?? ""}\`}
      {...rest}          // onClick, type, form, aria-*, data-*, etc.
    >
      {loading ? "…" : children}
    </button>
  )
}

// ── Con forwardRef para refs ────────────────────────────
export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={\`input \${className ?? ""}\`}
      {...rest}
    />
  )
)
Input.displayName = "Input"

// ✓ Acepta cualquier prop nativa de <button>
<Button variant="primary" type="submit" form="my-form" aria-label="Guardar">
  Guardar
</Button>`,
  do: `// ✓ ComponentProps + spread acepta todo automáticamente
interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "ghost"
}

function Button({ variant, ...rest }: ButtonProps) {
  return <button {...rest} />  // onClick, type, aria-*, etc.
}`,
  dont: `// ✗ Listar manualmente cada prop nativa es frágil e incompleto
interface ButtonProps {
  variant?: "primary" | "ghost"
  onClick?: () => void       // ¿y onMouseEnter? ¿aria-label?
  disabled?: boolean         // ¿y form? ¿type? ¿data-*?
  children?: React.ReactNode
}`,
  playground: {
    files: {
      "/App.js": `import { useState } from "react"

function Button({ variant = "primary", loading = false, disabled, children, style, ...rest }) {
  const variants = {
    primary: { background: "#6366f1", color: "#fff", borderColor: "#6366f1" },
    ghost:   { background: "transparent", color: "var(--fg-muted)", borderColor: "var(--line)" },
    danger:  { background: "#ef4444", color: "#fff", borderColor: "#ef4444" },
  }
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...variants[variant],
        padding: "8px 16px",
        borderRadius: 6,
        border: "1px solid",
        fontSize: 13,
        fontFamily: "monospace",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}
      {...rest}
    >
      {loading ? "…" : children}
    </button>
  )
}

export default function App() {
  const [loading, setLoading] = useState(false)

  function handleSave() {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>Extender Props HTML</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 4 }}>
        El componente acepta todas las props nativas de &lt;button&gt; además de las propias.
      </p>
      <Button variant="primary" onClick={handleSave} loading={loading}>
        {loading ? "Guardando" : "Guardar (simula loading)"}
      </Button>
      <Button variant="ghost" onClick={() => alert("ghost click")}>
        Ghost button
      </Button>
      <Button variant="danger" disabled>
        Peligroso (deshabilitado)
      </Button>
      <Button variant="primary" type="submit" form="demo-form">
        Submit de otro form
      </Button>
      <form id="demo-form" onSubmit={(e) => { e.preventDefault(); alert("form submitted!") }} style={{ display: "none" }} />
    </div>
  )
}`,
    },
  },
}
