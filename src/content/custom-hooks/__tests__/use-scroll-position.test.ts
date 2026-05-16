import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, afterEach, vi } from "vitest"
import { useScrollPosition } from "../use-scroll-position.fn"

describe("useScrollPosition", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("initializes with { x: 0, y: 0 } when window has not been scrolled", () => {
    vi.stubGlobal("scrollX", 0)
    vi.stubGlobal("scrollY", 0)
    const { result } = renderHook(() => useScrollPosition())
    expect(result.current).toEqual({ x: 0, y: 0 })
  })

  it("reads the current window scroll position on mount", () => {
    vi.stubGlobal("scrollX", 50)
    vi.stubGlobal("scrollY", 120)
    const { result } = renderHook(() => useScrollPosition())
    expect(result.current).toEqual({ x: 50, y: 120 })
  })

  it("updates when window is scrolled", () => {
    vi.stubGlobal("scrollX", 0)
    vi.stubGlobal("scrollY", 0)
    const { result } = renderHook(() => useScrollPosition())

    act(() => {
      vi.stubGlobal("scrollX", 100)
      vi.stubGlobal("scrollY", 200)
      window.dispatchEvent(new Event("scroll"))
    })

    expect(result.current).toEqual({ x: 100, y: 200 })
  })

  it("tracks scroll on a custom element ref", () => {
    const el = document.createElement("div")
    Object.defineProperty(el, "scrollLeft", { value: 30, writable: true })
    Object.defineProperty(el, "scrollTop", { value: 60, writable: true })
    document.body.appendChild(el)

    const ref = { current: el }
    const { result } = renderHook(() => useScrollPosition(ref))
    expect(result.current).toEqual({ x: 30, y: 60 })

    act(() => {
      Object.defineProperty(el, "scrollLeft", { value: 50, writable: true })
      Object.defineProperty(el, "scrollTop", { value: 90, writable: true })
      el.dispatchEvent(new Event("scroll"))
    })

    expect(result.current).toEqual({ x: 50, y: 90 })
    document.body.removeChild(el)
  })

  it("removes the scroll listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useScrollPosition())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function))
  })
})
