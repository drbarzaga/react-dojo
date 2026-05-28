import type { TypeScriptRecipe } from "./types"

export const discriminatedUnions: TypeScriptRecipe = {
  id: "discriminated-unions",
  label: "Uniones Discriminadas",
  description:
    "Props condicionales basadas en un discriminante. Evitan combinaciones inválidas de props que son imposibles de detectar con interfaces normales.",
  category: "patterns",
  code: `// ── Problema con intersección normal ───────────────────
// Nada impide pasar href Y onClick al mismo tiempo
interface BadLinkButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
}

// ── Solución: unión discriminada ────────────────────────
type LinkButtonProps =
  | {
      as: "link"
      href: string           // requerido cuando as="link"
      onClick?: never        // no permitido
      children: React.ReactNode
    }
  | {
      as: "button"
      href?: never           // no permitido
      onClick: () => void    // requerido cuando as="button"
      children: React.ReactNode
    }

export function LinkButton(props: LinkButtonProps) {
  if (props.as === "link") {
    return <a href={props.href}>{props.children}</a>
  }
  return <button onClick={props.onClick}>{props.children}</button>
}

// ✓ Correcto
<LinkButton as="link" href="/about">Acerca de</LinkButton>
<LinkButton as="button" onClick={() => {}}>Confirmar</LinkButton>

// ✗ Error: href no existe en la variante "button"
<LinkButton as="button" href="/about" onClick={() => {}}>X</LinkButton>

// ✗ Error: falta onClick en la variante "button"
<LinkButton as="button">Sin handler</LinkButton>`,
  do: `// ✓ Unión discriminada — combinaciones inválidas son imposibles
type Props =
  | { as: "link"; href: string; onClick?: never }
  | { as: "button"; onClick: () => void; href?: never }

// TypeScript garantiza que href y onClick no coexisten`,
  dont: `// ✗ Props opcionales permiten estados inválidos
interface Props {
  href?: string
  onClick?: () => void  // nada impide pasar los dos
}

// Esto compila sin error aunque no tenga sentido
<LinkButton href="/ruta" onClick={() => {}} />`,
  playground: {
    files: {
      "/App.js": `import { useState } from "react"

function LinkButton(props) {
  const base = {
    padding: "8px 16px",
    borderRadius: 6,
    border: "1px solid var(--line)",
    fontSize: 13,
    fontFamily: "monospace",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
    color: "inherit",
    background: "var(--line)",
  }

  if (props.as === "link") {
    return <a href={props.href} style={base}>{props.children}</a>
  }
  return <button onClick={props.onClick} style={{ ...base, border: "none", background: "#6366f1", color: "#fff" }}>{props.children}</button>
}

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>Uniones Discriminadas</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 8 }}>
        En TypeScript, pasar <code>href</code> a la variante "button" o
        omitir <code>onClick</code> daría error de compilación.
      </p>

      <LinkButton as="link" href="#">
        as="link" → renderiza &lt;a&gt;
      </LinkButton>

      <LinkButton as="button" onClick={() => setCount(c => c + 1)}>
        as="button" → renderiza &lt;button&gt; · clicks: {count}
      </LinkButton>
    </div>
  )
}`,
    },
  },
}
