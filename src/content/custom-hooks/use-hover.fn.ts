import { useState, useRef, useEffect } from "react"

export function useHover<T extends HTMLElement>() {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const enter = () => setHovered(true)
    const leave = () => setHovered(false)

    el.addEventListener("mouseenter", enter)
    el.addEventListener("mouseleave", leave)
    return () => {
      el.removeEventListener("mouseenter", enter)
      el.removeEventListener("mouseleave", leave)
    }
  }, [])

  return [ref, hovered] as const
}
