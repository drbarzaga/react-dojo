import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useIdle } from "../use-idle.fn"

describe("useIdle", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("starts as not idle", () => {
    const { result } = renderHook(() => useIdle(1000))
    expect(result.current).toBe(false)
  })

  it("becomes idle after the timeout", () => {
    const { result } = renderHook(() => useIdle(1000))
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current).toBe(true)
  })

  it("does not become idle before the timeout", () => {
    const { result } = renderHook(() => useIdle(1000))
    act(() => vi.advanceTimersByTime(999))
    expect(result.current).toBe(false)
  })

  it("resets idle state when a user event fires", () => {
    const { result } = renderHook(() => useIdle(1000))
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new Event("mousemove"))
    })
    expect(result.current).toBe(false)
  })

  it("resets the timer when a user event fires before timeout", () => {
    const { result } = renderHook(() => useIdle(1000))
    act(() => vi.advanceTimersByTime(800))
    act(() => {
      window.dispatchEvent(new Event("keydown"))
    })
    act(() => vi.advanceTimersByTime(800))
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe(true)
  })

  it("cleans up event listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useIdle(1000))
    unmount()
    expect(removeSpy).toHaveBeenCalled()
  })
})
