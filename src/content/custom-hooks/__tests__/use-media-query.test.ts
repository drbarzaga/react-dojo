import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, afterEach, vi } from "vitest"
import { useMediaQuery } from "../use-media-query.fn"

function createMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  return vi.fn().mockReturnValue({
    matches,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb)
      if (idx !== -1) listeners.splice(idx, 1)
    },
    dispatchChange: (nextMatches: boolean) => {
      listeners.forEach((cb) => cb({ matches: nextMatches } as MediaQueryListEvent))
    },
  })
}

describe("useMediaQuery", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns false initially when the query does not match", () => {
    const matchMedia = createMatchMedia(false)
    vi.stubGlobal("matchMedia", matchMedia)
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"))
    expect(result.current).toBe(false)
  })

  it("returns true initially when the query matches", () => {
    const matchMedia = createMatchMedia(true)
    vi.stubGlobal("matchMedia", matchMedia)
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"))
    expect(result.current).toBe(true)
  })

  it("updates to true when the media query changes to matching", () => {
    const matchMedia = createMatchMedia(false)
    vi.stubGlobal("matchMedia", matchMedia)
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"))
    expect(result.current).toBe(false)
    act(() => matchMedia.mock.results[0].value.dispatchChange(true))
    expect(result.current).toBe(true)
  })

  it("updates to false when the media query changes to non-matching", () => {
    const matchMedia = createMatchMedia(true)
    vi.stubGlobal("matchMedia", matchMedia)
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"))
    expect(result.current).toBe(true)
    act(() => matchMedia.mock.results[0].value.dispatchChange(false))
    expect(result.current).toBe(false)
  })
})
