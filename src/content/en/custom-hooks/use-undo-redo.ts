import type { CustomHook } from "@/content/custom-hooks/types"

export const useUndoRedo: CustomHook = {
  id: "useUndoRedo",
  label: "useUndoRedo",
  description:
    "Manages a state history with full undo and redo support using useReducer under the hood.",
  category: "state",
  code: `import { useReducer, useCallback } from "react"

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

type HistoryAction<T> =
  | { type: "SET"; value: T; limit: number }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR" }

function historyReducer<T>(state: HistoryState<T>, action: HistoryAction<T>): HistoryState<T> {
  switch (action.type) {
    case "SET": {
      const past = [...state.past, state.present]
      return {
        past: action.limit > 0 ? past.slice(-action.limit) : past,
        present: action.value,
        future: [],
      }
    }
    case "UNDO": {
      if (state.past.length === 0) return state
      const prev = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future],
      }
    }
    case "REDO": {
      if (state.future.length === 0) return state
      const [next, ...rest] = state.future
      return {
        past: [...state.past, state.present],
        present: next,
        future: rest,
      }
    }
    case "CLEAR":
      return { past: [], present: state.present, future: [] }
  }
}

export interface UseUndoRedoReturn<T> {
  state: T
  set: (value: T) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  history: T[]
  future: T[]
  clear: () => void
}

export function useUndoRedo<T>(initialState: T, maxHistory = 100): UseUndoRedoReturn<T> {
  const [{ past, present, future }, dispatch] = useReducer(
    historyReducer as (state: HistoryState<T>, action: HistoryAction<T>) => HistoryState<T>,
    { past: [], present: initialState, future: [] }
  )

  const set = useCallback(
    (value: T) => dispatch({ type: "SET", value, limit: maxHistory }),
    [maxHistory]
  )
  const undo = useCallback(() => dispatch({ type: "UNDO" }), [])
  const redo = useCallback(() => dispatch({ type: "REDO" }), [])
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), [])

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    history: past,
    future,
    clear,
  }
}`,
  playground: {
    files: {
      "/App.js": `import { useReducer, useCallback } from "react"

function historyReducer(state, action) {
  switch (action.type) {
    case "SET": {
      const past = [...state.past, state.present]
      return {
        past: action.limit > 0 ? past.slice(-action.limit) : past,
        present: action.value,
        future: [],
      }
    }
    case "UNDO": {
      if (state.past.length === 0) return state
      const prev = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future],
      }
    }
    case "REDO": {
      if (state.future.length === 0) return state
      const [next, ...rest] = state.future
      return {
        past: [...state.past, state.present],
        present: next,
        future: rest,
      }
    }
    case "CLEAR":
      return { past: [], present: state.present, future: [] }
  }
}

function useUndoRedo(initialState, maxHistory = 100) {
  const [{ past, present, future }, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
  })

  const set = useCallback(
    (value) => dispatch({ type: "SET", value, limit: maxHistory }),
    [maxHistory]
  )
  const undo = useCallback(() => dispatch({ type: "UNDO" }), [])
  const redo = useCallback(() => dispatch({ type: "REDO" }), [])
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), [])

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    history: past,
    future,
    clear,
  }
}

const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ec4899","#6b7280"]

export default function App() {
  const { state: color, set, undo, redo, canUndo, canRedo, history, future, clear } = useUndoRedo("#3b82f6")

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: 400 }}>
      <h2 style={{ marginBottom: 4 }}>useUndoRedo</h2>
      <p style={{ color: "var(--fg-muted)", fontSize: 13, marginBottom: 20 }}>
        Pick a color. Use Undo and Redo to navigate the history.
      </p>

      <div
        style={{
          width: "100%", height: 80, borderRadius: 8,
          background: color, marginBottom: 16,
          transition: "background 0.2s",
          border: "1px solid var(--line)",
        }}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => set(c)}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: c, border: c === color ? "3px solid var(--fg)" : "2px solid transparent",
              cursor: "pointer", padding: 0,
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={undo} disabled={!canUndo}>← Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo →</button>
        <button onClick={clear} disabled={!canUndo && !canRedo} style={{ marginLeft: "auto" }}>
          Clear history
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--fg-muted)" }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            History ({history.length})
          </div>
          {history.length === 0 ? (
            <div>—</div>
          ) : (
            [...history].reverse().map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: c, display: "inline-block",
                  border: "1px solid var(--line)",
                }} />
                <span>{c}</span>
              </div>
            ))
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Future ({future.length})
          </div>
          {future.length === 0 ? (
            <div>—</div>
          ) : (
            future.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: c, display: "inline-block",
                  border: "1px solid var(--line)",
                }} />
                <span>{c}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}`,
    },
  },
}
