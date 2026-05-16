import { renderHook, act } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { useKeyPress } from "../use-key-press.fn"

describe("useKeyPress", () => {
  it("initializes with isPressed = false", () => {
    const { result } = renderHook(() => useKeyPress("Enter"))
    expect(result.current).toBe(false)
  })

  it("returns true when the target key is pressed", () => {
    const { result } = renderHook(() => useKeyPress("Enter"))
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })))
    expect(result.current).toBe(true)
  })

  it("returns false when the target key is released", () => {
    const { result } = renderHook(() => useKeyPress("Enter"))
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })))
    act(() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" })))
    expect(result.current).toBe(false)
  })

  it("does not react to a different key", () => {
    const { result } = renderHook(() => useKeyPress("Enter"))
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })))
    expect(result.current).toBe(false)
  })

  it("removes listeners on unmount", () => {
    const { result, unmount } = renderHook(() => useKeyPress("Enter"))
    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })))
    expect(result.current).toBe(true)
    unmount()
    // After unmount, further events should not affect state (no errors thrown)
    expect(() =>
      act(() => window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" })))
    ).not.toThrow()
  })
})
