import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const typingCustomHooks: TypeScriptRecipe = {
  id: "typing-custom-hooks",
  label: "Typing Custom Hooks",
  description:
    "A hook's return type is defined by what it returns. Use 'as const' to return well-typed tuples, and discriminated unions to model loading states with no impossible combinations.",
  category: "hooks",
  code: `// ── 1. Tuple: use 'as const' to lock the order and types ─────
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((v) => !v), [])
  return [on, toggle] as const
  // Without 'as const' TS infers (boolean | (() => void))[]
  // With 'as const' it infers [boolean, () => void]
}

const [isOpen, toggleOpen] = useToggle()
//     ^? boolean       ^? () => void

// ── 2. Object: better when you return many values ────────────
function useCounter(start = 0) {
  const [count, setCount] = useState(start)
  return {
    count,
    increment: () => setCount((c) => c + 1),
    reset: () => setCount(start),
  }
  // The return type is inferred for you; no need to annotate it.
}

// ── 3. Async state: discriminated union on 'status' ──────────
type FetchState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error }

function useUser(id: string): FetchState<User> {
  const [state, setState] = useState<FetchState<User>>({ status: "loading" })
  // …effect that updates setState…
  return state
}

const state = useUser("1")
if (state.status === "success") {
  state.data // ✓ TS knows 'data' exists here
}`,
  do: `// ✓ 'as const' for tuples → precise type per position
function useToggle() {
  const [on, setOn] = useState(false)
  return [on, () => setOn((v) => !v)] as const
}
// → [boolean, () => void]`,
  dont: `// ✗ Tuple without 'as const' → TS widens it to an array
function useToggle() {
  const [on, setOn] = useState(false)
  return [on, () => setOn((v) => !v)]
}
// → (boolean | (() => void))[]
// const [on, toggle] = useToggle()
// 'on' and 'toggle' are both boolean | (() => void) — useless`,
  playground: {
    files: {
      "/App.js": `import { useState, useCallback } from "react"

// useToggle returns a tuple [value, toggle].
// In TS the 'as const' guarantees the type [boolean, () => void].
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((v) => !v), [])
  return [on, toggle]
}

// useCounter returns an object: ideal when there are several values.
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
        <strong style={{ fontSize: 13 }}>useToggle() → tuple</strong>
        <button style={btn} onClick={toggleOpen}>
          {isOpen ? "Open ▼" : "Closed ▶"}
        </button>
        {isOpen && (
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
            Content revealed by the toggle.
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <strong style={{ fontSize: 13 }}>useCounter() → object</strong>
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
