import { render, screen, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useResizeObserver } from "../use-resize-observer.fn"

type ObserverCallback = (entries: ResizeObserverEntry[]) => void

let observerCallback: ObserverCallback | null = null
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

function setupMockObserver() {
  class MockResizeObserver {
    constructor(cb: ObserverCallback) {
      observerCallback = cb
    }
    observe = mockObserve
    disconnect = mockDisconnect
  }
  vi.stubGlobal("ResizeObserver", MockResizeObserver)
}

function fakeEntry(width: number, height: number): ResizeObserverEntry {
  return { contentRect: { width, height } } as ResizeObserverEntry
}

function TestComponent() {
  const { ref, width, height } = useResizeObserver<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="el">
      {width}x{height}
    </div>
  )
}

describe("useResizeObserver", () => {
  beforeEach(() => {
    observerCallback = null
    mockObserve.mockClear()
    mockDisconnect.mockClear()
    setupMockObserver()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("initializes with width and height at 0", () => {
    render(<TestComponent />)
    expect(screen.getByTestId("el")).toHaveTextContent("0x0")
  })

  it("calls observe on the ref element", () => {
    render(<TestComponent />)
    expect(mockObserve).toHaveBeenCalledWith(screen.getByTestId("el"))
  })

  it("updates width and height when the element resizes", () => {
    render(<TestComponent />)
    act(() => observerCallback!([fakeEntry(320, 200)]))
    expect(screen.getByTestId("el")).toHaveTextContent("320x200")
  })

  it("updates again on subsequent resize events", () => {
    render(<TestComponent />)
    act(() => observerCallback!([fakeEntry(320, 200)]))
    act(() => observerCallback!([fakeEntry(480, 300)]))
    expect(screen.getByTestId("el")).toHaveTextContent("480x300")
  })

  it("calls disconnect on unmount", () => {
    const { unmount } = render(<TestComponent />)
    unmount()
    expect(mockDisconnect).toHaveBeenCalledTimes(1)
  })
})
