"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type SetValue<T> = (value: T | ((prev: T) => T)) => void

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, () => void] {
  const initialValueRef = useRef(initialValue)
  const prevKeyRef = useRef(key)

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  // Re-read from localStorage when key changes (e.g. navigating between quizzes)
  useEffect(() => {
    if (prevKeyRef.current === key) return
    prevKeyRef.current = key
    try {
      const raw = window.localStorage.getItem(key)
      setStoredValue(raw !== null ? (JSON.parse(raw) as T) : initialValueRef.current)
    } catch {
      setStoredValue(initialValueRef.current)
    }
  }, [key])

  const setValue: SetValue<T> = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value
        if (Object.is(next, prev)) return prev
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch (error) {
          if (error instanceof DOMException && error.name === "QuotaExceededError") {
            console.warn(`[React Dojo] localStorage quota exceeded for key "${key}".`)
          } else {
            console.error(`[React Dojo] Failed to persist "${key}":`, error)
          }
        }
        return next
      })
    },
    [key]
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
    } catch {}
    setStoredValue(initialValueRef.current)
  }, [key])

  return [storedValue, setValue, removeValue]
}
