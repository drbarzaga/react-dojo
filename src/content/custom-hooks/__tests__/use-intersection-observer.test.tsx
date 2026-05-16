import { render, screen, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useIntersectionObserver } from "../use-intersection-observer.fn"

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void

let observerCallback: ObserverCallback | null = null
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

function setupMockObserver() {
  class MockIntersectionObserver {
    constructor(cb: ObserverCallback) {
      observerCallback = cb
    }
    observe = mockObserve
    disconnect = mockDisconnect
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
}

function fakeEntry(isIntersecting: boolean): IntersectionObserverEntry {
  return { isIntersecting } as IntersectionObserverEntry
}

function TestComponent({ options = {} }: { options?: object }) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>(options)
  return (
    <div ref={ref} data-testid="el">
      {isIntersecting ? "visible" : "hidden"}
    </div>
  )
}

describe("useIntersectionObserver", () => {
  beforeEach(() => {
    observerCallback = null
    mockObserve.mockClear()
    mockDisconnect.mockClear()
    setupMockObserver()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("initializes with isIntersecting = false", () => {
    render(<TestComponent />)
    expect(screen.getByTestId("el")).toHaveTextContent("hidden")
  })

  it("calls observe on the ref element", () => {
    render(<TestComponent />)
    expect(mockObserve).toHaveBeenCalledWith(screen.getByTestId("el"))
  })

  it("updates isIntersecting to true when the element enters the viewport", () => {
    render(<TestComponent />)
    act(() => observerCallback!([fakeEntry(true)]))
    expect(screen.getByTestId("el")).toHaveTextContent("visible")
  })

  it("updates isIntersecting to false when the element leaves the viewport", () => {
    render(<TestComponent />)
    act(() => observerCallback!([fakeEntry(true)]))
    act(() => observerCallback!([fakeEntry(false)]))
    expect(screen.getByTestId("el")).toHaveTextContent("hidden")
  })

  it("calls disconnect on unmount", () => {
    const { unmount } = render(<TestComponent />)
    unmount()
    expect(mockDisconnect).toHaveBeenCalledTimes(1)
  })
})
