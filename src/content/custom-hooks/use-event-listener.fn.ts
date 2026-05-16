import { useEffect, useRef } from "react"

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: EventTarget = window
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!element?.addEventListener) return
    const listener = (event: Event) => savedHandler.current(event as WindowEventMap[K])
    element.addEventListener(eventName, listener)
    return () => element.removeEventListener(eventName, listener)
  }, [eventName, element])
}
