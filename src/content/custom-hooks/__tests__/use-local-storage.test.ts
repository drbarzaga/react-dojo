import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"
import { useLocalStorage } from "../use-local-storage.fn"

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("initializes with initialValue when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("key", "default"))
    expect(result.current[0]).toBe("default")
  })

  it("reads an existing value from localStorage on mount", () => {
    localStorage.setItem("key", JSON.stringify("persisted"))
    const { result } = renderHook(() => useLocalStorage("key", "default"))
    expect(result.current[0]).toBe("persisted")
  })

  it("setValue updates the state and writes to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("key", "initial"))
    act(() => result.current[1]("updated"))
    expect(result.current[0]).toBe("updated")
    expect(JSON.parse(localStorage.getItem("key")!)).toBe("updated")
  })

  it("setValue accepts a function updater", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0))
    act(() => result.current[1]((prev) => prev + 1))
    expect(result.current[0]).toBe(1)
    expect(JSON.parse(localStorage.getItem("count")!)).toBe(1)
  })

  it("removeValue resets to initialValue and removes the key from localStorage", () => {
    localStorage.setItem("key", JSON.stringify("persisted"))
    const { result } = renderHook(() => useLocalStorage("key", "default"))
    act(() => result.current[2]())
    expect(result.current[0]).toBe("default")
    expect(localStorage.getItem("key")).toBeNull()
  })

  it("returns initialValue when the stored JSON is invalid", () => {
    localStorage.setItem("key", "not-valid-json{{{")
    const { result } = renderHook(() => useLocalStorage("key", "fallback"))
    expect(result.current[0]).toBe("fallback")
  })

  it("works with object values", () => {
    const initial = { name: "React", version: 19 }
    const { result } = renderHook(() => useLocalStorage("obj", initial))
    act(() => result.current[1]({ name: "Next.js", version: 15 }))
    expect(result.current[0]).toEqual({ name: "Next.js", version: 15 })
    expect(JSON.parse(localStorage.getItem("obj")!)).toEqual({ name: "Next.js", version: 15 })
  })
})
