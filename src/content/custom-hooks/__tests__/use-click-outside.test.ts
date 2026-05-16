import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { useClickOutside } from "../use-click-outside.fn"

describe("useClickOutside", () => {
  it("returns a ref object", () => {
    const { result } = renderHook(() => useClickOutside(vi.fn()))
    expect(result.current).toHaveProperty("current")
  })

  it("calls the callback when clicking outside the ref element", () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback))

    const inner = document.createElement("div")
    const outer = document.createElement("div")
    document.body.appendChild(outer)
    document.body.appendChild(inner)
    Object.defineProperty(result.current, "current", { value: inner, writable: true })

    outer.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    expect(callback).toHaveBeenCalledTimes(1)

    document.body.removeChild(inner)
    document.body.removeChild(outer)
  })

  it("does not call the callback when clicking inside the ref element", () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(callback))

    const inner = document.createElement("div")
    document.body.appendChild(inner)
    Object.defineProperty(result.current, "current", { value: inner, writable: true })

    inner.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    expect(callback).not.toHaveBeenCalled()

    document.body.removeChild(inner)
  })

  it("removes the event listener on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener")
    const { unmount } = renderHook(() => useClickOutside(vi.fn()))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function))
    removeSpy.mockRestore()
  })
})
