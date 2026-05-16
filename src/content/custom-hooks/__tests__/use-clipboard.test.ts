import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useClipboard } from "../use-clipboard.fn"

describe("useClipboard", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("initializes with copied = false", () => {
    const { result } = renderHook(() => useClipboard())
    expect(result.current.copied).toBe(false)
  })

  it("sets copied to true after a successful copy", async () => {
    const { result } = renderHook(() => useClipboard())
    await act(async () => {
      await result.current.copy("hello")
    })
    expect(result.current.copied).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello")
  })

  it("resets copied to false after the reset interval", async () => {
    const { result } = renderHook(() => useClipboard(1000))
    await act(async () => {
      await result.current.copy("hello")
    })
    expect(result.current.copied).toBe(true)
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.copied).toBe(false)
  })

  it("does not reset copied before the interval expires", async () => {
    const { result } = renderHook(() => useClipboard(1000))
    await act(async () => {
      await result.current.copy("hello")
    })
    act(() => vi.advanceTimersByTime(999))
    expect(result.current.copied).toBe(true)
  })

  it("sets copied to false when the clipboard write fails", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error("denied"))
    const { result } = renderHook(() => useClipboard())
    await act(async () => {
      await result.current.copy("hello")
    })
    expect(result.current.copied).toBe(false)
  })
})
