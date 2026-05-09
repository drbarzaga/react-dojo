import type { CustomHook } from "./types"

export type { CustomHook, HookCategory } from "./types"

export const allCustomHooks: CustomHook[] = [
  {
    id: "useLocalStorage",
    label: "useLocalStorage",
    description:
      "Persiste el estado en localStorage y lo mantiene sincronizado entre renders. Maneja la serialización JSON automáticamente.",
    category: "state",
    code: `import { useState, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next = value instanceof Function ? value(storedValue) : value
        setStoredValue(next)
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch (error) {
        console.error(error)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    setStoredValue(initialValue)
    window.localStorage.removeItem(key)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useCallback } from "react"

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      try {
        const next = value instanceof Function ? value(storedValue) : value
        setStoredValue(next)
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch (error) {
        console.error(error)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    setStoredValue(initialValue)
    window.localStorage.removeItem(key)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

export default function App() {
  const [nombre, setNombre, eliminarNombre] = useLocalStorage("demo-nombre", "React Dev")
  const [contador, setContador] = useLocalStorage("demo-contador", 0)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 420 }}>
      <h2 style={{ marginBottom: 4 }}>useLocalStorage</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 24 }}>
        Los valores persisten entre recargas. Abre DevTools → Application → localStorage para verlo.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Nombre</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre..."
            style={{ flex: 1 }}
          />
          <button onClick={eliminarNombre}>Limpiar</button>
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Contador persistente</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setContador((c) => c - 1)}>−</button>
          <span style={{ fontFamily: "monospace", fontSize: 20, minWidth: 32, textAlign: "center" }}>{contador}</span>
          <button onClick={() => setContador((c) => c + 1)}>+</button>
        </div>
      </div>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useDebounce",
    label: "useDebounce",
    description:
      "Retrasa la actualización de un valor hasta que haya pasado cierto tiempo sin cambios. Ideal para inputs de búsqueda y filtros en vivo.",
    category: "utility",
    code: `import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useEffect } from "react"

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

const FRUTAS = [
  "Manzana", "Albaricoque", "Aguacate", "Plátano", "Arándano",
  "Cereza", "Coco", "Uva", "Kiwi", "Limón",
  "Mango", "Naranja", "Papaya", "Melocotón", "Piña",
  "Ciruela", "Frambuesa", "Fresa", "Sandía",
]

export default function App() {
  const [query, setQuery] = useState("")
  const [contadorLlamadas, setContadorLlamadas] = useState(0)
  const queryDebounced = useDebounce(query, 400)

  useEffect(() => {
    if (queryDebounced) setContadorLlamadas((c) => c + 1)
  }, [queryDebounced])

  const resultados = FRUTAS.filter((f) =>
    f.toLowerCase().includes(queryDebounced.toLowerCase())
  )

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useDebounce</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 16 }}>
        La búsqueda solo se ejecuta 400 ms después de que dejes de escribir.
      </p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar frutas..."
        style={{ width: "100%", marginBottom: 8 }}
      />
      <p style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 12 }}>
        Búsquedas ejecutadas: <strong>{contadorLlamadas}</strong> · Query activo: <code>"{queryDebounced}"</code>
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {resultados.map((fruta) => (
          <li key={fruta} style={{ padding: "6px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
            {fruta}
          </li>
        ))}
        {resultados.length === 0 && queryDebounced && (
          <li style={{ color: "var(--fg-muted)", fontSize: 13 }}>Sin resultados para "{queryDebounced}"</li>
        )}
      </ul>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "usePrevious",
    label: "usePrevious",
    description:
      "Devuelve el valor del render anterior. Útil para comparar estado antiguo y nuevo, o detectar la dirección de un cambio.",
    category: "state",
    code: `import { useRef, useEffect } from "react"

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  })

  return ref.current
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react"

function usePrevious(value) {
  const ref = useRef(undefined)
  useEffect(() => { ref.current = value })
  return ref.current
}

export default function App() {
  const [contador, setContador] = useState(0)
  const anteriorContador = usePrevious(contador)
  const direccion = anteriorContador === undefined
    ? "—"
    : contador > anteriorContador
    ? "↑ subió"
    : contador < anteriorContador
    ? "↓ bajó"
    : "= igual"

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 340 }}>
      <h2 style={{ marginBottom: 4 }}>usePrevious</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 24 }}>
        Accede al valor del render anterior para comparar cambios.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => setContador((c) => c - 1)}>−</button>
        <span style={{ fontFamily: "monospace", fontSize: 28, minWidth: 40, textAlign: "center" }}>{contador}</span>
        <button onClick={() => setContador((c) => c + 1)}>+</button>
      </div>
      <table style={{ fontSize: 13, borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>Valor actual</td>
            <td style={{ fontFamily: "monospace", textAlign: "right" }}>{contador}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>Valor anterior</td>
            <td style={{ fontFamily: "monospace", textAlign: "right" }}>{anteriorContador ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>Dirección</td>
            <td style={{ textAlign: "right" }}>{direccion}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useMediaQuery",
    label: "useMediaQuery",
    description:
      "Se suscribe a una media query CSS y devuelve si coincide en este momento. Se actualiza reactivamente cuando cambia el viewport.",
    category: "dom",
    code: `import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useEffect } from "react"

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (e) => setMatches(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

export default function App() {
  const esAncho = useMediaQuery("(min-width: 500px)")
  const prefiereOscuro = useMediaQuery("(prefers-color-scheme: dark)")
  const prefiereReducido = useMediaQuery("(prefers-reduced-motion: reduce)")

  const fila = (etiqueta, valor) => (
    <tr key={etiqueta}>
      <td style={{ padding: "6px 0", color: "var(--fg-muted)", fontSize: 13 }}>{etiqueta}</td>
      <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
        <span style={{ color: valor ? "#34d399" : "#f87171" }}>{valor ? "true" : "false"}</span>
      </td>
    </tr>
  )

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useMediaQuery</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Redimensiona el preview para ver cómo cambia <code>esAncho</code>.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {fila("(min-width: 500px)", esAncho)}
          {fila("(prefers-color-scheme: dark)", prefiereOscuro)}
          {fila("(prefers-reduced-motion: reduce)", prefiereReducido)}
        </tbody>
      </table>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useToggle",
    label: "useToggle",
    description:
      "Gestiona un estado booleano con helpers toggle, setTrue y setFalse. Reduce boilerplate en patrones de UI encendido/apagado.",
    category: "state",
    code: `import { useState, useCallback } from "react"

interface UseToggleReturn {
  value: boolean
  toggle: () => void
  setTrue: () => void
  setFalse: () => void
}

export function useToggle(initialValue = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useCallback } from "react"

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  return { value, toggle, setTrue, setFalse }
}

export default function App() {
  const modal = useToggle(false)
  const oscuro = useToggle(false)
  const silenciado = useToggle(true)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useToggle</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Tres instancias independientes del mismo hook.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>Modal</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={modal.setTrue} disabled={modal.value}>Abrir</button>
            <button onClick={modal.setFalse} disabled={!modal.value}>Cerrar</button>
            <button onClick={modal.toggle}>Toggle</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>Tema oscuro</span>
          <button onClick={oscuro.toggle}>{oscuro.value ? "🌙 Oscuro" : "☀️ Claro"}</button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>Sonido</span>
          <button onClick={silenciado.toggle}>{silenciado.value ? "🔇 Silenciado" : "🔊 Activo"}</button>
        </div>
      </div>

      {modal.value && (
        <div style={{
          marginTop: 20, padding: "16px", borderRadius: 8,
          border: "1px solid var(--line-strong)", background: "var(--surface-1)"
        }}>
          <strong style={{ fontSize: 14 }}>Modal abierto</strong>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "8px 0" }}>
            Cerrado con setFalse(), no con toggle() — más semántico.
          </p>
          <button onClick={modal.setFalse}>Cerrar</button>
        </div>
      )}
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useClickOutside",
    label: "useClickOutside",
    description:
      "Llama a un callback cuando el usuario hace clic fuera de un elemento referenciado. Ideal para cerrar dropdowns, modales y popovers.",
    category: "dom",
    code: `import { useEffect, useRef } from "react"

export function useClickOutside<T extends HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [callback])

  return ref
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useEffect, useRef, useCallback } from "react"

function useClickOutside(callback) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [callback])

  return ref
}

