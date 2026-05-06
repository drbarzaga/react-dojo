import type { CustomHook } from "@/content/custom-hooks/types"

export type { CustomHook, HookCategory } from "@/content/custom-hooks/types"

export const allCustomHooks: CustomHook[] = [
  {
    id: "useLocalStorage",
    label: "useLocalStorage",
    description:
      "Persists state to localStorage and keeps it in sync across renders. Handles JSON serialization automatically.",
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
  const [name, setName, removeName] = useLocalStorage("demo-name", "React Dev")
  const [count, setCount] = useLocalStorage("demo-count", 0)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 420 }}>
      <h2 style={{ marginBottom: 4 }}>useLocalStorage</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 24 }}>
        Values persist across page reloads. Open DevTools → Application → localStorage to see it.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Name</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            style={{ flex: 1 }}
          />
          <button onClick={removeName}>Clear</button>
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Persistent counter</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setCount((c) => c - 1)}>−</button>
          <span style={{ fontFamily: "monospace", fontSize: 20, minWidth: 32, textAlign: "center" }}>{count}</span>
          <button onClick={() => setCount((c) => c + 1)}>+</button>
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
      "Delays updating a value until a given time has passed without changes. Ideal for search inputs and live filters.",
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

const FRUITS = [
  "Apple", "Apricot", "Avocado", "Banana", "Blueberry",
  "Cherry", "Coconut", "Grape", "Kiwi", "Lemon",
  "Mango", "Orange", "Papaya", "Peach", "Pineapple",
  "Plum", "Raspberry", "Strawberry", "Watermelon",
]

export default function App() {
  const [query, setQuery] = useState("")
  const [callCount, setCallCount] = useState(0)
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    if (debouncedQuery) setCallCount((c) => c + 1)
  }, [debouncedQuery])

  const results = FRUITS.filter((f) =>
    f.toLowerCase().includes(debouncedQuery.toLowerCase())
  )

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useDebounce</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 16 }}>
        The search only fires 400ms after you stop typing.
      </p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search fruits..."
        style={{ width: "100%", marginBottom: 8 }}
      />
      <p style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 12 }}>
        Searches fired: <strong>{callCount}</strong> · Active query: <code>"{debouncedQuery}"</code>
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {results.map((fruit) => (
          <li key={fruit} style={{ padding: "6px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
            {fruit}
          </li>
        ))}
        {results.length === 0 && debouncedQuery && (
          <li style={{ color: "var(--fg-muted)", fontSize: 13 }}>No results for "{debouncedQuery}"</li>
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
      "Returns the value from the previous render. Useful for comparing old and new state or detecting direction of change.",
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
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)
  const direction = prevCount === undefined
    ? "—"
    : count > prevCount
    ? "↑ went up"
    : count < prevCount
    ? "↓ went down"
    : "= same"

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 340 }}>
      <h2 style={{ marginBottom: 4 }}>usePrevious</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 24 }}>
        Access the value from the previous render to compare changes.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => setCount((c) => c - 1)}>−</button>
        <span style={{ fontFamily: "monospace", fontSize: 28, minWidth: 40, textAlign: "center" }}>{count}</span>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </div>
      <table style={{ fontSize: 13, borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>Current value</td>
            <td style={{ fontFamily: "monospace", textAlign: "right" }}>{count}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>Previous value</td>
            <td style={{ fontFamily: "monospace", textAlign: "right" }}>{prevCount ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px 0", color: "var(--fg-muted)" }}>Direction</td>
            <td style={{ textAlign: "right" }}>{direction}</td>
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
      "Subscribes to a CSS media query and returns whether it currently matches. Updates reactively when the viewport changes.",
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
  const isWide = useMediaQuery("(min-width: 500px)")
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)")

  const row = (label, value) => (
    <tr key={label}>
      <td style={{ padding: "6px 0", color: "var(--fg-muted)", fontSize: 13 }}>{label}</td>
      <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
        <span style={{ color: value ? "#34d399" : "#f87171" }}>{value ? "true" : "false"}</span>
      </td>
    </tr>
  )

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useMediaQuery</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Resize the preview panel to see <code>isWide</code> change reactively.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {row("(min-width: 500px)", isWide)}
          {row("(prefers-color-scheme: dark)", prefersDark)}
          {row("(prefers-reduced-motion: reduce)", prefersReduced)}
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
      "Manages a boolean state with toggle, setTrue, and setFalse helpers. Reduces boilerplate for common on/off UI patterns.",
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
  const dark = useToggle(false)
  const muted = useToggle(true)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useToggle</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Three independent instances of the same hook.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>Modal</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={modal.setTrue} disabled={modal.value}>Open</button>
            <button onClick={modal.setFalse} disabled={!modal.value}>Close</button>
            <button onClick={modal.toggle}>Toggle</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>Dark theme</span>
          <button onClick={dark.toggle}>{dark.value ? "🌙 Dark" : "☀️ Light"}</button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>Sound</span>
          <button onClick={muted.toggle}>{muted.value ? "🔇 Muted" : "🔊 Active"}</button>
        </div>
      </div>

      {modal.value && (
        <div style={{
          marginTop: 20, padding: "16px", borderRadius: 8,
          border: "1px solid var(--line-strong)", background: "var(--surface-1)"
        }}>
          <strong style={{ fontSize: 14 }}>Modal is open</strong>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "8px 0" }}>
            Closed with setFalse(), not toggle() — more semantic.
          </p>
          <button onClick={modal.setFalse}>Close</button>
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
      "Calls a callback when the user clicks outside a referenced element. Great for closing dropdowns, modals, and popovers.",
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
  const [open, setOpen] = useState(false)
  const [closeCount, setCloseCount] = useState(0)

  const handleClose = useCallback(() => {
    if (open) {
      setOpen(false)
      setCloseCount((c) => c + 1)
    }
  }, [open])

  const ref = useClickOutside(handleClose)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 4 }}>useClickOutside</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Click the button to open the panel, then click outside to close it.
      </p>

      <button onClick={() => setOpen(true)} disabled={open}>
        Open panel
      </button>

      {open && (
        <div
          ref={ref}
          style={{
            marginTop: 12, padding: "16px", borderRadius: 8,
            border: "1px solid var(--line-strong)", background: "var(--surface-1)",
            maxWidth: 260
          }}
        >
          <strong style={{ fontSize: 14 }}>Panel is open</strong>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: "8px 0 0" }}>
            Click outside this panel to close it.
          </p>
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: "var(--fg-muted)" }}>
        Times closed by outside click: <strong>{closeCount}</strong>
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
      "Copies text to the clipboard and provides a transient 'copied' state that resets automatically after a configurable delay.",
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

