import { useState, useEffect, type RefObject } from "react"

interface ScrollPosition {
  x: number
  y: number
}

export function useScrollPosition(elementRef?: RefObject<HTMLElement>): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 })

  useEffect(() => {
    const target: HTMLElement | Window = elementRef?.current ?? window

    function handleScroll() {
      if (elementRef?.current) {
        setPosition({ x: elementRef.current.scrollLeft, y: elementRef.current.scrollTop })
      } else {
        setPosition({ x: window.scrollX, y: window.scrollY })
      }
    }

    target.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => target.removeEventListener("scroll", handleScroll)
  }, [elementRef])

  return position
}
