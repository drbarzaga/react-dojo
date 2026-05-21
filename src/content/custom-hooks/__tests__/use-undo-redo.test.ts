import { renderHook, act } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useUndoRedo } from "../use-undo-redo.fn"

describe("useUndoRedo", () => {
  it("initializes with the given state", () => {
    const { result } = renderHook(() => useUndoRedo(0))
    expect(result.current.state).toBe(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.history).toEqual([])
    expect(result.current.future).toEqual([])
  })

  it("set pushes present to history and updates state", () => {
    const { result } = renderHook(() => useUndoRedo(0))
    act(() => result.current.set(1))
    expect(result.current.state).toBe(1)
    expect(result.current.history).toEqual([0])
    expect(result.current.canUndo).toBe(true)
  })

  it("undo restores previous state", () => {
    const { result } = renderHook(() => useUndoRedo(0))
    act(() => result.current.set(1))
    act(() => result.current.set(2))
    act(() => result.current.undo())
    expect(result.current.state).toBe(1)
    expect(result.current.history).toEqual([0])
    expect(result.current.future).toEqual([2])
  })

  it("redo reapplies an undone state", () => {
    const { result } = renderHook(() => useUndoRedo(0))
    act(() => result.current.set(1))
    act(() => result.current.undo())
    act(() => result.current.redo())
    expect(result.current.state).toBe(1)
    expect(result.current.canRedo).toBe(false)
  })

  it("set after undo clears future", () => {
    const { result } = renderHook(() => useUndoRedo(0))
    act(() => result.current.set(1))
    act(() => result.current.set(2))
    act(() => result.current.undo())
    act(() => result.current.set(3))
    expect(result.current.future).toEqual([])
    expect(result.current.canRedo).toBe(false)
    expect(result.current.state).toBe(3)
  })

  it("undo is a no-op when there is no history", () => {
    const { result } = renderHook(() => useUndoRedo("a"))
    act(() => result.current.undo())
    expect(result.current.state).toBe("a")
  })

  it("redo is a no-op when there is no future", () => {
    const { result } = renderHook(() => useUndoRedo("a"))
    act(() => result.current.set("b"))
    act(() => result.current.redo())
    expect(result.current.state).toBe("b")
  })

  it("clear removes history and future but keeps present", () => {
    const { result } = renderHook(() => useUndoRedo(0))
    act(() => result.current.set(1))
    act(() => result.current.set(2))
    act(() => result.current.undo())
    act(() => result.current.clear())
    expect(result.current.state).toBe(1)
    expect(result.current.history).toEqual([])
    expect(result.current.future).toEqual([])
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it("respects maxHistory limit", () => {
    const { result } = renderHook(() => useUndoRedo(0, 3))
    act(() => result.current.set(1))
    act(() => result.current.set(2))
    act(() => result.current.set(3))
    act(() => result.current.set(4))
    expect(result.current.history).toHaveLength(3)
    expect(result.current.history).toEqual([1, 2, 3])
  })

  it("works with object states", () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }))
    act(() => result.current.set({ count: 1 }))
    act(() => result.current.set({ count: 2 }))
    act(() => result.current.undo())
    expect(result.current.state).toEqual({ count: 1 })
  })

  it("supports multiple undos in sequence", () => {
    const { result } = renderHook(() => useUndoRedo(0))
    act(() => result.current.set(1))
    act(() => result.current.set(2))
    act(() => result.current.set(3))
    act(() => result.current.undo())
    act(() => result.current.undo())
    expect(result.current.state).toBe(1)
    expect(result.current.future).toEqual([2, 3])
  })
})
