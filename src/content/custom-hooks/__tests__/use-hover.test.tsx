import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import { useHover } from "../use-hover.fn"

function HoverTest() {
  const [ref, hovered] = useHover<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="el">
      {hovered ? "hovered" : "not-hovered"}
    </div>
  )
}

describe("useHover", () => {
  it("initializes with hovered = false", () => {
    render(<HoverTest />)
    expect(screen.getByTestId("el")).toHaveTextContent("not-hovered")
  })

  it("sets hovered to true on mouseenter", async () => {
    const user = userEvent.setup()
    render(<HoverTest />)
    await user.hover(screen.getByTestId("el"))
    expect(screen.getByTestId("el")).toHaveTextContent("hovered")
  })

  it("sets hovered to false on mouseleave", async () => {
    const user = userEvent.setup()
    render(<HoverTest />)
    await user.hover(screen.getByTestId("el"))
    expect(screen.getByTestId("el")).toHaveTextContent("hovered")
    await user.unhover(screen.getByTestId("el"))
    expect(screen.getByTestId("el")).toHaveTextContent("not-hovered")
  })
})
