import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useOnlineStatus } from "../use-online-status.fn"

describe("useOnlineStatus", () => {
  beforeEach(() => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
  })

  it("returns true when navigator.onLine is true", () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
  })

  it("returns false when navigator.onLine is false", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
  })

  it("updates to false when the offline event is fired", () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false)
    act(() => window.dispatchEvent(new Event("offline")))
    expect(result.current).toBe(false)
  })

  it("updates to true when the online event is fired", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
    act(() => window.dispatchEvent(new Event("online")))
    expect(result.current).toBe(true)
  })
})
