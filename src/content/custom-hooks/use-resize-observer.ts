import type { CustomHook } from "./types"

export const useResizeObserver: CustomHook = {
  id: "useResizeObserver",
  label: "useResizeObserver",
  description:
    "Observa cambios de tamaño en un elemento específico usando ResizeObserver. Devuelve una ref, el ancho y el alto actuales del elemento.",
  category: "dom",
  code: `import { useState, useEffect, useRef } from "react"

interface Size {
  width: number
  height: number
}

export function useResizeObserver<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, width: size.width, height: size.height }
}`,
  playground: {
    files: {
      "/App.js": `import { useState, useEffect, useRef } from "react"

function useResizeObserver() {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, width: size.width, height: size.height }
}

export default function App() {
  const { ref, width, height } = useResizeObserver()

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 4 }}>useResizeObserver</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 16 }}>
        Arrastra la esquina del cuadro para redimensionarlo.
      </p>
      <div
        ref={ref}
        style={{
          resize: "both",
          overflow: "auto",
          width: 260,
          height: 160,
          minWidth: 120,
          minHeight: 80,
          border: "2px dashed var(--line)",
          borderRadius: 10,
          background: "var(--surface-1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--fg)" }}>
          {Math.round(width)} × {Math.round(height)}
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>ancho × alto (px)</div>
      </div>
    </div>
  )
}`,
    },
  },
}
