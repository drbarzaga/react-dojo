import { useReducer, useCallback } from "react"

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
}
