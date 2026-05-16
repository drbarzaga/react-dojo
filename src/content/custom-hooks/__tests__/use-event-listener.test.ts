import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { useEventListener } from "../use-event-listener.fn"

describe("useEventListener", () => {
  it("calls the handler when the event fires on window", () => {
    const handler = vi.fn()
    renderHook(() => useEventListener("click", handler))
    window.dispatchEvent(new MouseEvent("click"))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("calls the handler when the event fires on a custom element", () => {
    const handler = vi.fn()
    const el = document.createElement("div")
    document.body.appendChild(el)
    renderHook(() => useEventListener("click", handler, el))
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(handler).toHaveBeenCalledTimes(1)
    document.body.removeChild(el)
  })

  it("always calls the latest handler (avoids stale closures)", () => {
    let result = ""
    const { rerender } = renderHook(({ h }) => useEventListener("click", h), {
      initialProps: {
        h: () => {
          result = "first"
        },
      },
    })
    rerender({
      h: () => {
        result = "second"
      },
    })
    window.dispatchEvent(new MouseEvent("click"))
    expect(result).toBe("second")
  })

  it("removes the listener on unmount", () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useEventListener("click", handler))
    unmount()
    window.dispatchEvent(new MouseEvent("click"))
    expect(handler).not.toHaveBeenCalled()
  })

  it("does not throw when element has no addEventListener", () => {
    const handler = vi.fn()
    expect(() =>
      renderHook(() => useEventListener("click", handler, {} as EventTarget))
    ).not.toThrow()
  })
})
