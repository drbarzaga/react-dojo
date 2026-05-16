import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useDebounce } from "../use-debounce.fn"

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500))
    expect(result.current).toBe("initial")
  })

  it("does not update the value before the delay has passed", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "first" },
    })
    rerender({ value: "second" })
    act(() => vi.advanceTimersByTime(499))
    expect(result.current).toBe("first")
  })

  it("updates the value after the delay has passed", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "first" },
    })
    rerender({ value: "second" })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe("second")
  })

  it("resets the timer when the value changes before the delay expires", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "first" },
    })
    rerender({ value: "second" })
    act(() => vi.advanceTimersByTime(300))
    rerender({ value: "third" })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe("first")
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe("third")
  })

  it("works with number values", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 0 },
    })
    rerender({ value: 42 })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(42)
  })
})
