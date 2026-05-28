import type { TypeScriptRecipe } from "@/content/typescript-recipes/types"

export const typingRefs: TypeScriptRecipe = {
  id: "typing-refs",
  label: "Typing useRef",
  description:
    "useRef has two uses: referencing a DOM element or storing a mutable value. Each case has its own correct type.",
  category: "hooks",
  code: `import { useRef, useEffect } from "react"

// ── Case 1: reference to a DOM element ──────────────────
// Initialize with null. The type includes null because the element
// doesn't exist until the component mounts.
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus() // ?. because it may be null
  }, [])

  return <input ref={inputRef} />
}

// ── Case 2: mutable value (not DOM) ─────────────────────
// Initialize with the value. No null needed because the value
// exists from the first render.
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

// ── Most common DOM element types ───────────────────────
const divRef    = useRef<HTMLDivElement>(null)
const inputRef  = useRef<HTMLInputElement>(null)
const formRef   = useRef<HTMLFormElement>(null)
const canvasRef = useRef<HTMLCanvasElement>(null)`,
  do: `// ✓ null initial value for DOM refs — element doesn't exist yet
const inputRef = useRef<HTMLInputElement>(null)

// Safe access with optional chaining
inputRef.current?.focus()`,
  dont: `// ✗ Forcing non-null with ! is dangerous
const inputRef = useRef<HTMLInputElement>(null)

// If the component hasn't mounted, this throws at runtime
inputRef.current!.focus()`,
  playground: { files: {} },
}
