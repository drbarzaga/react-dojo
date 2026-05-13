import type { CustomHook } from "./types"

export const useScrollPosition: CustomHook = {
  id: "useScrollPosition",
  label: "useScrollPosition",
  description:
    "Rastrea la posición de scroll del window o de un elemento con ref. Devuelve x e y actualizados en cada evento de scroll.",
  category: "dom",
  code: `import { useState, useEffect, type RefObject } from "react"

interface ScrollPosition {
  x: number
  y: number
}

export function useScrollPosition(elementRef?: RefObject<HTMLElement>): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 })

  useEffect(() => {
    const target: HTMLElement | Window = elementRef?.current ?? window

    function handleScroll() {
      if (elementRef?.current) {
        setPosition({ x: elementRef.current.scrollLeft, y: elementRef.current.scrollTop })
      } else {
        setPosition({ x: window.scrollX, y: window.scrollY })
      }
    }

    target.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => target.removeEventListener("scroll", handleScroll)
  }, [elementRef])

  return position
}`,
  playground: {
    files: {
      "/App.js": `import { useState, useEffect, useRef } from "react"

function useScrollPosition(elementRef) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const target = elementRef?.current ?? window

    function handleScroll() {
      if (elementRef?.current) {
        setPosition({ x: elementRef.current.scrollLeft, y: elementRef.current.scrollTop })
      } else {
        setPosition({ x: window.scrollX, y: window.scrollY })
      }
    }

    target.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => target.removeEventListener("scroll", handleScroll)
  }, [elementRef])

  return position
}

const CAPITULOS = [
  "Introducción a React",
  "Componentes y Props",
  "Estado con useState",
  "Efectos con useEffect",
  "Referencias con useRef",
  "Contexto con useContext",
  "Reducers con useReducer",
  "Optimización con useMemo",
  "Callbacks con useCallback",
  "Hooks personalizados",
]

export default function App() {
  const listRef = useRef(null)
  const { y } = useScrollPosition(listRef)

  const maxScroll = listRef.current
    ? listRef.current.scrollHeight - listRef.current.clientHeight
    : 1
  const progreso = Math.round((y / Math.max(maxScroll, 1)) * 100)

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useScrollPosition</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 12 }}>
        Haz scroll en la lista para ver la posición actualizada.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--surface-1)" }}>
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 2 }}>scrollY</div>
          <div style={{ fontFamily: "monospace", fontWeight: 700 }}>{y}px</div>
        </div>
        <div style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--surface-1)" }}>
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 2 }}>Progreso</div>
          <div style={{ fontFamily: "monospace", fontWeight: 700 }}>{progreso}%</div>
        </div>
      </div>

      <div style={{ height: 4, borderRadius: 4, background: "var(--surface-2)", marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", width: progreso + "%", background: "#60a5fa", borderRadius: 4, transition: "width 60ms" }} />
      </div>

      <div
        ref={listRef}
        style={{ height: 220, overflowY: "auto", border: "1px solid var(--line)", borderRadius: 8, padding: "4px 0" }}
      >
        {CAPITULOS.map((cap, i) => (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              borderBottom: i < CAPITULOS.length - 1 ? "1px solid var(--line)" : "none",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "var(--surface-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              color: "var(--fg-muted)",
            }}>
              {i + 1}
            </span>
            {cap}
          </div>
        ))}
      </div>

      {y > 20 && (
        <button
          onClick={() => listRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            marginTop: 10, width: "100%", padding: "8px",
            borderRadius: 6, border: "1px solid var(--line)",
            background: "var(--surface-1)", cursor: "pointer",
            fontSize: 13, color: "var(--fg-muted)",
          }}
        >
          ↑ Volver al inicio
        </button>
      )}
    </div>
  )
}`,
    },
  },
}