const SNIPPETS = [
  { label: "Install", code: "npm install react" },
  { label: "Import hook", code: 'import { useClipboard } from "./useClipboard"' },
  { label: "Git clone", code: "git clone https://github.com/drbarzaga/react-dojo" },
]

export default function App() {
  const { copied, copy } = useClipboard(1500)
  const [lastCopied, setLastCopied] = useState(null)

  const handleCopy = (text, label) => {
    copy(text)
    setLastCopied(label)
  }

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useClipboard</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Click "Copy" to copy text to the clipboard.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SNIPPETS.map(({ label, code }) => (
          <div
            key={label}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              gap: 12, padding: "10px 12px", borderRadius: 6,
              border: "1px solid var(--line)", background: "var(--surface-1)"
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 2 }}>{label}</div>
              <code style={{ fontSize: 12, wordBreak: "break-all" }}>{code}</code>
            </div>
            <button
              onClick={() => handleCopy(code, label)}
              style={{ flexShrink: 0, fontSize: 12 }}
            >
              {copied && lastCopied === label ? "✓ Copied" : "Copy"}
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
      "Tracks the viewport dimensions and updates reactively whenever the user resizes the window.",
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

function Bar({ value, max, color, label }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: "var(--fg-muted)" }}>{label}</span>
        <span style={{ fontFamily: "monospace" }}>{value}px</span>
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
        Resize the preview panel to see the values update in real time.
      </p>

      <Bar value={width} max={1920} color="#60a5fa" label="Width" />
      <Bar value={height} max={1080} color="#34d399" label="Height" />

      <div style={{
        marginTop: 8, padding: "10px 14px", borderRadius: 6,
        border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Current breakpoint</span>
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
      "Declarative wrapper around setInterval that always syncs the latest callback without manual cleanup.",
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
        Delay is <code>null</code> when paused — the interval unmounts automatically.
      </p>

      <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 36, letterSpacing: 2, marginBottom: 20 }}>
        {formatTime(elapsed)}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
        <button onClick={() => setRunning((r) => !r)} style={{ minWidth: 80 }}>
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={lap} disabled={!running}>Lap</button>
        <button onClick={reset}>Reset</button>
      </div>

      {laps.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {laps.map((t, i) => (
            <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, borderBottom: "1px solid var(--line)" }}>
              <span style={{ color: "var(--fg-muted)" }}>Lap {laps.length - i}</span>
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
      "Encapsulates fetch logic with loading, data, and error states. Automatically cancels the request if the component unmounts.",
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
  { label: "Users", url: "https://jsonplaceholder.typicode.com/users?_limit=4" },
  { label: "Invalid URL (error)", url: "https://jsonplaceholder.typicode.com/invalid-404" },
]

export default function App() {
  const [endpointIdx, setEndpointIdx] = useState(0)
  const { url } = ENDPOINTS[endpointIdx]
  const { data, loading, error } = useFetch(url)

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useFetch</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 16 }}>
        Switch endpoints to see loading states and error handling.
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
        <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>Loading…</div>
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
      "Detects whether the cursor is over a referenced element. Returns a ref and a boolean that updates on mouseenter/mouseleave.",
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

