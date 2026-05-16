import { useCallback, useRef } from "react"

interface UseLongPressOptions {
  delay?: number
  onStart?: () => void
  onCancel?: () => void
}

export function useLongPress(
  callback: () => void,
  { delay = 500, onStart, onCancel }: UseLongPressOptions = {}
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  const onStartRef = useRef(onStart)
  const onCancelRef = useRef(onCancel)

  // eslint-disable-next-line react-hooks/refs -- intentional: sync ref with latest callback during render to avoid stale closures
  callbackRef.current = callback
  // eslint-disable-next-line react-hooks/refs -- intentional: sync ref with latest onStart during render
  onStartRef.current = onStart
  // eslint-disable-next-line react-hooks/refs -- intentional: sync ref with latest onCancel during render
  onCancelRef.current = onCancel

  const start = useCallback(() => {
    onStartRef.current?.()
    timerRef.current = setTimeout(() => {
      callbackRef.current()
      timerRef.current = null
    }, delay)
  }, [delay])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      onCancelRef.current?.()
    }
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  }
}
