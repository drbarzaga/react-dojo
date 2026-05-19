import type { CustomHook } from "./types"

export const useList: CustomHook = {
  id: "useList",
  label: "useList",
  description:
    "Gestiona una lista con helpers para agregar, insertar, actualizar, eliminar, filtrar y ordenar elementos de forma inmutable.",
  category: "state",
  code: `import { useState, useCallback } from "react"

interface UseListReturn<T> {
  list: T[]
  set: (list: T[]) => void
  push: (...items: T[]) => void
  insert: (index: number, item: T) => void
  update: (index: number, item: T) => void
  remove: (index: number) => void
  filter: (predicate: (item: T, index: number) => boolean) => void
  sort: (compareFn?: (a: T, b: T) => number) => void
  clear: () => void
  reset: () => void
}

export function useList<T>(initialList: T[] = []): UseListReturn<T> {
  const [list, setList] = useState<T[]>(initialList)

  const set = useCallback((newList: T[]) => setList(newList), [])

  const push = useCallback((...items: T[]) => setList((l) => [...l, ...items]), [])

  const insert = useCallback(
    (index: number, item: T) =>
      setList((l) => [...l.slice(0, index), item, ...l.slice(index)]),
    []
  )

  const update = useCallback(
    (index: number, item: T) =>
      setList((l) => l.map((el, i) => (i === index ? item : el))),
    []
  )

  const remove = useCallback(
    (index: number) => setList((l) => l.filter((_, i) => i !== index)),
    []
  )

  const filter = useCallback(
    (predicate: (item: T, index: number) => boolean) =>
      setList((l) => l.filter(predicate)),
    []
  )

  const sort = useCallback(
    (compareFn?: (a: T, b: T) => number) =>
      setList((l) => [...l].sort(compareFn)),
    []
  )

  const clear = useCallback(() => setList([]), [])

  const reset = useCallback(() => setList(initialList), [initialList])

  return { list, set, push, insert, update, remove, filter, sort, clear, reset }
}`,
  playground: {
    files: {
      "/App.js": `import { useState, useCallback } from "react"

function useList(initialList = []) {
  const [list, setList] = useState(initialList)

  const set = useCallback((newList) => setList(newList), [])
  const push = useCallback((...items) => setList((l) => [...l, ...items]), [])
  const insert = useCallback(
    (index, item) => setList((l) => [...l.slice(0, index), item, ...l.slice(index)]),
    []
  )
  const update = useCallback(
    (index, item) => setList((l) => l.map((el, i) => (i === index ? item : el))),
    []
  )
  const remove = useCallback(
    (index) => setList((l) => l.filter((_, i) => i !== index)),
    []
  )
  const filter = useCallback(
    (predicate) => setList((l) => l.filter(predicate)),
    []
  )
  const sort = useCallback(
    (compareFn) => setList((l) => [...l].sort(compareFn)),
    []
  )
  const clear = useCallback(() => setList([]), [])
  const reset = useCallback(() => setList(initialList), [initialList])

  return { list, set, push, insert, update, remove, filter, sort, clear, reset }
}

const INITIAL_TASKS = [
  { id: 1, text: "Aprender hooks de React", done: false },
  { id: 2, text: "Crear un hook personalizado", done: false },
  { id: 3, text: "Escribir los tests", done: false },
]

export default function App() {
  const tasks = useList(INITIAL_TASKS)
  const [input, setInput] = useState("")

  function addTask() {
    if (!input.trim()) return
    tasks.push({ id: Date.now(), text: input.trim(), done: false })
    setInput("")
  }

  function toggleDone(index) {
    tasks.update(index, { ...tasks.list[index], done: !tasks.list[index].done })
  }

  const doneCount = tasks.list.filter((t) => t.done).length

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 440 }}>
      <h2 style={{ marginBottom: 4 }}>useList</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Lista de tareas — prueba push, update, remove, filter, sort, clear y reset.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Nueva tarea..."
          style={{
            flex: 1, padding: "6px 10px",
            border: "1px solid var(--line-strong)",
            borderRadius: 4, background: "var(--surface-1)",
            color: "var(--fg)",
          }}
        />
        <button onClick={addTask}>Agregar</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => tasks.sort((a, b) => a.text.localeCompare(b.text))}>
          Ordenar A–Z
        </button>
        <button onClick={() => tasks.filter((t) => !t.done)} disabled={doneCount === 0}>
          Quitar completadas
        </button>
        <button onClick={tasks.clear} disabled={tasks.list.length === 0}>
          Limpiar
        </button>
        <button onClick={tasks.reset}>
          Reset
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tasks.list.map((task, i) => (
          <li
            key={task.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 0", borderBottom: "1px solid var(--line)",
            }}
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleDone(i)}
              style={{ cursor: "pointer" }}
            />
            <span style={{
              flex: 1, fontSize: 14,
              textDecoration: task.done ? "line-through" : "none",
              color: task.done ? "var(--fg-muted)" : "var(--fg)",
            }}>
              {task.text}
            </span>
            <button
              onClick={() => tasks.remove(i)}
              style={{
                background: "none", border: "none",
                cursor: "pointer", fontSize: 16,
                color: "var(--fg-muted)", lineHeight: 1,
              }}
            >
              ×
            </button>
          </li>
        ))}
        {tasks.list.length === 0 && (
          <li style={{ color: "var(--fg-muted)", fontSize: 13, padding: "12px 0" }}>
            Sin tareas. Agrega una o pulsa Reset.
          </li>
        )}
      </ul>

      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 12 }}>
        {tasks.list.length} tarea{tasks.list.length !== 1 ? "s" : ""}
        {doneCount > 0 && \` · \${doneCount} completada\${doneCount !== 1 ? "s" : ""}\`}
      </p>
    </div>
  )
}`,
    },
  },
}
