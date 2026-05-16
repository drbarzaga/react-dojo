import { useState, useEffect } from "react"

export function useKeyPress(targetKey: string): boolean {
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    const handleDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) setIsPressed(true)
    }
    const handleUp = (event: KeyboardEvent) => {
      if (event.key === targetKey) setIsPressed(false)
    }

    window.addEventListener("keydown", handleDown)
    window.addEventListener("keyup", handleUp)
    return () => {
      window.removeEventListener("keydown", handleDown)
      window.removeEventListener("keyup", handleUp)
    }
  }, [targetKey])

  return isPressed
}
