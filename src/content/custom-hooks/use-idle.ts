import type { CustomHook } from "./types"

export const useIdle: CustomHook = {
  id: "useIdle",
  label: "useIdle",
  description:
    "Detecta cuando el usuario lleva cierto tiempo inactivo (sin mover el ratón, escribir o hacer scroll). Útil para mostrar screensavers, cerrar sesiones o pausar animaciones.",
  category: "dom",
  code: `import { useState, useEffect, useCallback, useRef } from "react"

export function useIdle(timeout: number = 3000): boolean {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsIdle(false)
    timerRef.current = setTimeout(() => setIsIdle(true), timeout)
  }, [timeout])

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"]

    events.forEach((event) => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [resetTimer])

  return isIdle
}`,
  playground: {
    files: {
      "/App.js": `import { useState, useEffect, useCallback, useRef } from "react"

function useIdle(timeout = 3000) {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsIdle(false)
    timerRef.current = setTimeout(() => setIsIdle(true), timeout)
  }, [timeout])

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"]
    events.forEach((event) => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [resetTimer])

  return isIdle
}

export default function App() {
  const isIdle = useIdle(3000)
  const [historial, setHistorial] = useState([])

  useEffect(() => {
    const ahora = new Date().toLocaleTimeString()
    setHistorial((prev) => [
      { estado: isIdle ? "Inactivo" : "Activo", hora: ahora },
      ...prev.slice(0, 4),
    ])
  }, [isIdle])

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useIdle</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Mueve el ratón o presiona una tecla. Después de 3 s sin actividad el estado cambia a inactivo.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px",
          borderRadius: 8,
          marginBottom: 20,
          border: "2px solid",
          borderColor: isIdle ? "#f87171" : "#4ade80",
          background: isIdle ? "#fef2f2" : "#f0fdf4",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: isIdle ? "#ef4444" : "#22c55e",
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 15, color: isIdle ? "#dc2626" : "#16a34a" }}>
          {isIdle ? "Usuario inactivo" : "Usuario activo"}
        </span>
      </div>

      <h3 style={{ fontSize: 13, marginBottom: 8, color: "var(--fg-muted)" }}>Historial de cambios</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {historial.map((entry, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid var(--line)",
              fontSize: 13,
              opacity: 1 - i * 0.18,
            }}
          >
            <span style={{ color: entry.estado === "Inactivo" ? "#dc2626" : "#16a34a" }}>
              {entry.estado}
            </span>
            <span style={{ color: "var(--fg-muted)" }}>{entry.hora}</span>
          </li>
        ))}
        {historial.length === 0 && (
          <li style={{ color: "var(--fg-muted)", fontSize: 13 }}>Aún no hay cambios de estado.</li>
        )}
      </ul>
    </div>
  )
}`,
    },
  },
}
