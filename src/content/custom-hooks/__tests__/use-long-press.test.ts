import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useLongPress } from "../use-long-press.fn"

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns the expected event handlers", () => {
    const { result } = renderHook(() => useLongPress(vi.fn()))
    expect(result.current).toHaveProperty("onMouseDown")
    expect(result.current).toHaveProperty("onMouseUp")
    expect(result.current).toHaveProperty("onMouseLeave")
    expect(result.current).toHaveProperty("onTouchStart")
    expect(result.current).toHaveProperty("onTouchEnd")
  })

  it("fires the callback after the default delay", () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback))
    act(() => result.current.onMouseDown())
    act(() => vi.advanceTimersByTime(500))
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("fires the callback after a custom delay", () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, { delay: 1000 }))
    act(() => result.current.onMouseDown())
    act(() => vi.advanceTimersByTime(999))
    expect(callback).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("does not fire the callback when released before the delay", () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback))
    act(() => result.current.onMouseDown())
    act(() => vi.advanceTimersByTime(300))
    act(() => result.current.onMouseUp())
    act(() => vi.advanceTimersByTime(200))
    expect(callback).not.toHaveBeenCalled()
  })

  it("calls onStart when pressing begins", () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useLongPress(vi.fn(), { onStart }))
    act(() => result.current.onMouseDown())
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it("calls onCancel when released before the delay", () => {
    const onCancel = vi.fn()
    const { result } = renderHook(() => useLongPress(vi.fn(), { onCancel }))
    act(() => result.current.onMouseDown())
    act(() => result.current.onMouseUp())
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("cancels on mouseleave before the delay", () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback))
    act(() => result.current.onMouseDown())
    act(() => result.current.onMouseLeave())
    act(() => vi.advanceTimersByTime(500))
    expect(callback).not.toHaveBeenCalled()
  })
})
