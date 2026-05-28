import type { TypeScriptRecipe } from "./types"

export const forwardRef: TypeScriptRecipe = {
  id: "forward-ref",
  label: "Tipar forwardRef",
  description:
    "forwardRef permite que un componente exponga su nodo DOM al componente padre. El tipo del elemento y las props van como parámetros genéricos.",
  category: "patterns",
  code: `import { forwardRef, useRef, useEffect } from "react"

interface ButtonProps {
  label: string
  variant?: "primary" | "ghost"
  onClick?: () => void
}

// forwardRef<TipoRef, TipoProps>
// Primer parámetro: elemento DOM al que apunta la ref
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label, variant = "primary", onClick }, ref) => {
    return (
      <button ref={ref} onClick={onClick} data-variant={variant}>
        {label}
      </button>
    )
  }
)

// displayName mejora el debugging en React DevTools
Button.displayName = "Button"

// ── Uso desde el padre ───────────────────────────────────
function Form() {
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // El padre puede acceder al nodo DOM del componente hijo
    btnRef.current?.focus()
  }, [])

  return <Button ref={btnRef} label="Enviar" />
}

// ── Tipos de elementos DOM más comunes ───────────────────
// forwardRef<HTMLInputElement, InputProps>
// forwardRef<HTMLDivElement,   DivProps>
// forwardRef<HTMLFormElement,  FormProps>`,
  do: `// ✓ Tipo específico — acceso a métodos del elemento exacto
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder }, ref) => (
    <input ref={ref} placeholder={placeholder} />
  )
)

// ref.current es HTMLInputElement → .focus(), .select(), .value...
inputRef.current?.select()`,
  dont: `// ✗ HTMLElement es demasiado amplio — pierdes los métodos específicos
const Input = forwardRef<HTMLElement, InputProps>(
  ({ placeholder }, ref) => (
    <input ref={ref} placeholder={placeholder} />
  )
)

// ✗ Sin forwardRef, la ref no llega al elemento DOM del hijo
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />  // ref se ignora sin forwardRef
}`,
  playground: {
    files: {
      "/App.js": `import { forwardRef, useRef, useState } from "react"

const FancyInput = forwardRef(({ placeholder, label }, ref) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, color: "var(--fg-muted)", fontFamily: "monospace" }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        placeholder={placeholder}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid var(--line)",
          background: "transparent",
          color: "inherit",
          fontSize: 13,
          fontFamily: "monospace",
          outline: "none",
          width: "100%",
        }}
      />
    </div>
  )
})

FancyInput.displayName = "FancyInput"

export default function App() {
  const inputRef = useRef(null)
  const [log, setLog] = useState("")

  function handleFocus() {
    inputRef.current?.focus()
    setLog("focus() llamado desde el padre")
  }

  function handleSelect() {
    inputRef.current?.select()
    setLog("select() llamado desde el padre")
  }

  function handleClear() {
    if (inputRef.current) {
      inputRef.current.value = ""
      inputRef.current.focus()
      setLog("value limpiado desde el padre")
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 16, maxWidth: 380 }}>
      <h2 style={{ marginBottom: 0 }}>forwardRef</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
        El componente padre controla el input hijo a través de la ref.
      </p>

      <FancyInput
        ref={inputRef}
        label="forwardRef<HTMLInputElement, Props>"
        placeholder="Escribe algo..."
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Focus", fn: handleFocus },
          { label: "Select all", fn: handleSelect },
          { label: "Clear", fn: handleClear },
        ].map(({ label, fn }) => (
          <button
            key={label}
            onClick={fn}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              background: "#6366f1",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "monospace",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {log && (
        <p style={{ fontSize: 11, fontFamily: "monospace", color: "var(--fg-muted)", margin: 0 }}>
          → {log}
        </p>
      )}
    </div>
  )
}`,
    },
  },
}