export default function App() {
  const [abierto, setAbierto] = useState(false)
  const [contadorCierres, setContadorCierres] = useState(0)

  const handleCerrar = useCallback(() => {
    if (abierto) {
      setAbierto(false)
      setContadorCierres((c) => c + 1)
    }
  }, [abierto])

  const ref = useClickOutside(handleCerrar)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 4 }}>useClickOutside</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Haz clic en el botón para abrir el panel, luego haz clic fuera para cerrarlo.
      </p>

      <button onClick={() => setAbierto(true)} disabled={abierto}>
        Abrir panel
      </button>

      {abierto && (
        <div
          ref={ref}
          style={{
            marginTop: 12, padding: "16px", borderRadius: 8,
            border: "1px solid var(--line-strong)", background: "var(--surface-1)",
            maxWidth: 260
          }}
        >
          <strong style={{ fontSize: 14 }}>Panel abierto</strong>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "8px 0 0" }}>
            Haz clic fuera de este panel para cerrarlo.
          </p>
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: "var(--fg-muted)" }}>
        Veces cerrado por clic externo: <strong>{contadorCierres}</strong>
      </p>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useClipboard",
    label: "useClipboard",
    description:
      "Copia texto al portapapeles y provee un estado transitorio 'copiado' que se resetea automáticamente tras un intervalo configurable.",
    category: "utility",
    code: `import { useState, useCallback } from "react"

interface UseClipboardReturn {
  copied: boolean
  copy: (text: string) => Promise<void>
}

export function useClipboard(resetInterval = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), resetInterval)
      } catch {
        setCopied(false)
      }
    },
    [resetInterval]
  )

  return { copied, copy }
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useCallback } from "react"

function useClipboard(resetInterval = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), resetInterval)
    } catch {
      setCopied(false)
    }
  }, [resetInterval])

  return { copied, copy }
}

const FRAGMENTOS = [
  { etiqueta: "Instalar", codigo: "npm install react" },
  { etiqueta: "Importar hook", codigo: 'import { useClipboard } from "./useClipboard"' },
  { etiqueta: "Git clone", codigo: "git clone https://github.com/drbarzaga/react-dojo" },
]

export default function App() {
  const { copied, copy } = useClipboard(1500)
  const [ultimoCopiado, setUltimoCopiado] = useState(null)

  const handleCopiar = (texto, etiqueta) => {
    copy(texto)
    setUltimoCopiado(etiqueta)
  }

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useClipboard</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Haz clic en "Copiar" para copiar el texto al portapapeles.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FRAGMENTOS.map(({ etiqueta, codigo }) => (
          <div
            key={etiqueta}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              gap: 12, padding: "10px 12px", borderRadius: 6,
              border: "1px solid var(--line)", background: "var(--surface-1)"
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 2 }}>{etiqueta}</div>
              <code style={{ fontSize: 12, wordBreak: "break-all" }}>{codigo}</code>
            </div>
            <button
              onClick={() => handleCopiar(codigo, etiqueta)}
              style={{ flexShrink: 0, fontSize: 12 }}
            >
              {copied && ultimoCopiado === etiqueta ? "✓ Copiado" : "Copiar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useWindowSize",
    label: "useWindowSize",
    description:
      "Rastrea las dimensiones del viewport y se actualiza reactivamente cada vez que el usuario redimensiona la ventana.",
    category: "dom",
    code: `import { useState, useEffect } from "react"

interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return size
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useEffect } from "react"

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return size
}

function Barra({ valor, maximo, color, etiqueta }) {
  const pct = Math.min((valor / maximo) * 100, 100)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: "var(--fg-muted)" }}>{etiqueta}</span>
        <span style={{ fontFamily: "monospace" }}>{valor}px</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 4, transition: "width 100ms" }} />
      </div>
    </div>
  )
}

export default function App() {
  const { width, height } = useWindowSize()
  const breakpoint = width < 480 ? "xs" : width < 768 ? "sm" : width < 1024 ? "md" : "lg"

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useWindowSize</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 24 }}>
        Redimensiona el panel del preview para ver los cambios en tiempo real.
      </p>

      <Barra valor={width} maximo={1920} color="#60a5fa" etiqueta="Ancho" />
      <Barra valor={height} maximo={1080} color="#34d399" etiqueta="Alto" />

      <div style={{
        marginTop: 8, padding: "10px 14px", borderRadius: 6,
        border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Breakpoint actual</span>
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600 }}>{breakpoint}</span>
      </div>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useInterval",
    label: "useInterval",
    description:
      "Wrapper declarativo sobre setInterval que sincroniza siempre el callback más reciente sin necesidad de limpiar manualmente.",
    category: "utility",
    code: `import { useEffect, useRef } from "react"

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react"

function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => { savedCallback.current = callback }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  const centis = Math.floor((ms % 1000) / 10)
  const m = Math.floor(s / 60)
  return \`\${String(m).padStart(2, "0")}:\${String(s % 60).padStart(2, "0")}.\${String(centis).padStart(2, "0")}\`
}

export default function App() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState([])

  useInterval(() => setElapsed((e) => e + 10), running ? 10 : null)

  const reset = () => { setElapsed(0); setRunning(false); setLaps([]) }
  const lap = () => setLaps((l) => [elapsed, ...l])

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 320 }}>
      <h2 style={{ marginBottom: 4 }}>useInterval</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        El delay es <code>null</code> cuando está pausado — el interval se desmonta automáticamente.
      </p>

      <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 36, letterSpacing: 2, marginBottom: 20 }}>
        {formatTime(elapsed)}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
        <button onClick={() => setRunning((r) => !r)} style={{ minWidth: 80 }}>
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button onClick={lap} disabled={!running}>Vuelta</button>
        <button onClick={reset}>Reset</button>
      </div>

      {laps.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {laps.map((t, i) => (
            <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, borderBottom: "1px solid var(--line)" }}>
              <span style={{ color: "var(--fg-muted)" }}>Vuelta {laps.length - i}</span>
              <span style={{ fontFamily: "monospace" }}>{formatTime(t)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useFetch",
    label: "useFetch",
    description:
      "Encapsula la lógica de fetching con estados de carga, datos y error. Cancela la petición automáticamente si el componente se desmonta.",
    category: "async",
    code: `import { useState, useEffect } from "react"

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
        return res.json() as Promise<T>
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message })
      })

    return () => { cancelled = true }
  }, [url])

  return state
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useEffect } from "react"

