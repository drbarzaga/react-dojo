import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const forwardRef: TypeScriptRecipe = {
  id: "forward-ref",
  label: "Typing forwardRef",
  description:
    "forwardRef lets a component expose its DOM node to its parent. The ref element type and the props type go as generic parameters.",
  category: "patterns",
  code: `import { forwardRef, useRef, useEffect } from "react"

interface ButtonProps {
  label: string
  variant?: "primary" | "ghost"
  onClick?: () => void
}

// forwardRef<RefType, PropsType>
// First parameter: the DOM element the ref points to
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label, variant = "primary", onClick }, ref) => {
    return (
      <button ref={ref} onClick={onClick} data-variant={variant}>
        {label}
      </button>
    )
  }
)

// displayName improves debugging in React DevTools
Button.displayName = "Button"

// ── Usage from the parent ────────────────────────────────
function Form() {
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // The parent can access the child's DOM node
    btnRef.current?.focus()
  }, [])

  return <Button ref={btnRef} label="Submit" />
}

// ── Most common DOM element types ───────────────────────
// forwardRef<HTMLInputElement, InputProps>
// forwardRef<HTMLDivElement,   DivProps>
// forwardRef<HTMLFormElement,  FormProps>`,
  do: `// ✓ Specific type — access to the element's exact methods
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder }, ref) => (
    <input ref={ref} placeholder={placeholder} />
  )
)

// ref.current is HTMLInputElement → .focus(), .select(), .value...
inputRef.current?.select()`,
  dont: `// ✗ HTMLElement is too broad — you lose element-specific methods
const Input = forwardRef<HTMLElement, InputProps>(
  ({ placeholder }, ref) => (
    <input ref={ref} placeholder={placeholder} />
  )
)

// ✗ Without forwardRef, the ref never reaches the child's DOM node
function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />  // ref is ignored without forwardRef
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
    setLog("focus() called from parent")
  }

  function handleSelect() {
    inputRef.current?.select()
    setLog("select() called from parent")
  }

  function handleClear() {
    if (inputRef.current) {
      inputRef.current.value = ""
      inputRef.current.focus()
      setLog("value cleared from parent")
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 16, maxWidth: 380 }}>
      <h2 style={{ marginBottom: 0 }}>forwardRef</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
        The parent controls the child input through the ref.
      </p>

      <FancyInput
        ref={inputRef}
        label="forwardRef<HTMLInputElement, Props>"
        placeholder="Type something..."
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
