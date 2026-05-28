import type { TypeScriptRecipe } from "./types"

export const typingRefs: TypeScriptRecipe = {
  id: "typing-refs",
  label: "Tipar useRef",
  description:
    "useRef tiene dos usos: referenciar un elemento DOM o guardar un valor mutable. Cada caso tiene su tipo correcto.",
  category: "hooks",
  code: `import { useRef, useEffect } from "react"

// ── Caso 1: referencia a un elemento DOM ────────────────
// Inicializa con null. El tipo incluye null porque el elemento
// no existe hasta que el componente se monta.
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus() // ?. porque puede ser null
  }, [])

  return <input ref={inputRef} />
}

// ── Caso 2: valor mutable (no DOM) ──────────────────────
// Inicializa con el valor. No necesita null porque el valor
// existe desde el primer render.
function StopWatch() {
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null)

  function start() {
    intervalId.current = setInterval(() => {
      console.log("tick")
    }, 1000)
  }

  function stop() {
    if (intervalId.current !== null) {
      clearInterval(intervalId.current)
    }
  }

  return <button onClick={start}>Start</button>
}

// ── Tipos de elementos DOM más comunes ──────────────────
const divRef    = useRef<HTMLDivElement>(null)
const inputRef  = useRef<HTMLInputElement>(null)
const formRef   = useRef<HTMLFormElement>(null)
const canvasRef = useRef<HTMLCanvasElement>(null)`,
  do: `// ✓ null inicial para refs DOM — el elemento no existe aún
const inputRef = useRef<HTMLInputElement>(null)

// Acceso seguro con optional chaining
inputRef.current?.focus()`,
  dont: `// ✗ Forzar non-null con ! es peligroso
const inputRef = useRef<HTMLInputElement>(null)

// Si el componente no montó, esto lanza en runtime
inputRef.current!.focus()`,
  playground: {
    files: {
      "/App.js": `import { useRef, useEffect, useState } from "react"

function AutoFocusInput() {
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <input
      ref={inputRef}
      placeholder="Auto-focus al montar"
      style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", color: "inherit", fontSize: 13, width: "100%" }}
    />
  )
}

function StopWatch() {
  const [running, setRunning] = useState(false)
  const [ms, setMs] = useState(0)
  const intervalRef = useRef(null)
  const startMs = useRef(0)

  function start() {
    startMs.current = Date.now() - ms
    intervalRef.current = setInterval(() => setMs(Date.now() - startMs.current), 50)
    setRunning(true)
  }

  function stop() {
    clearInterval(intervalRef.current)
    setRunning(false)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setMs(0)
    setRunning(false)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: "monospace", fontSize: 22, minWidth: 80 }}>
        {(ms / 1000).toFixed(2)}s
      </span>
      <button onClick={running ? stop : start} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--line)", background: running ? "#f87171" : "#4ade80", color: "#000", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>
        {running ? "Stop" : "Start"}
      </button>
      <button onClick={reset} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", color: "inherit", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>
        Reset
      </button>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ marginBottom: 0 }}>Tipar useRef</h2>
      <div>
        <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8, fontFamily: "monospace" }}>useRef&lt;HTMLInputElement&gt;(null) — ref DOM</p>
        <AutoFocusInput />
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8, fontFamily: "monospace" }}>useRef&lt;number | null&gt;(null) — valor mutable</p>
        <StopWatch />
      </div>
    </div>
  )
}`,
    },
  },
}
