import { useState, useEffect, useCallback, useRef } from "react"

export function useIdle(timeout: number = 3000): boolean {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setIsIdle(true), timeout)
  }, [timeout])

  const resetTimer = useCallback(() => {
    setIsIdle((current) => (current ? false : current))
    startTimer()
  }, [startTimer])

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"]

    events.forEach((event) => window.addEventListener(event, resetTimer))
    startTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [resetTimer, startTimer])

  return isIdle
}
