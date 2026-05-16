import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useFetch } from "../use-fetch.fn"

function mockFetch(data: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  })
}

describe("useFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch({ id: 1, name: "test" }))
  })

  it("starts in the loading state", () => {
    // Use a never-resolving fetch so no async state update fires after the assertion
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})))
    const { result } = renderHook(() => useFetch("/api/test"))
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("resolves with data on a successful fetch", async () => {
    const { result } = renderHook(() => useFetch("/api/test"))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ id: 1, name: "test" })
    expect(result.current.error).toBeNull()
  })

  it("sets error when the response is not ok", async () => {
    vi.stubGlobal("fetch", mockFetch(null, false, 404))
    const { result } = renderHook(() => useFetch("/api/test"))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe("HTTP 404")
  })

  it("sets error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")))
    const { result } = renderHook(() => useFetch("/api/test"))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe("Network error")
  })

  it("resets to loading state when the url changes", async () => {
    const { result, rerender } = renderHook(({ url }) => useFetch(url), {
      initialProps: { url: "/api/first" },
    })
    // Wait for the first fetch to settle before changing the URL
    await waitFor(() => expect(result.current.loading).toBe(false))
    // Switch to a never-resolving fetch so the second request stays in loading
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})))
    rerender({ url: "/api/second" })
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
  })

  it("does not update state after unmount (cancelled fetch)", async () => {
    const { result, unmount } = renderHook(() => useFetch("/api/test"))
    unmount()
    // Wait a tick and verify no state update errors are thrown
    await new Promise((r) => setTimeout(r, 50))
    expect(result.current.loading).toBe(true)
  })
})