function HoverCard({ title, description, color }) {
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
      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: hovered ? "var(--fg)" : "var(--fg-muted)", transition: "color 160ms" }}>
        {hovered ? "Hovering! 🎯" : description}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 360 }}>
      <h2 style={{ marginBottom: 4 }}>useHover</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Hover over each card — each one has its own hook instance.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <HoverCard title="useLocalStorage" description="Persists state to localStorage" color="#60a5fa" />
        <HoverCard title="useDebounce" description="Delays value updates" color="#34d399" />
        <HoverCard title="useToggle" description="Toggles a boolean state" color="#f59e0b" />
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
      "Attaches event listeners declaratively, always keeps the latest callback, and cleans up automatically on unmount.",
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
  const [lastKey, setLastKey] = useState(null)
  const [history, setHistory] = useState([])
  const [clicks, setClicks] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEventListener("keydown", (e) => {
    if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return
    const key = e.key === " " ? "Space" : e.key
    setLastKey(key)
    setHistory((h) => [key, ...h].slice(0, 8))
  })

  useEventListener("click", () => setClicks((c) => c + 1))

  useEventListener("mousemove", (e) => setPos({ x: e.clientX, y: e.clientY }))

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 380 }}>
      <h2 style={{ marginBottom: 4 }}>useEventListener</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Click, move the cursor, and press keys to see events firing.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6 }}>keydown</div>
          <div style={{ fontFamily: "monospace", fontSize: 22, minHeight: 30 }}>
            {lastKey ?? "—"}
          </div>
        </div>
        <div style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6 }}>click</div>
          <div style={{ fontFamily: "monospace", fontSize: 22 }}>{clicks}</div>
        </div>
      </div>

      <div style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: 6, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>mousemove</div>
        <div style={{ fontFamily: "monospace", fontSize: 13 }}>x: {pos.x} · y: {pos.y}</div>
      </div>

      {history.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {history.map((k, i) => (
            <span key={i} style={{
              fontFamily: "monospace", fontSize: 11,
              padding: "2px 8px", borderRadius: 4,
              background: "var(--surface-2)", color: "var(--fg-muted)",
              opacity: 1 - i * 0.1
            }}>{k}</span>
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
      "Observes whether an element is visible in the viewport (or a scrollable container). Returns a ref, the full observer entry, and an isIntersecting boolean.",
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

function Item({ index, root }) {
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
        <div style={{ fontSize: 13, fontWeight: 600 }}>Item {index + 1}</div>
        <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
          {isIntersecting ? "✓ Visible in viewport" : "Outside viewport"}
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
        Scroll inside the container to see items activate.
      </p>
      <div
        ref={setScrollEl}
        style={{
          height: 280,
          overflowY: "auto",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: "10px",
        }}
      >
        {scrollEl && Array.from({ length: 8 }, (_, i) => (
          <Item key={i} index={i} root={scrollEl} />
        ))}
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
