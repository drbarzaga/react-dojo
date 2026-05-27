import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest"
import { useGitHubStars } from "../use-github-stars.fn"

function mockFetch(data: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  })
}

const REPO = "facebook/react"
const STARS_DATA = { stargazers_count: 230000 }

describe("useGitHubStars", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch(STARS_DATA))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("starts in the loading state", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})))
    const { result } = renderHook(() => useGitHubStars(REPO))
    expect(result.current.loading).toBe(true)
    expect(result.current.stars).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("resolves with star count on success", async () => {
    const { result } = renderHook(() => useGitHubStars(REPO))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.stars).toBe(230000)
    expect(result.current.error).toBeNull()
  })

  it("sets error on non-ok response", async () => {
    vi.stubGlobal("fetch", mockFetch(null, false, 404))
    const { result } = renderHook(() => useGitHubStars(REPO))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.stars).toBeNull()
    expect(result.current.error).toBe("HTTP 404")
  })

  it("sets error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")))
    const { result } = renderHook(() => useGitHubStars(REPO))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.stars).toBeNull()
    expect(result.current.error).toBe("Network error")
  })

  it("resets to loading state when repo changes", async () => {
    const { result, rerender } = renderHook(({ repo }) => useGitHubStars(repo), {
      initialProps: { repo: REPO },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})))
    rerender({ repo: "vercel/next.js" })
    expect(result.current.loading).toBe(true)
    expect(result.current.stars).toBeNull()
  })

  it("does not update state after unmount", async () => {
    const { result, unmount } = renderHook(() => useGitHubStars(REPO))
    unmount()
    await new Promise((r) => setTimeout(r, 50))
    expect(result.current.loading).toBe(true)
  })
})
