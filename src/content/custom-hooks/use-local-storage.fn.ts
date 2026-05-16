import { useState, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next = value instanceof Function ? value(storedValue) : value
        setStoredValue(next)
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch (error) {
        console.error(error)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    setStoredValue(initialValue)
    window.localStorage.removeItem(key)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}
