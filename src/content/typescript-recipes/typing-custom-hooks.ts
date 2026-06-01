import type { TypeScriptRecipe } from "./types"

export const typingCustomHooks: TypeScriptRecipe = {
  id: "typing-custom-hooks",
  label: "Tipar Custom Hooks",
  description:
    "El tipo de retorno de un hook lo define su valor de retorno. Con 'as const' devuelves tuplas bien tipadas y con uniones discriminadas modelas estados de carga sin combinaciones imposibles.",
  category: "hooks",
  code: `// ── 1. Tupla: usa 'as const' para fijar el orden y los tipos ─
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((v) => !v), [])
  return [on, toggle] as const
  // Sin 'as const' TS infiere (boolean | (() => void))[]
  // Con 'as const' infiere [boolean, () => void]
}

const [isOpen, toggleOpen] = useToggle()
//     ^? boolean       ^? () => void

// ── 2. Objeto: mejor cuando devuelves muchos valores ─────────
function useCounter(start = 0) {
  const [count, setCount] = useState(start)
  return {
    count,
    increment: () => setCount((c) => c + 1),
    reset: () => setCount(start),
  }
  // El tipo de retorno se infiere solo; no hace falta anotarlo.
}

// ── 3. Estados async: unión discriminada por 'status' ────────
type FetchState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

function useUser(id: string): FetchState<User> {
  const [state, setState] = useState<FetchState<User>>({ status: "loading" })
  // …efecto que actualiza setState…
  return state
}

const state = useUser("1")
if (state.status === "success") {
  state.data // ✓ TS sabe que 'data' existe aquí
}`,
  do: `// ✓ 'as const' para tuplas → tipos precisos por posición
function useToggle() {
  const [on, setOn] = useState(false)
  return [on, () => setOn((v) => !v)] as const
}
// → [boolean, () => void]`,
  dont: `// ✗ Tupla sin 'as const' → TS la ensancha a un array
function useToggle() {
  const [on, setOn] = useState(false)
  return [on, () => setOn((v) => !v)]
}
// → (boolean | (() => void))[]
// const [on, toggle] = useToggle()
// 'on' y 'toggle' son ambos boolean | (() => void) — inútil`,
  playground: {
    files: {
      "/App.js": `import { useState, useCallback } from "react"

// useToggle devuelve una tupla [valor, toggle].
// En TS el 'as const' garantiza el tipo [boolean, () => void].
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((v) => !v), [])
  return [on, toggle]
}

// useCounter devuelve un objeto: ideal cuando hay varios valores.
function useCounter(start = 0) {
  const [count, setCount] = useState(start)
  return {
    count,
    increment: () => setCount((c) => c + 1),
    reset: () => setCount(start),
  }
}

export default function App() {
  const [isOpen, toggleOpen] = useToggle()
  const { count, increment, reset } = useCounter()

  const btn = {
    padding: "8px 14px",
    borderRadius: 6,
    border: "1px solid var(--line)",
    background: "var(--line)",
    color: "inherit",
    fontSize: 13,
    fontFamily: "monospace",
    cursor: "pointer",
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <strong style={{ fontSize: 13 }}>useToggle() → tupla</strong>
        <button style={btn} onClick={toggleOpen}>
          {isOpen ? "Abierto ▼" : "Cerrado ▶"}
        </button>
        {isOpen && (
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
            Contenido revelado por el toggle.
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <strong style={{ fontSize: 13 }}>useCounter() → objeto</strong>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={{ ...btn, background: "#6366f1", color: "#fff", border: "none" }} onClick={increment}>
            +1
          </button>
          <button style={btn} onClick={reset}>reset</button>
          <span style={{ fontFamily: "monospace", fontSize: 14 }}>count: {count}</span>
        </div>
      </div>
    </div>
  )
}`,
    },
  },
}
