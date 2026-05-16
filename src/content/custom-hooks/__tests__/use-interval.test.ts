import { renderHook } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useInterval } from "../use-interval.fn"

describe("useInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calls the callback after each interval", () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000))
    expect(callback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(2000)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it("does not fire when delay is null", () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, null))
    vi.advanceTimersByTime(5000)
    expect(callback).not.toHaveBeenCalled()
  })

  it("stops firing when delay changes to null", () => {
    const callback = vi.fn()
    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 as number | null },
    })
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
    rerender({ delay: null })
    vi.advanceTimersByTime(3000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("resumes firing when delay changes from null to a number", () => {
    const callback = vi.fn()
    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: null as number | null },
    })
    vi.advanceTimersByTime(2000)
    expect(callback).not.toHaveBeenCalled()
    rerender({ delay: 500 })
    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it("always calls the latest callback (avoids stale closures)", () => {
    let count = 0
    const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
      initialProps: {
        cb: () => {
          count++
        },
      },
    })
    rerender({
      cb: () => {
        count += 10
      },
    })
    vi.advanceTimersByTime(1000)
    expect(count).toBe(10)
  })
})
