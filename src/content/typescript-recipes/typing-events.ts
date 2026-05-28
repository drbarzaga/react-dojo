import type { TypeScriptRecipe } from "./types"

export const typingEvents: TypeScriptRecipe = {
  id: "typing-events",
  label: "Tipar Eventos",
  description:
    "Tipos correctos para los event handlers más comunes: click, change, submit, teclado y drag.",
  category: "events",
  code: `import {
  MouseEvent,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  DragEvent,
} from "react"

// Click en un botón
function handleClick(e: MouseEvent<HTMLButtonElement>) {
  e.preventDefault()
  console.log(e.currentTarget.textContent)
}

// Input de texto
function handleChange(e: ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value)
}

// Select
function handleSelect(e: ChangeEvent<HTMLSelectElement>) {
  console.log(e.target.value)
}

// Submit de formulario
function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const form = new FormData(e.currentTarget)
  console.log(form.get("email"))
}

// Teclado
function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") console.log("Enter presionado")
  if (e.metaKey && e.key === "s") console.log("Cmd+S")
}

// Drag
function handleDrop(e: DragEvent<HTMLDivElement>) {
  const data = e.dataTransfer.getData("text/plain")
  console.log(data)
}`,
  do: `// ✓ Tipo específico — accedes a las propiedades correctas
function handleChange(e: ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value)       // string ✓
  console.log(e.target.checked)     // boolean ✓
}`,
  dont: `// ✗ any elimina toda la seguridad de tipos
function handleChange(e: any) {
  console.log(e.target.value)       // TypeScript no valida nada
  console.log(e.target.inexistente) // sin error aunque no exista
}`,
  playground: {
    files: {
      "/App.js": `import { useState } from "react"

export default function App() {
  const [log, setLog] = useState([])
  const addLog = (msg) => setLog((prev) => [msg, ...prev].slice(0, 6))

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>Tipar Eventos</h2>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 16 }}>
        Interactúa con los elementos para ver los eventos capturados.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <input
          placeholder="Escribe algo (onChange)"
          onChange={(e) => addLog("change: " + e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addLog("keydown: Enter")}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", color: "inherit", fontSize: 13 }}
        />
        <button
          onClick={(e) => addLog("click: " + e.currentTarget.textContent)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--line)", cursor: "pointer", fontSize: 13, fontFamily: "monospace" }}
        >
          Haz click aquí
        </button>
        <form onSubmit={(e) => { e.preventDefault(); addLog("submit: form") }} style={{ display: "flex", gap: 6 }}>
          <input name="email" placeholder="Email (submit con Enter)" style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", color: "inherit", fontSize: 13 }} />
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 13 }}>Enviar</button>
        </form>
      </div>

      <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--fg-muted)" }}>
        {log.length === 0 && <p>Eventos aparecerán aquí…</p>}
        {log.map((l, i) => <p key={i} style={{ margin: "2px 0" }}>→ {l}</p>)}
      </div>
    </div>
  )
}`,
    },
  },
}