function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fetch(url)
      .then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json() })
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }) })
      .catch((err) => { if (!cancelled) setState({ data: null, loading: false, error: err.message }) })

    return () => { cancelled = true }
  }, [url])

  return state
}

const ENDPOINTS = [
  { label: "Posts", url: "https://jsonplaceholder.typicode.com/posts?_limit=4" },
  { label: "Usuarios", url: "https://jsonplaceholder.typicode.com/users?_limit=4" },
  { label: "URL inválida (error)", url: "https://jsonplaceholder.typicode.com/invalid-404" },
]

export default function App() {
  const [endpointIdx, setEndpointIdx] = useState(0)
  const { url } = ENDPOINTS[endpointIdx]
  const { data, loading, error } = useFetch(url)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useFetch</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 16 }}>
        Cambia el endpoint para ver el estado de carga y manejo de errores.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {ENDPOINTS.map((e, i) => (
          <button
            key={i}
            onClick={() => setEndpointIdx(i)}
            style={{ fontSize: 12, fontWeight: endpointIdx === i ? 700 : 400 }}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--fg-muted)", marginBottom: 12, wordBreak: "break-all" }}>
        {url}
      </div>

      {loading && (
        <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>Cargando…</div>
      )}
      {error && (
        <div style={{ color: "#f87171", fontSize: 13, padding: "8px 12px", border: "1px solid #f8717140", borderRadius: 6 }}>
          Error: {error}
        </div>
      )}
      {data && !loading && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {data.map((item) => (
            <li key={item.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
              <strong style={{ fontFamily: "monospace", fontSize: 11, color: "var(--fg-muted)" }}>#{item.id}</strong>
              {" "}{item.title || item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useHover",
    label: "useHover",
    description:
      "Detecta si el cursor está sobre un elemento referenciado. Devuelve una ref y un booleano que se actualiza con mouseenter/mouseleave.",
    category: "dom",
    code: `import { useState, useRef, useEffect } from "react"

export function useHover<T extends HTMLElement>() {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const enter = () => setHovered(true)
    const leave = () => setHovered(false)

    el.addEventListener("mouseenter", enter)
    el.addEventListener("mouseleave", leave)
    return () => {
      el.removeEventListener("mouseenter", enter)
      el.removeEventListener("mouseleave", leave)
    }
  }, [])

  return [ref, hovered] as const
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react"

function useHover() {
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const enter = () => setHovered(true)
    const leave = () => setHovered(false)
    el.addEventListener("mouseenter", enter)
    el.addEventListener("mouseleave", leave)
    return () => {
      el.removeEventListener("mouseenter", enter)
      el.removeEventListener("mouseleave", leave)
    }
  }, [])

  return [ref, hovered]
}

function TarjetaHover({ titulo, descripcion, color }) {
  const [ref, hovered] = useHover()
  return (
    <div
      ref={ref}
      style={{
        padding: "16px", borderRadius: 8, cursor: "default",
        border: \`1px solid \${hovered ? color : "var(--line)"}\`,
        background: hovered ? color + "10" : "var(--surface-1)",
        transition: "all 160ms",
      }}
    >
      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{titulo}</div>
      <div style={{ fontSize: 12, color: hovered ? "var(--fg)" : "var(--fg-muted)", transition: "color 160ms" }}>
        {hovered ? "¡Hovereando! 🎯" : descripcion}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 360 }}>
      <h2 style={{ marginBottom: 4 }}>useHover</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Pasa el cursor sobre cada tarjeta — cada una tiene su propia instancia del hook.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <TarjetaHover titulo="useLocalStorage" descripcion="Persiste estado en localStorage" color="#60a5fa" />
        <TarjetaHover titulo="useDebounce" descripcion="Retrasa actualización de valores" color="#34d399" />
        <TarjetaHover titulo="useToggle" descripcion="Alterna un estado booleano" color="#f59e0b" />
      </div>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useEventListener",
    label: "useEventListener",
    description:
      "Adjunta event listeners de forma declarativa, mantiene siempre el callback más reciente y limpia automáticamente al desmontar.",
    category: "dom",
    code: `import { useEffect, useRef } from "react"

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: EventTarget = window
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!element?.addEventListener) return
    const listener = (event: Event) =>
      savedHandler.current(event as WindowEventMap[K])
    element.addEventListener(eventName, listener)
    return () => element.removeEventListener(eventName, listener)
  }, [eventName, element])
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useRef, useEffect } from "react"

function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(handler)
  useEffect(() => { savedHandler.current = handler }, [handler])
  useEffect(() => {
    if (!element?.addEventListener) return
    const listener = (e) => savedHandler.current(e)
    element.addEventListener(eventName, listener)
    return () => element.removeEventListener(eventName, listener)
  }, [eventName, element])
}

export default function App() {
  const [ultimaTecla, setUltimaTecla] = useState(null)
  const [historial, setHistorial] = useState([])
  const [clics, setClics] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEventListener("keydown", (e) => {
    if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return
    const tecla = e.key === " " ? "Space" : e.key
    setUltimaTecla(tecla)
    setHistorial((h) => [tecla, ...h].slice(0, 8))
  })

  useEventListener("click", () => setClics((c) => c + 1))

  useEventListener("mousemove", (e) => setPos({ x: e.clientX, y: e.clientY }))

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useEventListener</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Haz clic, mueve el cursor y presiona teclas para ver los eventos.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6 }}>keydown</div>
          <div style={{ fontFamily: "monospace", fontSize: 22, minHeight: 30 }}>
            {ultimaTecla ?? "—"}
          </div>
        </div>
        <div style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6 }}>click</div>
          <div style={{ fontFamily: "monospace", fontSize: 22 }}>{clics}</div>
        </div>
      </div>

      <div style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: 6, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>mousemove</div>
        <div style={{ fontFamily: "monospace", fontSize: 13 }}>x: {pos.x} · y: {pos.y}</div>
      </div>

      {historial.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {historial.map((t, i) => (
            <span key={i} style={{
              fontFamily: "monospace", fontSize: 11,
              padding: "2px 8px", borderRadius: 4,
              background: "var(--surface-2)", color: "var(--fg-muted)",
              opacity: 1 - i * 0.1
            }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useIntersectionObserver",
    label: "useIntersectionObserver",
    description:
      "Observa si un elemento es visible en el viewport (o en un contenedor scrollable). Devuelve una ref, la entrada completa del observer y un booleano isIntersecting.",
    category: "dom",
    code: `import { useState, useEffect, useRef } from "react"

interface Options {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export function useIntersectionObserver<T extends HTMLElement>(
  options: Options = {}
) {
  const { threshold = 0, root = null, rootMargin = "0px" } = options
  const ref = useRef<T>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([e]) => setEntry(e),
      { threshold, root, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, root, rootMargin])

  return { ref, entry, isIntersecting: entry?.isIntersecting ?? false }
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useEffect, useRef } from "react"

function useIntersectionObserver(options = {}) {
  const { threshold = 0, root = null, rootMargin = "0px" } = options
  const ref = useRef(null)
  const [entry, setEntry] = useState(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([e]) => setEntry(e),
      { threshold, root, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, root, rootMargin])

  return { ref, entry, isIntersecting: entry?.isIntersecting ?? false }
}

function Elemento({ index, root }) {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.6, root })

  return (
    <div
      ref={ref}
      style={{
        padding: "14px 16px",
        marginBottom: 10,
        borderRadius: 8,
        border: \`1px solid \${isIntersecting ? "#34d399" : "var(--line)"}\`,
        background: isIntersecting ? "#34d39912" : "var(--surface-1)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transform: isIntersecting ? "translateX(0)" : "translateX(-12px)",
        opacity: isIntersecting ? 1 : 0.35,
        transition: "all 280ms ease",
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700,
        background: isIntersecting ? "#34d399" : "var(--surface-2)",
        color: isIntersecting ? "#fff" : "var(--fg-muted)",
        transition: "background 280ms",
      }}>
        {index + 1}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Elemento {index + 1}</div>
        <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
          {isIntersecting ? "✓ Visible en el viewport" : "Fuera del viewport"}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [scrollEl, setScrollEl] = useState(null)

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useIntersectionObserver</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 14 }}>
        Haz scroll dentro del contenedor para ver los elementos activarse.
      </p>
      <div
        ref={setScrollEl}
        style={{
          height: 280,
          overflowY: "auto",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: "10px 10px 10px",
        }}
      >
        {scrollEl && Array.from({ length: 8 }, (_, i) => (
          <Elemento key={i} index={i} root={scrollEl} />
        ))}
      </div>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useCounter",
    label: "useCounter",
    description:
      "Gestiona un contador numérico con helpers de incremento, decremento, reset y set. Soporta límites mínimos y máximos opcionales.",
    category: "state",
    code: `import { useState, useCallback } from "react"

interface UseCounterOptions {
  min?: number
  max?: number
}

interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  set: (value: number) => void
}

export function useCounter(
  initialValue = 0,
  options: UseCounterOptions = {}
): UseCounterReturn {
  const { min, max } = options

  const clamp = useCallback(
    (value: number) => {
      if (min !== undefined && value < min) return min
      if (max !== undefined && value > max) return max
      return value
    },
    [min, max]
  )

  const [count, setCount] = useState(() => clamp(initialValue))

  const increment = useCallback(() => setCount((c) => clamp(c + 1)), [clamp])
  const decrement = useCallback(() => setCount((c) => clamp(c - 1)), [clamp])
  const reset = useCallback(() => setCount(clamp(initialValue)), [clamp, initialValue])
  const set = useCallback((value: number) => setCount(clamp(value)), [clamp])

  return { count, increment, decrement, reset, set }
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useCallback } from "react"

function useCounter(initialValue = 0, options = {}) {
  const { min, max } = options

  const clamp = useCallback(
    (value) => {
      if (min !== undefined && value < min) return min
      if (max !== undefined && value > max) return max
      return value
    },
    [min, max]
  )

  const [count, setCount] = useState(() => clamp(initialValue))

  const increment = useCallback(() => setCount((c) => clamp(c + 1)), [clamp])
  const decrement = useCallback(() => setCount((c) => clamp(c - 1)), [clamp])
  const reset = useCallback(() => setCount(clamp(initialValue)), [clamp, initialValue])
  const set = useCallback((value) => setCount(clamp(value)), [clamp])

  return { count, increment, decrement, reset, set }
}

export default function App() {
  const basic = useCounter(0)
  const bounded = useCounter(5, { min: 0, max: 10 })
  const quantity = useCounter(1, { min: 1, max: 99 })

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useCounter</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Tres instancias con configuraciones distintas.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>
            Básico — sin límites
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={basic.decrement}>−</button>
            <span style={{ fontSize: 20, fontWeight: 600, minWidth: 40, textAlign: "center" }}>
              {basic.count}
            </span>
            <button onClick={basic.increment}>+</button>
            <button onClick={basic.reset} style={{ marginLeft: 8, fontSize: 12 }}>Reset</button>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>
            Acotado — min: 0, max: 10
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={bounded.decrement} disabled={bounded.count <= 0}>−</button>
            <span style={{ fontSize: 20, fontWeight: 600, minWidth: 40, textAlign: "center" }}>
              {bounded.count}
            </span>
            <button onClick={bounded.increment} disabled={bounded.count >= 10}>+</button>
            <span style={{ fontSize: 11, color: "var(--fg-muted)", marginLeft: 8 }}>
              {bounded.count} / 10
            </span>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>
            Selector de cantidad — min: 1, max: 99
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={quantity.decrement} disabled={quantity.count <= 1}>−</button>
            <span style={{ fontSize: 20, fontWeight: 600, minWidth: 40, textAlign: "center" }}>
              {quantity.count}
            </span>
            <button onClick={quantity.increment} disabled={quantity.count >= 99}>+</button>
            <button
              onClick={() => quantity.set(99)}
              style={{ marginLeft: 8, fontSize: 12 }}
            >
              Máx
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useOnlineStatus",
    label: "useOnlineStatus",
    description:
      "Detecta si el usuario tiene conexión a internet escuchando los eventos online y offline del navegador.",
    category: "dom",
    code: `import { useSyncExternalStore } from "react"

function subscribe(callback: () => void) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  )
}`,
    playground: {
      files: {
        "/App.js": `import { useSyncExternalStore } from "react"

function subscribe(callback) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  )
}

export default function App() {
  const isOnline = useOnlineStatus()

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 360 }}>
      <h2 style={{ marginBottom: 4 }}>useOnlineStatus</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 24 }}>
        Desactiva tu conexión de red para ver el cambio de estado.
      </p>

      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px", borderRadius: 8,
        border: "1px solid var(--line-strong)",
        background: "var(--surface-1)"
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: "50%",
          background: isOnline ? "#22c55e" : "#ef4444",
          boxShadow: isOnline ? "0 0 6px #22c55e" : "0 0 6px #ef4444"
        }} />
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
            {isOnline ? "En línea" : "Sin conexión"}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--fg-muted)" }}>
            {isOnline ? "Estás conectado a internet." : "No se detecta conexión a internet."}
          </p>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: "var(--fg-muted)" }}>
        Usa los eventos <code>online</code> y <code>offline</code> del objeto window.
      </p>
    </div>
  )
}`,
      },
    },
  },
  {
    id: "useKeyPress",
    label: "useKeyPress",
    description:
      "Detecta si una tecla específica está siendo presionada escuchando los eventos keydown y keyup del teclado a nivel global.",
    category: "dom",
    code: `import { useState, useEffect } from "react"

export function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const handleDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) setIsPressed(true)
    }
    const handleUp = (event: KeyboardEvent) => {
      if (event.key === targetKey) setIsPressed(false)
    }

    window.addEventListener("keydown", handleDown)
    window.addEventListener("keyup", handleUp)
    return () => {
      window.removeEventListener("keydown", handleDown)
      window.removeEventListener("keyup", handleUp)
    }
  }, [targetKey])

  return isPressed
}`,
    playground: {
      files: {
        "/App.js": `import { useState, useEffect } from "react"

function useKeyPress(targetKey) {
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const handleDown = (event) => {
      if (event.key === targetKey) setIsPressed(true)
    }
    const handleUp = (event) => {
      if (event.key === targetKey) setIsPressed(false)
    }

    window.addEventListener("keydown", handleDown)
    window.addEventListener("keyup", handleUp)
    return () => {
      window.removeEventListener("keydown", handleDown)
      window.removeEventListener("keyup", handleUp)
    }
  }, [targetKey])

  return isPressed
}

function KeyCap({ label, active }) {
  return (
    <div style={{
      padding: "8px 14px",
      minWidth: 64,
      borderRadius: 6,
      border: "1px solid var(--line-strong)",
      background: active ? "#6366f1" : "var(--surface-1)",
      color: active ? "white" : "var(--fg)",
      fontFamily: "monospace",
      fontSize: 13,
      textAlign: "center",
      boxShadow: active ? "0 0 0 3px rgba(99,102,241,.25)" : "0 1px 0 var(--line)",
      transform: active ? "translateY(1px)" : "translateY(0)",
      transition: "transform .08s ease, background .08s ease"
    }}>{label}</div>
  )
}

export default function App() {
  const isSpace = useKeyPress(" ")
  const isEnter = useKeyPress("Enter")
  const isShift = useKeyPress("Shift")
  const isUp = useKeyPress("ArrowUp")
  const isDown = useKeyPress("ArrowDown")
  const isLeft = useKeyPress("ArrowLeft")
  const isRight = useKeyPress("ArrowRight")

  const [pos, setPos] = useState({ x: 160, y: 50 })

  useEffect(() => {
    if (!isUp && !isDown && !isLeft && !isRight) return
    const id = setInterval(() => {
      setPos((p) => ({
        x: Math.max(0, Math.min(340, p.x + (isRight ? 5 : 0) - (isLeft ? 5 : 0))),
        y: Math.max(0, Math.min(110, p.y + (isDown ? 5 : 0) - (isUp ? 5 : 0))),
      }))
    }, 16)
    return () => clearInterval(id)
  }, [isUp, isDown, isLeft, isRight])

  useEffect(() => {
    const blockScroll = (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault()
      }
    }
    window.addEventListener("keydown", blockScroll)
    return () => window.removeEventListener("keydown", blockScroll)
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 420 }}>
      <h2 style={{ marginBottom: 4 }}>useKeyPress</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Haz clic en el preview y presiona las teclas para ver su estado en vivo.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <KeyCap label="Space" active={isSpace} />
        <KeyCap label="Enter" active={isEnter} />
        <KeyCap label="Shift" active={isShift} />
      </div>

      <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 8 }}>
        Mueve el bloque con las flechas ← ↑ → ↓
      </p>
      <div style={{
        position: "relative",
        height: 140,
        border: "1px solid var(--line)",
        borderRadius: 8,
        background: "var(--surface-1)",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 4px 12px rgba(99,102,241,.4)"
        }} />
      </div>
    </div>
  )
}`,
      },
    },
  },
]

export const customHookIndex: Record<string, CustomHook> = Object.fromEntries(
  allCustomHooks.map((h) => [h.id, h])
)
