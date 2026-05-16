import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, afterEach, vi } from "vitest"
import { useWindowSize } from "../use-window-size.fn"

describe("useWindowSize", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns the current window dimensions on mount", () => {
    vi.stubGlobal("innerWidth", 1024)
    vi.stubGlobal("innerHeight", 768)
    const { result } = renderHook(() => useWindowSize())
    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)
  })

  it("updates when the window is resized", () => {
    vi.stubGlobal("innerWidth", 800)
    vi.stubGlobal("innerHeight", 600)
    const { result } = renderHook(() => useWindowSize())
    expect(result.current.width).toBe(800)

    act(() => {
      vi.stubGlobal("innerWidth", 1280)
      vi.stubGlobal("innerHeight", 900)
      window.dispatchEvent(new Event("resize"))
    })

    expect(result.current.width).toBe(1280)
    expect(result.current.height).toBe(900)
  })

  it("removes the resize listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useWindowSize())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function))
  })
})
